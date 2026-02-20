# 🚀 HYBRID DEPLOYMENT GUIDE
# Frontend: GitHub Pages | Backend: Vercel

## STEP 1: GET YOUR AIRTABLE CREDENTIALS (5 minutes)

### A. Get Personal Access Token (PAT)
1. Go to: https://airtable.com/create/tokens
2. Click "Create new token"
3. Name: "JHU Enrollment Backend API"
4. Add scopes:
   ✓ data.records:read
   ✓ schema.bases:read
5. Add access to your "JHU Enrollment" base
6. Click "Create token"
7. COPY the token immediately (starts with "pat")
   ⚠️ You won't see it again!

### B. Get Base ID
1. Go to: https://airtable.com/api
2. Select your "JHU Enrollment" base
3. Copy the Base ID from URL or docs (starts with "app")

---

## STEP 2: DEPLOY BACKEND TO VERCEL (10 minutes)

### Method A: Vercel Dashboard (EASIEST - RECOMMENDED)

1. **Go to Vercel**
   https://vercel.com/new

2. **Import GitHub Repository**
   - Search for: neba1234/jhu-enrollment
   - Click "Import"

3. **Configure Project**
   - Framework Preset: "Other"
   - Root Directory: ./
   - Build Command: cd dashboard && npm run build
   - Output Directory: dashboard/dist
   - Install Command: cd dashboard && npm install

4. **🔒 ADD ENVIRONMENT VARIABLES (CRITICAL)**
   Click "Environment Variables" and add TWO variables:
   
   Variable 1:
   ┌─────────────────────────────────────────────┐
   │ Name:  AIRTABLE_PAT                         │
   │ Value: [paste your token - starts with pat] │
   │ Apply to: ☑ Production ☑ Preview ☑ Dev     │
   └─────────────────────────────────────────────┘
   
   Variable 2:
   ┌─────────────────────────────────────────────┐
   │ Name:  AIRTABLE_BASE_ID                     │
   │ Value: [paste your ID - starts with app]    │
   │ Apply to: ☑ Production ☑ Preview ☑ Dev     │
   └─────────────────────────────────────────────┘

5. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your backend will be at: https://jhu-enrollment.vercel.app

### Method B: Vercel CLI (ALTERNATIVE)

```powershell
# Link project
vercel

# Add environment variables (will prompt for values)
vercel env add AIRTABLE_PAT production
# Paste your PAT when prompted

vercel env add AIRTABLE_BASE_ID production
# Paste your Base ID when prompted

# Deploy to production
vercel --prod
```

---

## STEP 3: TEST BACKEND (2 minutes)

After deployment, run this script:

```powershell
.\test-backend.ps1
```

Expected output:
```
Testing: https://jhu-enrollment.vercel.app/api/leaders
  ✅ SUCCESS - 20 records returned

Testing: https://jhu-enrollment.vercel.app/api/cities
  ✅ SUCCESS - 12 records returned

Testing: https://jhu-enrollment.vercel.app/api/enrollments
  ✅ SUCCESS - 51 records returned
```

If you see ❌ FAILED:
- Status 404: Backend not deployed, try deploying again
- Status 500: Wrong credentials, check environment variables in Vercel dashboard
- Status 403: PAT doesn't have proper scopes/access

---

## STEP 4: UPDATE FRONTEND FOR PRODUCTION (1 minute)

The frontend needs to know to use live mode when deployed.

We'll configure it to:
- Use Vercel backend when on GitHub Pages
- Auto-detect and enable live mode

I'll help you with this after backend is deployed.

---

## STEP 5: BUILD & DEPLOY FRONTEND (3 minutes)

```powershell
# Build with production config
cd dashboard
npm run build

# Copy to docs/ for GitHub Pages
cd ..
Copy-Item -Path dashboard/dist/* -Destination docs -Recurse -Force

# Commit and push
git add docs/
git commit -m "Update GitHub Pages with Vercel backend integration"
git push origin main
```

Wait 2-3 minutes for GitHub Pages to update.

---

## STEP 6: VERIFY LIVE MODE (1 minute)

1. Open: https://neba1234.github.io/jhu-enrollment/
2. Look for: 🟡 ● LIVE badge in header
3. Click "Refresh" button
4. Data should update from Airtable

---

## 🔒 SECURITY CHECKLIST

✅ Airtable PAT stored only in Vercel (encrypted)
✅ Never committed to Git
✅ Never exposed in browser/frontend code
✅ API runs server-side only
✅ Frontend makes HTTPS requests to Vercel
✅ CORS configured properly

---

## 📊 ARCHITECTURE

```
┌──────────────────────┐
│  User's Browser      │
│  (GitHub Pages)      │
│  neba1234.github.io  │
└──────────┬───────────┘
           │ HTTPS
           │
           ↓
┌──────────────────────┐
│  Vercel Backend      │
│  (Serverless API)    │
│  jhu-enrollment      │
│  .vercel.app         │
└──────────┬───────────┘
           │ API Call
           │ (with PAT)
           ↓
┌──────────────────────┐
│  Airtable            │
│  (Your Database)     │
└──────────────────────┘
```

Frontend → Vercel Backend → Airtable
(Public)   (Secure API)    (Private)

---

## NEXT STEP

Run this command to check if you already have Airtable credentials:

```powershell
python verify_airtable.py
```

Or tell me when you're ready and I'll walk you through deploying to Vercel!
