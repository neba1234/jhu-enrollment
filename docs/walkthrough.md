# Step-by-Step Walkthrough: JHU Enrollment Pipeline

A hands-on guide to running the complete pipeline — from raw CSV to Airtable to the Dean's dashboard.

---

## Prerequisites

Before we start, make sure you have:

- **Python 3.10+** installed (`python --version` to check)
- A **terminal** (Terminal on Mac, PowerShell/WSL on Windows, or any Linux shell)
- An **Airtable account** (free tier is fine — sign up at [airtable.com](https://airtable.com))
- A **web browser** (for the dashboard)

---

## STEP 1: Clone the Repository & Install Dependencies

Open your terminal and run:

```bash
# Clone the repo (replace with your actual GitHub URL)
git clone https://github.com/YOUR-USERNAME/jhu-enrollment.git
cd jhu-enrollment

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

You should see `pandas` and `requests` install successfully. Verify with:

```bash
pip list | grep -E "pandas|requests"
```

---

## STEP 2: Run the Data Parser

This step reads the raw `data/enrollment_data.csv` and produces clean, normalized tables.

```bash
python src/parse_data.py
```

**What you should see:**

```
✅ Saved clean data to /path/to/jhu-enrollment/data/cleaned/
   • 20 leaders
   • 12 cities
   • 51 course enrollments

📊 Quick Stats:
   Completion rate: 90%
   Avg score (completed): 91.8%
   Unique courses: 20
   Top city: Baltimore (9 enrollments)
```

**What it created in `data/cleaned/`:**

| File | Contents |
|------|----------|
| `leaders.csv` | 20 rows — one per government leader |
| `cities.csv` | 12 rows — one per unique city |
| `enrollments.csv` | 51 rows — one per course enrollment |
| `enrollment_data.json` | Combined JSON (used by the dashboard) |

**Inspect the output** (optional):

```bash
# Check leaders
head -5 data/cleaned/leaders.csv

# Check enrollments
head -5 data/cleaned/enrollments.csv

# Pretty-print the JSON
python -m json.tool data/cleaned/enrollment_data.json | head -30
```

---

## STEP 3: Set Up Airtable

### 3A. Create a New Base

1. Go to [airtable.com](https://airtable.com) and log in
2. Click **"+ Add a base"** → **"Start from scratch"**
3. Name it **"JHU Enrollment Data"**

### 3B. Create the Three Tables

You need three tables. Airtable starts you with one default table — rename it and add two more:

**Table 1: Leaders**
1. Click the default table tab and rename it to **Leaders**
2. You don't need to set up columns — the script handles this with `typecast: true`

**Table 2: Cities**
1. Click the **"+"** tab next to "Leaders" to add a new table
2. Select **"Create empty table"**
3. Name it **Cities**

**Table 3: Enrollments**
1. Add another table the same way
2. Name it **Enrollments**

> **Important:** Table names are case-sensitive. They must be exactly: `Leaders`, `Cities`, `Enrollments`.

### 3C. Get Your API Credentials

You need two things: a **Personal Access Token** and your **Base ID**.

**Personal Access Token (PAT):**
1. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Click **"Create new token"**
3. Name it: `jhu-enrollment-upload`
4. Under **Scopes**, add:
   - `data.records:write`
   - `data.records:read`
   - `schema.bases:read`
5. Under **Access**, select your "JHU Enrollment Data" base
6. Click **"Create token"** and **copy the token** (starts with `pat...`)

**Base ID:**
1. Open your Airtable base in the browser
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. The part starting with `app` is your Base ID

---

## STEP 4: Upload to Airtable

Set your credentials as environment variables and run the upload:

```bash
# Mac/Linux
export AIRTABLE_PAT="patXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export AIRTABLE_BASE_ID="appXXXXXXXXXXXXXX"

# Windows PowerShell
$env:AIRTABLE_PAT = "patXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
$env:AIRTABLE_BASE_ID = "appXXXXXXXXXXXXXX"

# Run the upload
python src/airtable_upload.py
```

**What you should see:**

```
🔄 Parsing enrollment data...
   Parsed 20 leaders, 12 cities, 51 enrollments

📤 Uploading Leaders...
  ✓ Uploaded batch 1 (10 records)
  ✓ Uploaded batch 2 (10 records)

📤 Uploading Cities...
  ✓ Uploaded batch 1 (10 records)
  ✓ Uploaded batch 2 (2 records)

📤 Uploading Enrollments...
  ✓ Uploaded batch 1 (10 records)
  ✓ Uploaded batch 2 (10 records)
  ✓ Uploaded batch 3 (10 records)
  ✓ Uploaded batch 4 (10 records)
  ✓ Uploaded batch 5 (10 records)
  ✓ Uploaded batch 6 (1 records)

✅ Upload complete!
   View your base: https://airtable.com/appXXXXXXXXXXXXXX
```

### Verify in Airtable

1. Open your base at the URL shown in the output
2. You should see all three tables populated:
   - **Leaders**: 20 records with Name, Email, Title, etc.
   - **Cities**: 12 records with Population, Region, Budget
   - **Enrollments**: 51 records with Course Name, Status, Score

### Troubleshooting

| Error | Fix |
|-------|-----|
| `Missing AIRTABLE_PAT` | Make sure you exported the env variable in the same terminal session |
| `Error 422` | Table name mismatch — check exact spelling and capitalization |
| `Error 401` | Your PAT is invalid or expired — regenerate it |
| `Error 403` | Your PAT doesn't have access to this base — update token permissions |

---

## STEP 5: View the Dashboard

The dashboard is a self-contained HTML file with zero dependencies.

```bash
# Mac
open visualizations/dashboard.html

# Windows
start visualizations/dashboard.html

# Linux
xdg-open visualizations/dashboard.html
```

The dashboard shows:

- **KPI strip** — 5 headline metrics (leaders, cities, enrollments, completion rate, avg score)
- **City engagement bars** — Bar chart showing enrollment volume per city
- **City map grid** — Bubble grid showing geographic spread and regional context
- **Program center rings** — BCPI vs GovEx enrollment split with avg scores
- **Course popularity** — Top 7 most enrolled courses
- **Leader detail table** — Full 51-row table sortable by city, with status badges and score indicators
- **Key insights** — 4 narrative takeaways for the Dean

---

## STEP 6: (Optional) Customize for Your Needs

### Change the Dashboard Branding

Open `visualizations/dashboard.html` and search for these CSS variables at the top to adjust colors:

```css
--navy: #002D72;      /* Primary dark blue */
--gold: #CF8A00;      /* Accent gold */
--warm-white: #FAF8F5; /* Background */
```

### Re-run with New Data

If you receive an updated CSV, just replace `data/enrollment_data.csv` and run:

```bash
python src/parse_data.py           # Re-parse
python src/airtable_upload.py      # Re-upload (creates new records)
```

> Note: The Airtable upload creates new records each time. To avoid duplicates, clear existing records in Airtable first, or add deduplication logic.

### Export the Dashboard as PDF

Open the dashboard in Chrome → File → Print → Save as PDF. The stylesheet includes print-optimized styles.

---

## Summary

| Step | Command | What It Does |
|------|---------|--------------|
| 1 | `pip install -r requirements.txt` | Install Python dependencies |
| 2 | `python src/parse_data.py` | Parse raw CSV → clean CSVs + JSON |
| 3 | *(Airtable web UI)* | Create base with 3 tables + get API credentials |
| 4 | `python src/airtable_upload.py` | Upload 20 leaders, 12 cities, 51 enrollments |
| 5 | `open visualizations/dashboard.html` | View the Dean's interactive dashboard |

Total time: ~15 minutes.
