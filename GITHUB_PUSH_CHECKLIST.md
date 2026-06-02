# GitHub Push Checklist — CardioBayes-E2E

## ✅ What WILL Be Pushed (Necessary for Deployment)

### Frontend
- ✅ `frontend/src/` — All React components and pages
- ✅ `frontend/public/` — Static assets (ECG template)
- ✅ `frontend/package.json` — Dependencies (npm will reinstall)
- ✅ `frontend/package-lock.json` — Dependency lock file
- ✅ `frontend/tsconfig.json` — TypeScript configuration
- ✅ `frontend/vite.config.ts` — Build configuration
- ✅ `frontend/tailwind.config.ts` — Tailwind CSS config
- ✅ `frontend/vitest.config.ts` — Test configuration
- ✅ `frontend/playwright.config.ts` — E2E test config
- ✅ `frontend/.env.example` — Environment template (NO REAL VALUES)
- ✅ `frontend/.gitignore` — Git ignore rules

### Backend
- ✅ `backend/app/` — All Python code (routes, services, models)
- ✅ `backend/tests/` — Test suite
- ✅ `backend/requirements.txt` — Python dependencies
- ✅ `backend/Dockerfile` — Container configuration
- ✅ `backend/supabase_schema.sql` — Database schema
- ✅ `backend/.env.example` — Environment template (NO REAL VALUES)

### Root Level
- ✅ `README.md` — Project overview
- ✅ `DEPLOYMENT.md` — Deployment instructions
- ✅ `project_development_briefing.md` — Full specification
- ✅ `.gitignore` — Master ignore rules
- ✅ `docs/` — Documentation folder

---

## ❌ What Will NOT Be Pushed (Protected by .gitignore)

### Sensitive Files
- ❌ `.env` — Production/dev credentials
- ❌ `.env.local` — Local overrides
- ❌ `backend/.env` — **DO NOT PUSH** (contains real Supabase keys & HF token)
- ❌ `frontend/.env` — **DO NOT PUSH** (if contains real URLs)

### Dependencies (Installed on Deploy)
- ❌ `node_modules/` — npm reinstalls from package.json
- ❌ `venv/`, `.venv/` — Python recreated on Render
- ❌ `frontend/dist/` — Built fresh by Vercel
- ❌ `backend/build/` — Built fresh on Render

### Cache & Build Artifacts
- ❌ `__pycache__/` — Python cache
- ❌ `.pytest_cache/` — Test cache
- ❌ `*.pyc` — Python compiled files
- ❌ `*.egg-info/` — Package info
- ❌ `dist/` — Build output
- ❌ `build/` — Build directory

### IDE & OS Files
- ❌ `.vscode/` — VS Code settings (personal)
- ❌ `.idea/` — JetBrains IDE settings
- ❌ `.DS_Store` — macOS system file
- ❌ `Thumbs.db` — Windows cache
- ❌ `*.swp`, `*.swo` — Vim/editor temp files

### Logs & Temp Files
- ❌ `*.log` — Log files
- ❌ `*.tmp` — Temporary files
- ❌ `test-results/` — Test output
- ❌ `.coverage` — Coverage reports

### Local/Generated Files
- ❌ `inference_service/models/` — Local ML models (not needed for deployment)
- ❌ Documentation guides (COMPLETION_*.md, *_SUMMARY.md, etc.)

---

## Before Pushing: Run These Checks

### 1. Verify Secrets Are Not Staged
```bash
git status
```
**Should NOT show:**
- `.env`
- `.env.local`
- `backend/.env` 
- Any files in `.gitignore`

### 2. Test .env Files Are Ignored
```bash
# Check what would be committed
git ls-files --others --exclude-standard

# Should NOT include .env files
```

### 3. Verify Required Files Are Included
```bash
# These should be in the repo:
git ls-files | grep -E "(package.json|requirements.txt|Dockerfile|supabase_schema)"
```

