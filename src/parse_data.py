"""
parse_data.py — Parse and normalize the JHU enrollment CSV.

The raw CSV contains pipe-delimited, tilde-delimited, and colon-delimited
nested fields. This module extracts them into clean, normalized DataFrames
ready for Airtable upload and analysis.
"""

import csv
import json
import os
import re
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

import pandas as pd


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class Leader:
    record_id: int
    name: str
    email: str
    title: str
    tenure_start: str
    tenure_end: str
    joined_date: str

@dataclass
class City:
    name: str
    state: str
    population: int
    region: str
    budget: str

@dataclass
class CourseEnrollment:
    record_id: int
    leader_name: str
    course_name: str
    duration_weeks: int
    start_date: str
    end_date: Optional[str]
    city: str
    state: str
    program_center: str
    completion_status: str
    score: Optional[int]


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def parse_leader(record_id: int, raw: str) -> Leader:
    """Parse leader_info field like:
    'Mayor Sarah Johnson|s.johnson@baltimore.gov|Title:Mayor|Tenure:2020-Present|Joined:2023-01-15'
    """
    parts = [p.strip() for p in raw.split("|")]
    name = parts[0] if parts else ""
    email = parts[1] if len(parts) > 1 else ""
    title = ""
    tenure_start, tenure_end = "", ""
    joined = ""

    for part in parts[2:]:
        if part.startswith("Title:"):
            title = part.split(":", 1)[1]
        elif part.startswith("Tenure:"):
            tenure_raw = part.split(":", 1)[1]
            if "-" in tenure_raw:
                tenure_start, tenure_end = tenure_raw.split("-", 1)
            else:
                tenure_start = tenure_raw
        elif part.startswith("Joined:"):
            joined = part.split(":", 1)[1]

    return Leader(
        record_id=record_id,
        name=name,
        email=email,
        title=title,
        tenure_start=tenure_start.strip(),
        tenure_end=tenure_end.strip(),
        joined_date=joined.strip(),
    )


def parse_city(raw: str) -> City:
    """Parse city_data field like:
    'Baltimore, MD|Population:585000|Region:Mid-Atlantic|Budget:$4.2B'
    """
    parts = [p.strip() for p in raw.split("|")]
    city_state = parts[0] if parts else ""
    city_name, state = "", ""
    if "," in city_state:
        city_name, state = [s.strip() for s in city_state.split(",", 1)]

    population = 0
    region = ""
    budget = ""
    for part in parts[1:]:
        if part.startswith("Population:"):
            population = int(part.split(":", 1)[1])
        elif part.startswith("Region:"):
            region = part.split(":", 1)[1]
        elif part.startswith("Budget:"):
            budget = part.split(":", 1)[1]

    return City(
        name=city_name, state=state, population=population,
        region=region, budget=budget,
    )


def parse_courses(raw: str) -> list[dict]:
    """Parse course_enrollment field like:
    'Data Governance Fundamentals~8 weeks~2023-02-01~2023-03-28|...'
    """
    courses = []
    for entry in raw.split("|"):
        entry = entry.strip()
        if not entry:
            continue
        segments = entry.split("~")
        name = segments[0].strip() if segments else ""
        duration_raw = segments[1].strip() if len(segments) > 1 else "0 weeks"
        duration_weeks = int(re.search(r"(\d+)", duration_raw).group(1)) if re.search(r"(\d+)", duration_raw) else 0
        start_date = segments[2].strip() if len(segments) > 2 else ""
        end_date = segments[3].strip() if len(segments) > 3 else None
        if end_date == "":
            end_date = None
        courses.append({
            "course_name": name,
            "duration_weeks": duration_weeks,
            "start_date": start_date,
            "end_date": end_date,
        })
    return courses


def parse_completions(raw: str) -> list[dict]:
    """Parse completion_status field like:
    'Completed:Data Governance Fundamentals:92%,Completed:Performance Management Systems:88%'
    """
    completions = []
    for entry in raw.split(","):
        entry = entry.strip()
        if not entry:
            continue
        parts = entry.split(":")
        status = parts[0].strip() if parts else ""
        course_name = parts[1].strip() if len(parts) > 1 else ""
        score_raw = parts[2].strip() if len(parts) > 2 else ""
        score = int(score_raw.replace("%", "")) if score_raw else None
        completions.append({
            "status": status,
            "course_name": course_name,
            "score": score,
        })
    return completions


