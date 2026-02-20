# JHU Enrollment Dashboard - Deployment Guide

## Current Status ✅

- **Local Build**: ✅ Working (npm run dev at http://localhost:5173/jhu-enrollment/)
- **Production Build**: ✅ Generated in `dashboard/dist/`
- **GitHub Pages Setup**: ✅ Configured in `/docs` folder
- **Live Badge**: ✅ Displays with dynamic date
- **Static Version**: ✅ Available at `/static.html`

---

## Quick Deployment to GitHub Pages

### Option 1: Automatic (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Dashboard

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd dashboard && npm install
      - name: Build
        run: cd dashboard && npm run build
      - name: Deploy to docs
        run: cp -r dashboard/dist/* docs/
      - name: Commit and push
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/
          git commit -m "chore: deploy dashboard [skip ci]" || true
          git push
```

### Option 2: Manual Deployment

```bash
# Build the dashboard
cd dashboard
npm run build

# Copy to deployment folder
cp -r dist/* ../docs/

# Commit and push
cd ..
git add docs/
git commit -m "deploy: update dashboard"
git push origin main
```

---

## Live Data Configuration (Optional)

### Vercel Backend Setup

If you want live Airtable data instead of static JSON:

1. **Create a Vercel Account** (free tier works)
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy the Backend**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add `AIRTABLE_PAT`: Your Personal Access Token
   - Add `AIRTABLE_BASE_ID`: Your base ID

4. **Update Frontend** (optional)
   - Frontend auto-detects the backend at `window.location.origin/api`
   - For custom domains, edit `src/data/fetchAirtableData.js`

---

## Environment Variables

### For Airtable (Python Scripts)

```powershell
# PowerShell
$env:AIRTABLE_PAT = "patXXXXXXXXXX"
$env:AIRTABLE_BASE_ID = "appXXXXXXXXXX"
python src/airtable_upload.py
```

```bash
# macOS/Linux
export AIRTABLE_PAT="patXXXXXXXXXX"
export AIRTABLE_BASE_ID="appXXXXXXXXXX"
python src/airtable_upload.py
```

### For Vercel Backend

```
AIRTABLE_PAT      | Your Airtable Personal Access Token
AIRTABLE_BASE_ID  | Your Airtable Base ID
```

---

## Troubleshooting

### Dashboard shows old data
1. ✅ **Static.html** works with bundled JSON
2. **Live mode** requires Vercel backend + Airtable credentials
3. **Check console** for error messages

### Live badge not showing
- Verify Vercel backend is deployed and environment variables are set
- Check browser console (`F12`) for API errors
- Dashboard gracefully falls back to static data if backend is unavailable

### static.html returns 404
- Rebuild: `cd dashboard && npm run build`
- Redeploy: `cp -r dist/* ../docs/`
- Verify `docs/static.html` exists

### Build errors
```bash
cd dashboard
npm install          # Reinstall dependencies
npm run lint         # Check for issues
npm run build        # Rebuild
```

---

## File Structure

```
jhu-enrollment/
├── docs/                    # ← GitHub Pages deployment folder
│   ├── index.html           # Live dashboard
│   ├── static.html          # Static fallback
│   └── assets/
├── dashboard/               # React app
│   ├── dist/                # Built output (copy to docs/)
│   ├── src/
│   │   ├── App.jsx          # Live mode (Airtable)
│   │   ├── AppStatic.jsx    # Static mode (JSON)
│   │   └── components/
│   └── vite.config.js
├── api/                     # ← Vercel serverless functions
│   ├── leaders.js
│   ├── cities.js
│   └── enrollments.js
└── vercel.json             # ← Deployment config
```

---

## Verification Checklist

- [ ] `npm run build` completes without errors
- [ ] `docs/index.html` exists and contains `<div id="root"></div>`
- [ ] `docs/static.html` exists and contains `<div id="root"></div>`
- [ ] `docs/assets/` contains CSS and JS files
- [ ] Git: `git status` shows `docs/` changes ready to commit
- [ ] GitHub Pages enabled at repo → Settings → Pages → Deploy from branch (main, /docs)
- [ ] Visit `https://YOUR_USERNAME.github.io/jhu-enrollment/` and verify loading

---

## Deployment Checklist

### Before Going Live

- [ ] Update `enrollment_data.json` with current data
- [ ] Test locally: `npm run dev` → http://localhost:5173/jhu-enrollment/
- [ ] Build: `npm run build`
- [ ] Verify both `index.html` and `static.html` work locally
- [ ] Copy to `docs/`: `cp -r dashboard/dist/* docs/`
- [ ] Commit: `git add -A && git commit -m "Deploy dashboard"`
- [ ] Push: `git push origin main`

### After Deployment

- [ ] Visit live URL and verify loading
- [ ] Check live badge (should show "● LIVE" if backend available)
- [ ] Test static version at `/static.html`
- [ ] Verify data is current
- [ ] Monitor browser console for errors

---

## Performance Settings

### Vite Build Optimization

Current `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/jhu-enrollment/',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        static: './static.html',
      },
    },
  },
})
```

For faster builds, add chunk splitting:
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'recharts': ['recharts'],
        'lucide': ['lucide-react'],
      },
    },
  },
}
```

---

## Support

For issues or questions:
1. Check browser console (`F12` → Console tab)
2. Review GitHub Actions logs (if using automation)
3. Verify Airtable credentials are configured
4. Verify GitHub Pages is enabled in Settings

---

**Last Updated**: February 19, 2026
**Version**: 1.0