### 4. Check Backend Environment
```bash
# Verify backend .env.example has ONLY placeholders
cat backend/.env.example | grep -E "(password|secret|key)" | head -5
# Should show placeholder values like: "your_supabase_key_here"
```

---

## Push to GitHub

```bash
# 1. Navigate to repo root
cd d:\Projects\CardioBayes-E2E

# 2. Initialize git (if not done)
git init
git remote add origin https://github.com/azam8-97/CardioBayesE2E.git

# 3. Add all files (except ignored ones)
git add .

# 4. VERIFY .env files are NOT included
git status

# 5. Commit
git commit -m "Initial commit: CardioBayes-E2E with Vercel + Render deployment ready"

# 6. Push to GitHub
git branch -M main
git push -u origin main
```

---

## After Push: Deployment Steps

### ✅ Step 1: Deploy Frontend to Vercel
1. Go to https://vercel.com/new
2. Import repo `azam8-97/CardioBayesE2E`
3. Select root directory: `frontend`
4. Add environment: `VITE_API_BASE_URL=http://localhost:8000` (update after backend deploys)
5. Deploy

### ✅ Step 2: Deploy Backend to Render
1. Go to https://render.com/dashboard
2. "New Web Service" from GitHub
3. Select `CardioBayesE2E` repo
4. Root directory: `backend`
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn app.main:app --host 0.0.0.0`
7. Add ALL environment variables from `backend/.env`
8. Deploy

### ✅ Step 3: Update Frontend with Backend URL
1. In Vercel settings, update: `VITE_API_BASE_URL=https://your-render-url.onrender.com`
2. Trigger redeploy

### ✅ Step 4: Apply Database Schema
1. In Supabase SQL Editor, run `backend/supabase_schema.sql`

---

## File Size Overview

| Component | Size | Notes |
|-----------|------|-------|
| Frontend (gzipped) | 952 KB | Already optimized |
| Backend (source) | ~150 KB | Python source files |
| Dependencies | ~300 MB | NOT pushed (npm/pip install on deploy) |
| Database Schema | 25 KB | Included in repo |
| Docs | 500 KB | Documentation files |
| **Total to Push** | **~2 MB** | Excluding node_modules, venv, etc. |

---

## Common Mistakes to Avoid

### ❌ DON'T
```bash
# Don't push env files
git add .env               # ❌ WRONG
git add backend/.env       # ❌ WRONG

# Don't push node_modules or venv
git add node_modules/      # ❌ WRONG
git add .venv/             # ❌ WRONG

# Don't push build artifacts
git add frontend/dist/     # ❌ WRONG
git add backend/build/     # ❌ WRONG
```

### ✅ DO
```bash
# Just add everything (gitignore will exclude sensitive files)
git add .                  # ✅ Correct

# Only commit code, config, and documentation
git commit -m "feat: initial commit"

# Push to main branch
git push origin main       # ✅ Correct
```

---

## Verify After Push

1. **Check GitHub repo** — https://github.com/azam8-97/CardioBayesE2E
2. **Verify .env files NOT visible** in file browser
3. **Check file count** — Should be ~50-100 files (not millions like with node_modules)
4. **Test clone** — `git clone https://github.com/azam8-97/CardioBayesE2E && cd CardioBayesE2E`
5. **Verify structure** — `ls` should show frontend/, backend/, docs/, README.md, etc.

---

## If You Accidentally Pushed Secrets

If `.env` files got pushed:

```bash
# 1. Remove from history
git rm --cached .env backend/.env
git commit -m "Remove .env files"
git push origin main

# 2. Rotate all credentials immediately
# - In Supabase: regenerate keys
# - In HuggingFace: regenerate tokens
# - Update backend/.env.example with new dummy values

# 3. Re-add to .gitignore
# (Already done, but verify)
```

---

**Ready to push? Follow the steps in [DEPLOYMENT.md](./DEPLOYMENT.md) after pushing to GitHub!**

