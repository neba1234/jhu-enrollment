# Contributing to JHU Enrollment Dashboard

Thank you for your interest in contributing! This document outlines how to get involved.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/jhu-enrollment.git
   cd jhu-enrollment
   ```
3. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Backend (Django)
```bash
pip install -r requirements.txt
cp .env.example .env       # fill in Airtable credentials
python manage.py runserver 8000
```

### Frontend (React + Vite)
```bash
cd dashboard
npm install
npm run dev
```

Open http://localhost:5173/jhu-enrollment/ — the React app calls the Django API on port 8000.

## Making Changes

- **Data pipeline**: Modify `src/parse_data.py` or `src/airtable_upload.py`
- **API endpoints**: Edit `airtable_api/views.py`
- **Django config**: Edit `backend/settings.py`
- **Dashboard UI**: Edit files in `dashboard/src/components/`
- **Styles**: Update `dashboard/src/styles/global.css`
- **Test locally**: Run both Django (`manage.py runserver`) and Vite (`npm run dev`)

## Submitting Changes

1. **Commit** with clear messages:
   ```bash
   git commit -m "feat: add new insight card"
   ```
2. **Push** to your fork
3. **Open a Pull Request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots if UI changes

## Code Style

- **Python**: Follow PEP 8 (use `black` for formatting)
- **JavaScript**: Use ESLint (npm run lint in dashboard/)
- **Comments**: Keep them brief and meaningful

## Reporting Issues

Found a bug? Open an issue with:
- **Title**: Brief description
- **Description**: What went wrong and how to reproduce
- **Expected behavior**: What should happen
- **Screenshots**: If applicable

## Questions?

Feel free to open a discussion or issue. We're here to help!

---

Thanks for contributing! 🚀
