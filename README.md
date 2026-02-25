# JHU Government & Policy — Enrollment Data Pipeline & Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2%2B-green?logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)](https://vitejs.dev)

A full-stack solution for parsing, cleaning, uploading to Airtable, and visualizing enrollment data for the Johns Hopkins University School of Government & Policy.

🔗 **[Live Dashboard](https://neba1234.github.io/jhu-enrollment/)**

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Airtable Interface](#airtable-interface)
- [Key Findings](#key-findings)
- [Technical Decisions](#technical-decisions)
- [Requirements](#requirements)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

---

## Overview

This project addresses three deliverables:

1. **Data Cleaning** — Parse a raw CSV with deeply nested, multi-delimiter fields into normalized, relational tables.
2. **Airtable Integration** — Upload cleaned data to an Airtable base via the REST + Metadata APIs.
3. **Dean's Dashboard** — An interactive React visualization answering: *Where have we had the most impact?* and *Which cities are most engaged?*

---

## Project Structure

```
jhu-enrollment/
├── manage.py                      # Django management entry point
├── backend/                       # Django project settings
│   ├── settings.py                # Configuration (CORS, Airtable creds, etc.)
│   ├── urls.py                    # Root URL routing → /api/
│   └── wsgi.py                    # WSGI entry point
├── airtable_api/                  # Django app — Airtable proxy API
│   ├── views.py                   # GET /api/enrollments, /api/cities, /api/leaders
│   └── urls.py                    # App URL routing
├── src/
│   ├── parse_data.py              # Data parsing & normalization
│   └── airtable_upload.py         # Airtable API upload (creates fields + records)
├── data/
│   ├── enrollment_data.csv        # Raw source data
│   └── cleaned/                   # Generated clean CSVs + JSON
│       ├── leaders.csv
│       ├── cities.csv
│       ├── enrollments.csv
│       └── enrollment_data.json
├── dashboard/                     # React + Vite interactive dashboard
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx         # JHU-branded header
│   │   │   ├── KPIStrip.jsx       # 5 headline metric cards
│   │   │   ├── CityChart.jsx      # Stacked bar chart + city grid
│   │   │   ├── ProgramCharts.jsx  # BCPI/GovEx donut + course popularity
│   │   │   ├── Timeline.jsx       # Monthly enrollment area chart
│   │   │   ├── DetailTable.jsx    # Sortable, searchable table
│   │   │   ├── Insights.jsx       # 4 narrative takeaways
│   │   │   └── UI.jsx             # Shared Card, Badge, SectionTitle
│   │   ├── data/
│   │   │   ├── fetchAirtableData.js   # Django backend API client
│   │   │   └── useEnrollmentDataLive.js  # Live data hook (all derived metrics)
│   │   └── styles/
│   │       └── global.css
│   ├── package.json
│   └── vite.config.js
├── docs/                          # GitHub Pages build output
├── .env.example                   # Environment variable template
├── requirements.txt               # Python dependencies
└── README.md
```

---

## Quick Start

### Prerequisites

- **Python 3.10+** with pip
- **Node.js 18+** with npm
- An **Airtable account** (free tier works)

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the template and fill in your Airtable credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```dotenv
AIRTABLE_BASE_ID=appXXXXXXXXXX
AIRTABLE_PAT=patXXXXXXXXXX
```

### 3. Parse & Clean the Data

```bash
python src/parse_data.py
```

Output:
```
✅ Saved clean data to data/cleaned/
   • 20 leaders
   • 12 cities
   • 51 course enrollments
```

### 4. Upload to Airtable

```bash
python src/airtable_upload.py
```

> **⚠️ Note:** The script reads `AIRTABLE_PAT` and `AIRTABLE_BASE_ID` from the `.env` file (or environment variables). It creates all required fields via the Metadata API, then uploads records in batches of 10.

### 5. Start the Django Backend

```bash
python manage.py runserver 8000
```

This starts the API server at `http://localhost:8000` with three endpoints:
- `GET /api/enrollments`
- `GET /api/cities`
- `GET /api/leaders`

### 6. Start the React Dashboard

In a **second terminal**:

```bash
cd dashboard
npm install
npm run dev
```

Open **http://localhost:5173/jhu-enrollment/** in your browser.

---

## Architecture

### Data Flow

```
enrollment_data.csv
        ↓
  parse_data.py (normalize & validate)
        ↓
  cleaned/enrollment_data.json
        ↓
  airtable_upload.py (create schema + batch records)
        ↓
  Airtable Base (Leaders, Cities, Enrollments with linked records)
        ↓
  Django API (/api/leaders, /api/cities, /api/enrollments)
        ↓
  React Dashboard (localhost:5173)
```

### Component Architecture

**Backend (Django):**
- `parse_data.py` — Parses multi-delimiter CSV, creates relational DataFrames, exports JSON
- `airtable_upload.py` — Creates Airtable schema via Metadata API, uploads records via batch REST API
- `airtable_api/views.py` — Django views that proxy Airtable API calls securely (credentials stay server-side)

**Frontend (React + Vite):**
- `fetchAirtableData.js` — Fetches data from Django backend API
- `useEnrollmentDataLive.js` — Live data hook with derived metrics
- 8 React components — Focused presentation layer; no business logic
- Global CSS — Dark mode, animations, responsive design via CSS custom properties

---

## Airtable Interface

The Airtable Interface is kept private for safety. If needed, screenshots can be shared upon request.

---

## Key Findings

| Metric | Value |
|--------|-------|
| Government leaders enrolled | 20 |
| Cities reached | 12 |
| Course enrollments | 51 |
| Completion rate | 90% |
| Average score (completed) | 91.8% |

**Top cities by engagement:**

1. **Baltimore, MD** — 9 enrollments, 4 leaders, 92.1% avg score
2. **San Francisco, CA** — 8 enrollments, 3 leaders, 92.6% avg score
3. **Austin, TX** — 6 enrollments, 2 leaders, 93.5% avg score

**Program centers:** BCPI leads with 28 enrollments (55%), GovEx has 23 (45%).

---

## Technical Decisions

### Data Parsing
The raw CSV uses three layers of delimiters within single fields: pipes (`|`) for sub-records, tildes (`~`) for course attributes, and colons (`:`) for key-value pairs. The parser handles each layer independently, then joins on course name to match enrollments with completion statuses.

### Airtable Integration
The upload script uses the Airtable **Metadata API** (`/meta/bases/{id}/tables/{id}/fields`) to programmatically create fields with correct types (number, date, email, text) before uploading any records. Records are uploaded in batches of 10 with rate limiting (250ms between requests).

### Django Backend
A lightweight Django project serves as the API layer between the React frontend and Airtable. The `airtable_api` app provides three GET endpoints that proxy requests to Airtable with server-side authentication. `django-cors-headers` allows the Vite dev server to call the API cross-origin. No database is needed — Django acts purely as a secure proxy.

### React Dashboard
Built with **Vite + React + Recharts**. Component architecture separates data processing (`useEnrollmentDataLive` hook) from presentation (8 focused components). Live data is fetched from the Django backend API at runtime. JHU brand colors (navy, gold) are applied via CSS custom properties.

---

## Requirements

- Python 3.10+
- Django 4.2+
- `django-cors-headers`
- `python-dotenv`
- `pandas` >= 2.0
- `requests` >= 2.28
- Node.js 18+ (for React dashboard)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on setting up your development environment, making changes, and submitting pull requests.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full history of releases and features.

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

For questions or collaboration, reach out to the JHU School of Government & Policy team.

