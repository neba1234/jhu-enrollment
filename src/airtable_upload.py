"""
airtable_upload.py — Upload cleaned enrollment data to Airtable.

Usage (PowerShell):
    $env:AIRTABLE_PAT = "pat..."          # PAT = Personal Access Token
    $env:AIRTABLE_BASE_ID = "app..."
    # Optional (only if your workspace requires it for Metadata API):
    $env:AIRTABLE_CLIENT_SECRET = "..."
    py src/airtable_upload.py

Dependencies:
    pip install pandas requests
"""

import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
import requests

# Ensure we can import parse_data.py from the same folder as this script
sys.path.insert(0, str(Path(__file__).resolve().parent))
from parse_data import parse_enrollment_csv  # noqa: E402


AIRTABLE_API_URL = "https://api.airtable.com/v0"


def get_headers() -> Dict[str, str]:
    token = os.environ.get("AIRTABLE_PAT")
    if not token:
        raise EnvironmentError("Missing AIRTABLE_PAT (Personal Access Token) environment variable.")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    # Optional: required for some accounts for Metadata API calls
    client_secret = os.environ.get("AIRTABLE_CLIENT_SECRET")
    if client_secret:
        headers["X-Airtable-Client-Secret"] = client_secret

    return headers


def get_base_id() -> str:
    base_id = os.environ.get("AIRTABLE_BASE_ID")
    if not base_id:
        raise EnvironmentError("Missing AIRTABLE_BASE_ID environment variable.")
    return base_id


def get_base_schema(base_id: str, headers: Dict[str, str]) -> Dict[str, Dict[str, Any]]:
    url = f"https://api.airtable.com/v0/meta/bases/{base_id}/tables"
    resp = requests.get(url, headers=headers, timeout=30)
    if resp.status_code != 200:
        print(f"  Could not read base schema: {resp.status_code} {resp.text}")
        return {}

    tables: Dict[str, Dict[str, Any]] = {}
    for table in resp.json().get("tables", []):
        field_names = [f["name"] for f in table.get("fields", [])]
        tables[table["name"]] = {"id": table["id"], "fields": field_names}
    return tables


def create_field(
    base_id: str,
    table_id: str,
    field_name: str,
    field_config: Dict[str, Any],
    headers: Dict[str, str],
) -> bool:
    """Create a single field in a table. field_config = {"type": ..., "options": ...}"""
    url = f"https://api.airtable.com/v0/meta/bases/{base_id}/tables/{table_id}/fields"
    payload = {"name": field_name, **field_config}

    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    if resp.status_code in (200, 201):
        return True

    try:
        err = resp.json().get("error", {}).get("message", resp.text)
    except Exception:
        err = resp.text

    if "already exists" in str(err).lower() or "duplicate" in str(err).lower():
        return True

    print(f"    Warning: Could not create '{field_name}': {err}")
    return False


def ensure_fields(
    base_id: str,
    table_id: str,
    existing_fields: List[str],
    needed_fields: Dict[str, Dict[str, Any]],
    headers: Dict[str, str],
) -> None:
    for field_name, field_config in needed_fields.items():
        if field_name not in existing_fields:
            create_field(base_id, table_id, field_name, field_config, headers)
            time.sleep(0.25)


def batch_create_records(
    base_id: str,
    table_name: str,
    records: List[Dict[str, Any]],
    headers: Dict[str, str],
) -> List[str]:
    url = f"{AIRTABLE_API_URL}/{base_id}/{table_name}"
    created_ids: List[str] = []

    for i in range(0, len(records), 10):
        batch = records[i : i + 10]
        payload = {"records": [{"fields": r} for r in batch], "typecast": True}
        resp = requests.post(url, headers=headers, json=payload, timeout=30)

        if resp.status_code == 200:
            result = resp.json()
            created_ids.extend([r["id"] for r in result.get("records", [])])
            print(f"  ✓ Uploaded batch {i // 10 + 1} ({len(batch)} records)")
        else:
            try:
                err = resp.json().get("error", {}).get("message", resp.text)
            except Exception:
                err = resp.text
            print(f"  ✗ Error {resp.status_code}: {err}")
            return created_ids

        time.sleep(0.25)

    return created_ids


