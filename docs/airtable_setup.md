# Airtable Base Setup Guide

## Prerequisites

1. An Airtable account (free tier works)
2. A Personal Access Token (PAT) from [airtable.com/create/tokens](https://airtable.com/create/tokens)
   - Grant scopes: `data.records:write`, `schema.bases:read`
3. A new Airtable base (or an existing one)

## Creating Your Base

### Option A: Automatic Upload (Recommended)

The `airtable_upload.py` script creates records with `typecast: true`, which auto-creates select field options. You just need to create three empty tables with the correct names:

1. Create a new Airtable base
2. Rename the default table to **Leaders**
3. Add a new table called **Cities**
4. Add a new table called **Enrollments**
5. Run the upload script

### Option B: Pre-configured Tables

If you prefer to set up field types in advance:

#### Leaders Table

| Field | Type | Notes |
|---|---|---|
| Record ID | Number (integer) | From source CSV |
| Name | Single line text | Full name with title |
| Email | Email | Government email |
| Title | Single line text | Government title |
| Tenure Start | Single line text | Year started |
| Tenure End | Single line text | "Present" or year |
| Joined Date | Date | Program join date |

#### Cities Table

| Field | Type | Notes |
|---|---|---|
| City | Single line text | City name |
| State | Single line text | Two-letter state code |
| Population | Number (integer) | City population |
| Region | Single select | e.g., Mid-Atlantic, West Coast |
| Budget | Single line text | City budget (e.g., "$4.2B") |

#### Enrollments Table

| Field | Type | Notes |
|---|---|---|
| Course Name | Single line text | Full course title |
| Duration (Weeks) | Number (integer) | Course length |
| Start Date | Date | Course start |
| End Date | Date | Course end (blank if in progress) |
| Program Center | Single select | GovEx or BCPI |
| Status | Single select | Completed or In Progress |
| Leader Name | Single line text | Leader's full name |
| City | Single line text | City name |
| State | Single line text | State code |
| Score (%) | Number (integer) | Completion percentage |
| Leader | Link to Leaders | Linked record |
| City Link | Link to Cities | Linked record |

## Running the Upload

```bash
export AIRTABLE_PAT="patXXXXXXXXXXXXXX"
export AIRTABLE_BASE_ID="appXXXXXXXXXXXXXX"
python src/airtable_upload.py
```

The base ID can be found in the Airtable URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`

## Troubleshooting

- **422 errors**: Usually means a table name doesn't match. Table names are case-sensitive.
- **401 errors**: Check that your PAT is valid and has the correct scopes.
- **Rate limiting**: The script includes a 250ms delay between batches. If you hit limits, increase the `time.sleep()` value.