def parse_program_centers(raw: str) -> list[str]:
    """Parse program_center field like 'GovEx,GovEx,BCPI'"""
    return [p.strip() for p in raw.split(",") if p.strip()]


# ---------------------------------------------------------------------------
# Main parsing pipeline
# ---------------------------------------------------------------------------

def parse_enrollment_csv(csv_path: str) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Parse the raw enrollment CSV and return three normalized DataFrames:
    - leaders_df: one row per leader
    - cities_df: one row per unique city
    - enrollments_df: one row per course enrollment (flattened)
    """
    leaders = []
    cities_seen = {}
    enrollments = []

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rid = int(row["record_id"])

            # Leader
            leader = parse_leader(rid, row["leader_info"])
            leaders.append(asdict(leader))

            # City (deduplicate)
            city = parse_city(row["city_data"])
            city_key = f"{city.name}, {city.state}"
            if city_key not in cities_seen:
                cities_seen[city_key] = asdict(city)

            # Courses + completions + centers
            courses = parse_courses(row["course_enrollment"])
            completions = parse_completions(row["completion_status"])
            centers = parse_program_centers(row["program_center"])

            # Build a lookup for completions by course name
            comp_lookup = {c["course_name"]: c for c in completions}

            for i, course in enumerate(courses):
                comp = comp_lookup.get(course["course_name"], {})
                center = centers[i] if i < len(centers) else ""
                enrollments.append(CourseEnrollment(
                    record_id=rid,
                    leader_name=leader.name,
                    course_name=course["course_name"],
                    duration_weeks=course["duration_weeks"],
                    start_date=course["start_date"],
                    end_date=course["end_date"],
                    city=city.name,
                    state=city.state,
                    program_center=center,
                    completion_status=comp.get("status", "Unknown"),
                    score=comp.get("score"),
                ))

    leaders_df = pd.DataFrame(leaders)
    cities_df = pd.DataFrame(list(cities_seen.values()))
    enrollments_df = pd.DataFrame([asdict(e) for e in enrollments])

    return leaders_df, cities_df, enrollments_df


def save_clean_data(leaders_df, cities_df, enrollments_df, output_dir: str):
    """Save cleaned DataFrames as CSVs and a combined JSON."""
    os.makedirs(output_dir, exist_ok=True)

    leaders_df.to_csv(os.path.join(output_dir, "leaders.csv"), index=False)
    cities_df.to_csv(os.path.join(output_dir, "cities.csv"), index=False)
    enrollments_df.to_csv(os.path.join(output_dir, "enrollments.csv"), index=False)

    # Replace NaN/NaT with None for valid JSON serialization
    def clean_for_json(df):
        return json.loads(df.to_json(orient="records"))

    combined = {
        "leaders": clean_for_json(leaders_df),
        "cities": clean_for_json(cities_df),
        "enrollments": clean_for_json(enrollments_df),
    }
    with open(os.path.join(output_dir, "enrollment_data.json"), "w") as f:
        json.dump(combined, f, indent=2)

    print(f"✅ Saved clean data to {output_dir}/")
    print(f"   • {len(leaders_df)} leaders")
    print(f"   • {len(cities_df)} cities")
    print(f"   • {len(enrollments_df)} course enrollments")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent
    csv_path = base_dir / "data" / "enrollment_data.csv"
    output_dir = base_dir / "data" / "cleaned"

    leaders_df, cities_df, enrollments_df = parse_enrollment_csv(str(csv_path))
    save_clean_data(leaders_df, cities_df, enrollments_df, str(output_dir))

    # Quick summary
    print("\n📊 Quick Stats:")
    print(f"   Completion rate: {(enrollments_df['completion_status'] == 'Completed').mean():.0%}")
    print(f"   Avg score (completed): {enrollments_df[enrollments_df['completion_status'] == 'Completed']['score'].mean():.1f}%")
    print(f"   Unique courses: {enrollments_df['course_name'].nunique()}")
    print(f"   Top city: {enrollments_df['city'].value_counts().index[0]} ({enrollments_df['city'].value_counts().values[0]} enrollments)")
