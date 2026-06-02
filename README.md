# CardioBayes-E2E

**Uncertainty-Aware Cardiac Signal Intelligence** — ECG-to-EGM reconstruction with Bayesian uncertainty quantification across six neural architectures.

[![Frontend Built with React](https://img.shields.io/badge/Frontend-React%2018-blue?style=flat-square)](https://react.dev)
[![Backend Built with FastAPI](https://img.shields.io/badge/Backend-FastAPI-green?style=flat-square)](https://fastapi.tiangolo.com)
[![Database Supabase](https://img.shields.io/badge/Database-Supabase-black?style=flat-square)](https://supabase.com)
[![Inference HuggingFace](https://img.shields.io/badge/Inference-HuggingFace-yellow?style=flat-square)](https://huggingface.co)

---

## Quick Links

- **🚀 [Deployment Guide](./DEPLOYMENT.md)** — Deploy to Vercel (frontend) + Render (backend)
- **📋 [Project Briefing](./project_development_briefing.md)** — Complete product specification
- **📊 [Development Progress](./docs/DEVELOPMENT_PROGRESS.md)** — Feature completion status
- **🏃 Local Development** — See "Getting Started" below

---

## Project Structure

```
.
├── frontend/                    # React + TypeScript application (Vite)
│   ├── src/
│   │   ├── pages/              # Landing, Auth, Inference, Results, Dashboard, Admin
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # API client, state management
│   │   └── styles/             # Tailwind CSS
│   ├── package.json            # Dependencies
│   ├── vite.config.ts          # Build configuration
│   └── .env.example            # Environment template
│
├── backend/                     # FastAPI application (Python)
│   ├── app/
│   │   ├── api/v1/routes/      # API endpoints (auth, inference, admin, etc.)
│   │   ├── services/           # Business logic (Supabase, HuggingFace)
│   │   ├── models/             # Data models
│   │   └── core/               # Security, config, logging
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile              # Container configuration
│   ├── supabase_schema.sql     # Database schema
│   └── .env.example            # Environment template
│
├── docs/                        # Documentation
├── DEPLOYMENT.md               # Step-by-step deployment guide
└── project_development_briefing.md  # Full specification

```

---

## Technology Stack

### Frontend
- **React 18.3** + TypeScript 5.4
- **Vite 5.2** — Fast build tool
- **React Router 6.23** — Client-side routing
- **Tailwind CSS 3.4** — Utility-first styling
- **Recharts 2.12** — Data visualizations
- **D3.js** — Waveform rendering
- **Zustand 4.5** — State management

### Backend
- **FastAPI** — Async Python web framework
- **Supabase** — PostgreSQL + Auth + Storage
- **HuggingFace Spaces** — Model inference
- **Pydantic** — Data validation
- **SQLAlchemy** — ORM

### Database
- **Supabase PostgreSQL** with 7 tables:
  - `user_profiles` — User accounts + roles
  - `inference_jobs` — Job tracking
  - `inference_results` — Result storage
  - `model_analytics` — Performance metrics
  - `system_events` — Audit logging
  - `role_change_log` — Admin actions

### ML Models (6 Architectures)
Deployed on HuggingFace Spaces:
1. **Baseline CNN** — Reference model
2. **Bayesian CNN** — Uncertainty quantification
3. **Bayesian BiLSTM** — Sequence modeling (recommended)
4. **Bayesian TCN** — Temporal convolutional
5. **Bayesian Transformer** — Attention-based
6. **Bayesian WaveNet** — Probabilistic generation

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/azam8-97/CardioBayesE2E.git
cd CardioBayesE2E
```

### 2. Setup Backend
```bash
cd backend

# Create Python virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your Supabase and HuggingFace credentials

# Run server
uvicorn app.main:app --reload
# API available at http://localhost:8000
```

### 3. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# VITE_API_BASE_URL should be http://localhost:8000

# Run dev server
npm run dev
# App available at http://localhost:5173
```

### 4. Apply Database Schema
In Supabase SQL Editor:
1. Go to https://app.supabase.com → Your Project → SQL Editor
2. Create new query
3. Copy contents of `backend/supabase_schema.sql`
4. Execute

### 5. Test Application
- **Register:** http://localhost:5173/auth
- **Login:** Use registered credentials
- **Dashboard:** http://localhost:5173/dashboard
- **Inference:** http://localhost:5173/inference (upload ECG, select model, run)
- **Admin:** http://localhost:5173/admin (set role in Supabase first)

---

## Deployment

### For Quick Cloud Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step guide:
- Deploy frontend to **Vercel** (recommended)
- Deploy backend to **Render** (recommended)
- Use existing **Supabase** project
- Use existing **HuggingFace Space** for inference

### Manual Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Output in: frontend/dist/
```

**Backend:**
```bash
cd backend
docker build -t cardiobayese2e .
docker run -p 8000:8000 cardiobayese2e
```

---

## Features

### ✅ Completed
- **10 Full Pages**
  - Landing (hero, features, pricing)
  - Auth (login, register)
  - Inference (upload, model selection, progress)
  - Results (waveforms, metrics, uncertainty)
  - Dashboard (history, statistics)
  - Admin (6 pages for admin/superadmin)
  - Models, Research, Documentation, 404

- **Authentication**
  - User registration + login
  - Role-based access control (user, admin, superadmin)
  - JWT tokens
  - Protected routes

- **Inference Pipeline**
  - ECG file upload (.csv, .mat, .edf)
  - 6 model architecture selection
  - Progress tracking with real-time updates
  - Result storage in Supabase

- **Admin Dashboard**
  - User management
  - Job monitoring
  - Model analytics
  - System events log
  - Role management (superadmin)

- **Frontend**
  - Responsive design (mobile/tablet/desktop)
  - Dark theme
  - 952KB gzipped bundle
  - TypeScript strict mode

### 🚀 Ready for Production
- Frontend build: **953KB gzipped** ✓
- Backend services: **Initialized and verified** ✓
- Database schema: **Ready to apply** ✓
- Inference service: **HuggingFace connected** ✓

---

## API Documentation

### Core Endpoints
```
POST   /api/v1/auth/register           Register user
POST   /api/v1/auth/login              Login user
GET    /api/v1/auth/me                 Get current user
POST   /api/v1/inference/upload        Upload ECG
GET    /api/v1/inference/status/{id}   Check job status
GET    /api/v1/inference/result/{id}   Get results
GET    /api/v1/results/history         User's inference history
GET    /api/v1/dashboard/stats         Dashboard statistics
```

### Admin Endpoints
```
GET    /api/v1/admin/overview          Dashboard overview
GET    /api/v1/admin/users             List users
GET    /api/v1/admin/jobs              List inference jobs
GET    /api/v1/admin/models            Model analytics
GET    /api/v1/admin/events            System events
GET    /api/v1/admin/roles/users       Users for role management
PATCH  /api/v1/admin/roles/change      Change user role
```

---

## Environment Variables

### Frontend
```
VITE_API_BASE_URL=http://localhost:8000  # Backend URL
```

### Backend
```
SUPABASE_URL=                            # From Supabase
SUPABASE_SERVICE_KEY=                    # From Supabase
HUGGINGFACE_INFERENCE_URL=               # Your HF Space
HUGGINGFACE_SERVICE_KEY=                 # Your HF token
SECRET_KEY=                              # Random string
JWT_SECRET=                              # Random string
ENVIRONMENT=development|production
```

See `.env.example` files for full reference.

---

## Security

### ✓ Implemented
- Password hashing (bcrypt)
- JWT authentication
- Role-based access control
- Protected routes
- Input validation (Pydantic)
- CORS headers
- No sensitive data in logs

### 🔐 Secrets Management
- `.env` files never committed (gitignore)
- Environment variables on deployment platforms
- Supabase credentials secured
- HuggingFace tokens protected

---

## Testing

### Frontend
```bash
cd frontend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests (Playwright)
```

### Backend
```bash
cd backend
pytest                # Run all tests
pytest tests/test_auth.py -v  # Specific test
```

---

## Documentation

- **[Project Briefing](./project_development_briefing.md)** — Complete specification with design system, database schema, API architecture
- **[Development Progress](./docs/DEVELOPMENT_PROGRESS.md)** — Feature status, completed work, next steps
- **[Deployment Guide](./DEPLOYMENT.md)** — Step-by-step cloud deployment
- **[API Reference](./docs/api-reference.md)** — Detailed endpoint documentation

---

## Troubleshooting

### Backend won't connect to Supabase
```bash
# Test connection
python -c "from app.services.supabase_service import supabase_service; print(supabase_service.client)"
```

### Frontend can't reach backend
- Check `VITE_API_BASE_URL` in `.env`
- Ensure backend is running: `http://localhost:8000/api/v1/health`
- Check CORS headers in backend

### Database queries fail
- Apply schema: Run `backend/supabase_schema.sql` in Supabase
- Verify connection string in `DATABASE_URL`

---

## Contributing

1. Create feature branch: `git checkout -b feat/your-feature`
2. Make changes and test locally
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open pull request

---

## License

Academic Research Project — CardioBayes-E2E 2025

---

## Contact & Support

- **Repository:** https://github.com/azam8-97/CardioBayesE2E
- **Issues:** GitHub Issues
- **Documentation:** See `/docs` directory

---

## Acknowledgments

- IAFDB dataset (PhysioNet)
- Research collaboration at [Institution]
- Bayesian deep learning community

---

**Built with ❤️ for cardiac research**

