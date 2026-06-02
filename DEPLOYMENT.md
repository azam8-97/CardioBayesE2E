# CardioBayes-E2E Deployment Guide

## Quick Start for GitHub → Vercel (Frontend) + Render (Backend)

### Prerequisites
- GitHub account with push access to https://github.com/azam8-97/CardioBayesE2E
- Vercel account (https://vercel.com)
- Render account (https://render.com)
- Supabase project (already created)
- HuggingFace Space (already deployed)

---

## Step 1: Prepare Local Repository

### 1.1 Create `.env.local` files (NOT committed to GitHub)

**backend/.env** (already created, DO NOT PUSH)
```bash
# Copy .env.example and fill in your real credentials
cp backend/.env.example backend/.env
# Edit backend/.env with real values from Supabase and HuggingFace
```

**frontend/.env** (already created, DO NOT PUSH)
```bash
# For local development
VITE_API_BASE_URL=http://localhost:8000
```

### 1.2 Verify .gitignore Files
- Root `.gitignore` created ✓ (excludes .env files)
- `frontend/.gitignore` updated ✓ (includes .env)
- `backend/` uses root .gitignore ✓

### 1.3 Test That Secrets Are Not Staged
```bash
git status
# Should NOT show: .env, .env.local, or any credential files
```

---

## Step 2: Push to GitHub

```bash
cd d:\Projects\CardioBayes-E2E

# Initialize git (if not done)
git init
git remote add origin https://github.com/azam8-97/CardioBayesE2E.git

# Add all files (except ignored ones)
git add .

# Verify .env files are NOT included
git status

# Commit
git commit -m "Initial commit: CardioBayes-E2E with frontend and backend"

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Connect GitHub to Vercel
1. Go to https://vercel.com/new
2. Import GitHub repo: `azam8-97/CardioBayesE2E`
3. Select root directory: `frontend/`
4. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3.2 Add Environment Variables
In Vercel project settings → Environment Variables:
```
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```
(Get the Render URL after deploying backend)

### 3.3 Deploy
Click "Deploy" - Vercel automatically builds from GitHub

---

## Step 4: Deploy Backend on Render

### 4.1 Connect GitHub to Render
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Select GitHub repo: `CardioBayesE2E`
4. Configure:
   - **Name:** `cardiobayese2e-api`
   - **Root Directory:** `backend/`
   - **Runtime:** `Python 3.10`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### 4.2 Add Environment Variables
In Render dashboard → Environment:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
HUGGINGFACE_INFERENCE_URL=https://your-username-your-space.hf.space
HUGGINGFACE_SERVICE_KEY=hf_your_access_token_here
SECRET_KEY=generate-secure-random-string-here
JWT_SECRET=generate-another-random-string-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

### 4.3 Deploy
Click "Deploy" - Render automatically deploys from GitHub

### 4.4 Get Backend URL
After deploy, you'll get a URL like: `https://cardiobayese2e-api.onrender.com`

---

## Step 5: Update Frontend with Backend URL

### 5.1 Update Vercel Environment Variable
1. Go to Vercel project settings
2. Update `VITE_API_BASE_URL` with Render backend URL:
   ```
   VITE_API_BASE_URL=https://cardiobayese2e-api.onrender.com
   ```
3. Trigger redeploy (or push a new commit to main branch)

---

## Step 6: Apply Database Schema (if not done)

In Supabase SQL Editor, run:
```sql
-- Copy contents of backend/supabase_schema.sql
-- Paste and execute in Supabase SQL Editor
```

---

## Step 7: Test Live Application

1. **Frontend:** https://your-vercel-url.vercel.app
2. **Backend API:** https://cardiobayese2e-api.onrender.com/api/v1/health
3. **Test Flow:**
   - Register account
   - Login
   - Upload ECG file
   - Check results

---

## Troubleshooting

### Backend won't start on Render
- Check Render logs: `Settings → Logs`
- Verify all environment variables are set
- Check `requirements.txt` exists in backend/
- Verify Python version compatibility

### Frontend can't reach backend
- Check `VITE_API_BASE_URL` in Vercel settings
- Ensure backend is running: test `/api/v1/health` endpoint
- Check browser console for CORS errors

### Database schema not applied
- Go to Supabase SQL Editor
- Run `backend/supabase_schema.sql`
- Check for errors in output

---

## Files Included in GitHub

### Frontend (`frontend/`)
- `src/` - React components and pages
- `public/` - Static assets
- `package.json` - Dependencies
- `tsconfig.json`, `vite.config.ts` - Build config
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules

### Backend (`backend/`)
- `app/` - FastAPI application
- `requirements.txt` - Python dependencies
- `Dockerfile` - Container configuration
- `supabase_schema.sql` - Database schema
- `.env.example` - Environment template
- `tests/` - Test suite

### Root Files
- `.gitignore` - Master ignore rules
- `README.md` - Project overview
- `project_development_briefing.md` - Full specification
- `docs/` - Documentation

---

## Files NOT in GitHub (Secure)

- `.env` files (sensitive credentials)
- `.env.local` files
- `node_modules/` (reinstalled on deploy)
- `venv/` (Python virtual env)
- `dist/` (rebuilt on deploy)
- `__pycache__/` (Python cache)

---

## Environment Variables Reference

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

### Backend (Render)
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-key
HUGGINGFACE_INFERENCE_URL=your-hf-space-url
HUGGINGFACE_SERVICE_KEY=your-hf-token
SECRET_KEY=random-string
JWT_SECRET=random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
DATABASE_URL=your-database-url
```

---

## Live URLs After Deployment

- **Frontend:** `https://your-app.vercel.app`
- **Backend API:** `https://your-app-api.onrender.com`
- **Health Check:** `https://your-app-api.onrender.com/api/v1/health`

---

## Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy frontend on Vercel
3. ✅ Deploy backend on Render
4. ✅ Apply database schema
5. ✅ Test complete flow
6. Optional: Set up custom domain
7. Optional: Enable monitoring/logging
8. Optional: Set up CI/CD automated tests

