# Vercel Backend Deployment Guide

This guide will help you deploy the Airtable backend API to Vercel safely with proper credential management.

## Prerequisites

- ✅ Vercel CLI installed (already done)
- 🔑 Airtable Personal Access Token (PAT)
- 🔑 Airtable Base ID

## Getting Your Airtable Credentials

### 1. Get Your Personal Access Token (PAT)

1. Go to https://airtable.com/create/tokens
2. Click "Create new token"
3. Name it: "JHU Enrollment Backend"
4. Add these scopes:
   - `data.records:read`
   - `schema.bases:read`
5. Add access to your specific base
6. Click "Create token"
7. **Copy the token immediately** (starts with `pat`)

### 2. Get Your Base ID

1. Go to https://airtable.com/api
2. Select your "JHU Enrollment" base
3. The Base ID is in the URL: `https://airtable.com/{BASE_ID}/api/docs`
4. Or find it in the introduction section (starts with `app`)

## Deployment Steps

### Option A: Deploy via Vercel Dashboard (Recommended - Most Secure)

1. **Push your code to GitHub** (if not already done):
   ```powershell
   git add .
   git commit -m "Add Vercel backend configuration"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository: `neba1234/jhu-enrollment`
   - Click "Import"

3. **Configure Build Settings**:
   - Framework Preset: `Other`
   - Root Directory: `./` (leave as is)
   - Build Command: `cd dashboard && npm run build`
   - Output Directory: `dashboard/dist`
   - Install Command: `cd dashboard && npm install`

4. **Add Environment Variables** (🔒 SECURE):
   - Click "Environment Variables"
   - Add two variables:
     ```
     Name: AIRTABLE_PAT
     Value: [paste your PAT here - starts with pat]
     Environment: Production, Preview, Development
     
     Name: AIRTABLE_BASE_ID
     Value: [paste your Base ID - starts with app]
     Environment: Production, Preview, Development
     ```
   - ⚠️ These are stored securely and NEVER exposed in your code

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for deployment
   - Your backend will be at: `https://jhu-enrollment.vercel.app`

### Option B: Deploy via CLI

1. **Link your project** (press Enter at the prompts):
   ```powershell
   vercel link
   ```
   - Select your scope (nebil's projects)
   - Name: `jhu-enrollment`
   - Link to existing: No

2. **Add environment variables** (🔒 SECURE):
   ```powershell
   # Add PAT (paste your token when prompted)
   vercel env add AIRTABLE_PAT production
   
   # Add Base ID (paste your ID when prompted)
   vercel env add AIRTABLE_BASE_ID production
   ```

3. **Deploy to production**:
   ```powershell
   vercel --prod
   ```

4. **Your backend is live!**
   - API endpoint: `https://jhu-enrollment.vercel.app/api/`
   - Test endpoints:
     - `https://jhu-enrollment.vercel.app/api/leaders`
     - `https://jhu-enrollment.vercel.app/api/cities`
     - `https://jhu-enrollment.vercel.app/api/enrollments`

## Testing the Backend

After deployment, verify your API works:

```powershell
# Test leaders endpoint
curl https://jhu-enrollment.vercel.app/api/leaders

# Test cities endpoint
curl https://jhu-enrollment.vercel.app/api/cities

# Test enrollments endpoint
curl https://jhu-enrollment.vercel.app/api/enrollments
```

You should see JSON responses with your Airtable data.

## Enable Live Mode in Dashboard

Once the backend is deployed and working:

1. **Edit `.env.local` in the dashboard folder**:
   ```env
   VITE_ENABLE_LIVE_MODE=true
   VITE_API_URL=https://jhu-enrollment.vercel.app
   ```

2. **Restart your dev server**:
   ```powershell
   cd dashboard
   npm run dev
   ```

3. **Verify live badge appears**:
   - Open http://localhost:5173/jhu-enrollment/
   - You should see "● LIVE" badge (yellow)
   - Click "Refresh" to fetch latest data from Airtable

## Security Notes

✅ **SAFE**:
- Airtable credentials stored in Vercel's encrypted environment
- Never committed to Git
- Never exposed in client-side code
- API endpoints run server-side with secret access

❌ **NEVER DO THIS**:
- Don't put credentials in `.env` files that get committed
- Don't hardcode API keys in source code
- Don't expose PATs in public repositories

## Troubleshooting

### Backend returns 404
- Check that `api/` folder contains leaders.js, cities.js, enrollments.js
- Verify `vercel.json` is in project root
- Re-deploy: `vercel --prod`

### "Airtable credentials not configured"
- Check environment variables in Vercel dashboard
- Settings → Environment Variables
- Make sure both `AIRTABLE_PAT` and `AIRTABLE_BASE_ID` are set

### CORS errors
- API files already include CORS headers
- If issues persist, check browser console for specific error

### Live mode shows FALLBACK
- Backend is deployed but API might be slow/error
- Check browser console for error details
- Verify Airtable credentials are correct

## Next Steps

After successful deployment:

1. ✅ Test all three API endpoints
2. ✅ Enable live mode in local development
3. ✅ Build and deploy frontend: `npm run build`
4. ✅ Push to GitHub Pages (auto-deploys)
5. ✅ Share live dashboard URL with team

Your live dashboard will automatically fetch fresh data from Airtable!