# ---------------- Field definitions ----------------

NUMBER_INT = {"type": "number", "options": {"precision": 0}}
TEXT = {"type": "singleLineText"}
DATE = {"type": "date"}  # simpler & reliable with ISO strings
EMAIL = {"type": "email"}

LEADERS_FIELDS = {
    "Record ID": NUMBER_INT,
    "Email": EMAIL,
    "Title": TEXT,
    "Tenure Start": TEXT,
    "Tenure End": TEXT,
    "Joined Date": DATE,
}

CITIES_FIELDS = {
    "State": TEXT,
    "Population": NUMBER_INT,
    "Region": TEXT,
    "Budget": TEXT,
}

ENROLLMENTS_FIELDS = {
    "Course Name": TEXT,  # IMPORTANT: you upload this field
    "Duration (Weeks)": NUMBER_INT,
    "Start Date": DATE,
    "End Date": DATE,
    "Program Center": TEXT,
    "Status": TEXT,
    "Leader Name": TEXT,
    "City": TEXT,
    "State": TEXT,
    "Score (%)": NUMBER_INT,
}


def main() -> None:
    base_dir = Path(__file__).resolve().parent.parent
    csv_path = base_dir / "data" / "enrollment_data.csv"

    print("Parsing enrollment data...")
    leaders_df, cities_df, enrollments_df = parse_enrollment_csv(str(csv_path))
    print(f"   Parsed {len(leaders_df)} leaders, {len(cities_df)} cities, {len(enrollments_df)} enrollments")

    headers = get_headers()
    base_id = get_base_id()

    print("\nReading base schema...")
    schema = get_base_schema(base_id, headers)

    for table_name in ["Leaders", "Cities", "Enrollments"]:
        if table_name not in schema:
            print(f"  Table '{table_name}' not found! Please create it in Airtable.")
            return

    print("\nCreating fields...")
    print("  Leaders table...")
    ensure_fields(base_id, schema["Leaders"]["id"], schema["Leaders"]["fields"], LEADERS_FIELDS, headers)
    print("  Cities table...")
    ensure_fields(base_id, schema["Cities"]["id"], schema["Cities"]["fields"], CITIES_FIELDS, headers)
    print("  Enrollments table...")
    ensure_fields(base_id, schema["Enrollments"]["id"], schema["Enrollments"]["fields"], ENROLLMENTS_FIELDS, headers)

    print("\nUploading Leaders...")
    leader_records: List[Dict[str, Any]] = []
    for _, row in leaders_df.iterrows():
        leader_records.append(
            {
                "Record ID": int(row["record_id"]),
                "Name": row["name"],
                "Email": row["email"],
                "Title": row["title"],
                "Tenure Start": row["tenure_start"],
                "Tenure End": row["tenure_end"],
                "Joined Date": row["joined_date"],
            }
        )
    batch_create_records(base_id, "Leaders", leader_records, headers)

    print("\nUploading Cities...")
    city_records: List[Dict[str, Any]] = []
    for _, row in cities_df.iterrows():
        city_records.append(
            {
                "City": row["name"],
                "State": row["state"],
                "Population": int(row["population"]),
                "Region": row["region"],
                "Budget": row["budget"],
            }
        )
    batch_create_records(base_id, "Cities", city_records, headers)

    print("\nUploading Enrollments...")
    enrollment_records: List[Dict[str, Any]] = []
    for _, row in enrollments_df.iterrows():
        record: Dict[str, Any] = {
            "Course Name": row["course_name"],
            "Duration (Weeks)": int(row["duration_weeks"]),
            "Start Date": row["start_date"],
            "Program Center": row["program_center"],
            "Status": row["completion_status"],
            "Leader Name": row["leader_name"],
            "City": row["city"],
            "State": row["state"],
        }
        if pd.notna(row.get("end_date")) and row.get("end_date"):
            record["End Date"] = row["end_date"]
        if pd.notna(row.get("score")):
            record["Score (%)"] = int(row["score"])
        enrollment_records.append(record)

    batch_create_records(base_id, "Enrollments", enrollment_records, headers)

    print("\nUpload complete!")
    print(f"   View your base: https://airtable.com/{base_id}")


if __name__ == "__main__":
    main()
