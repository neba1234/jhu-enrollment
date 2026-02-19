"""Quick script to verify Airtable data upload"""
import os
import requests

AIRTABLE_PAT = "patPg3RGocHleCL6M.44edb9dc595548e9387acbdc56c9e2f785690f92f0582b0e76055dc0f2a3bd92"
BASE_ID = "appWbdCKnXLbCLIY6"

headers = {
    "Authorization": f"Bearer {AIRTABLE_PAT}",
    "Content-Type": "application/json",
}

# Get base schema
print("Fetching base schema...")
schema_url = f"https://api.airtable.com/v0/meta/bases/{BASE_ID}/tables"
resp = requests.get(schema_url, headers=headers, timeout=30)

if resp.status_code == 200:
    tables = resp.json().get("tables", [])
    print(f"\n✓ Found {len(tables)} tables in your base:\n")
    
    for table in tables:
        print(f"  📊 {table['name']} (ID: {table['id']})")
        print(f"      Fields: {', '.join([f['name'] for f in table['fields']])}")
        
        # Get record count
        records_url = f"https://api.airtable.com/v0/{BASE_ID}/{table['id']}?maxRecords=3"
        records_resp = requests.get(records_url, headers=headers, timeout=30)
        
        if records_resp.status_code == 200:
            records = records_resp.json().get("records", [])
            print(f"      Records: {len(records)}+ records found")
            
            # Show sample record
            if records:
                print(f"      Sample: {records[0].get('fields', {})}")
        print()
else:
    print(f"Error: {resp.status_code} - {resp.text}")
