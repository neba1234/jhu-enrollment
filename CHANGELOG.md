# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-02-18

**Initial Submission** — Johns Hopkins University School of Government & Policy, Senior Full Stack Developer Exercise

### Added

- **Data Pipeline**
  - CSV parsing with multi-level delimiter handling (pipes, tildes, colons)
  - Normalized relational schema: Leaders, Cities, Enrollments
  - Data validation and error handling

- **Airtable Integration**
  - Programmatic schema creation via Metadata API
  - Batch record upload with rate limiting
  - Linked records for relational integrity (Leaders ↔ Enrollments, Cities ↔ Enrollments)
  - `Completed Flag` formula field for completion rate calculation

- **React Dashboard**
  - Interactive visualizations with Recharts and Lucide icons
  - 5 KPI metrics (total enrollments, completion rate, avg score, active programs, avg years)
  - City engagement analysis (stacked bar, interactive grid, top cities bar chart)
  - Program center analysis (BCPI vs GovEx donut, course popularity)
  - Monthly enrollment timeline with area chart
  - Sortable, searchable 51-row detail table
  - 4 executive insights summarizing key findings
  - Dark mode toggle with localStorage persistence
  - CSS animations (fadeIn, slideUp, pulse, shimmer)
  - Mobile-responsive design (breakpoints: 1400px, 1024px, 768px, 480px)
  - JHU brand colors (navy, gold) via CSS custom properties

- **Airtable Interface**
  - "Dean Review" interface with global filters
  - KPI tiles: Total Enrollments (102), Completion Rate (90%), Average Score (89%), Active Programs (2)
  - Charts: Enrollments by Program Center, Top Cities by Participation
  - Recent Enrollments table with key fields
  - Clean, executive-ready layout for leadership review

- **Documentation**
  - Comprehensive README with quick start, project structure, key findings
  - Airtable base setup guide with schema details
  - Contributing guidelines for future collaborators
  - Issue templates (bug reports, feature requests)
  - Pull request template
  - MIT License

- **GitHub Presence**
  - Professional repository on https://github.com/neba1234/jhu-enrollment
  - Live dashboard deployment on GitHub Pages: https://neba1234.github.io/jhu-enrollment/
  - Source control with meaningful commit history

### Key Metrics

- **Data**: 20 leaders, 12 cities, 51 course enrollments processed
- **Dashboard**: 8 components, 7 data-derived metrics, 51-row interactive table
- **Code**: ~4,000 lines across Python backend and React frontend
- **Tests**: Manual integration testing completed

### Technical Stack

- **Backend**: Python 3.10+, pandas, requests (Airtable API)
- **Frontend**: React 19.2.0, Vite 7.3.1, Recharts 3.7.0, Lucide React 0.564.0
- **Styling**: CSS custom properties, responsive design with clamp(), dark mode support
- **Deployment**: GitHub Pages (gh-pages branch)
- **Version Control**: Git with semantic commits

---

## Future Enhancements

- [ ] Real-time data syncing from Airtable API to React dashboard
- [ ] Additional filters and drill-down views in React dashboard
- [ ] Automated data refresh workflows in Airtable
- [ ] Export functionality (CSV, PDF reports)
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG AA)
