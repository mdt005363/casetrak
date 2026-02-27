# CaseTrak

Hardware Store Operations Management System for The Home Improvement Outlet.

## Architecture

```
casetrak/
├── public/           # Static assets (logo, index.html, manifest)
├── src/              # React frontend
│   ├── components/   # UI components, Sidebar, Topbar, AIPanel
│   ├── data/         # Demo seed data (frontend-only mode)
│   ├── utils/        # Theme, helpers, hooks
│   └── views/        # Dashboard, Cases, SOPs, Wiki, etc.
├── server/           # Node.js + Express backend
│   ├── db/           # PostgreSQL schema, seed, connection pool
│   ├── middleware/    # JWT auth, role checks
│   ├── routes/       # API endpoints
│   └── index.js      # Server entry point
└── package.json      # Frontend dependencies
```

## Features

- **Case Management** — Create, assign, status workflow (Open → Assigned → In Progress → Completed → Verified), comments with @mentions, priority/category/filters
- **SOPs** — Versioned standard operating procedures with step-by-step instructions, tools/safety lists, user suggestions (admin approve/reject)
- **Store Wiki** — Markdown content with versioning, user suggestions, categories
- **AI Assistant** — Auto-suggests SOPs on cases, contextual troubleshooting, searches SOPs + wiki
- **Recurring Tasks** — Daily/weekly/monthly/yearly/custom intervals, auto-assign
- **Dashboard** — Stats, charts, workload view
- **Team Management** — 4 roles: Admin, Manager, Standard User, Viewer
- **Mobile Responsive** — Works on desktop, tablets, and phones
- **Authentication** — JWT-based login, role-based access control

## Quick Start (Frontend Only)

```bash
npm install
npm run dev
```

## Full Stack Setup

### 1. Install PostgreSQL
Download from https://www.postgresql.org/download/windows/

### 2. Create database user
Open pgAdmin or psql:
```sql
CREATE USER casetrak_user WITH PASSWORD 'changeme_secure_password';
ALTER USER casetrak_user CREATEDB;
```

### 3. Configure server
```bash
cd server
cp .env.example .env   # Edit with your DB credentials
npm install
```

### 4. Initialize database
```bash
npm run db:init    # Creates tables
npm run db:seed    # Loads demo data
```

### 5. Run
```bash
npm run dev        # Starts API on port 4000
```

In a separate terminal:
```bash
cd ..
npm run dev        # Starts React on port 3000
```

### Demo Logins
All passwords: `casetrak123`
| Email | Role |
|-------|------|
| sarah@store.com | Admin |
| james@store.com | Manager |
| mike@store.com | Standard User |
| lisa@store.com | Standard User |
| dave@store.com | Standard User |
| amy@store.com | Viewer |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | - | Login |
| GET | /api/auth/me | ✓ | Current user |
| PUT | /api/auth/password | ✓ | Change password |
| GET | /api/users | ✓ | List team |
| POST | /api/users | Admin | Create user |
| PUT | /api/users/:id | Admin | Update user |
| GET | /api/cases | ✓ | List cases (filterable) |
| POST | /api/cases | Write | Create case |
| PUT | /api/cases/:id | Write | Update case |
| DELETE | /api/cases/:id | Write | Delete case |
| POST | /api/cases/:id/comments | Write | Add comment |
| GET | /api/sops | ✓ | List SOPs |
| POST | /api/sops | Admin | Create SOP |
| PUT | /api/sops/:id | Admin | Update SOP |
| POST | /api/sops/:id/suggestions | Write | Suggest improvement |
| GET | /api/wiki | ✓ | List articles |
| POST | /api/wiki | Admin | Create article |
| PUT | /api/wiki/:id | Admin | Update article |
| GET | /api/recurring | ✓ | List recurring tasks |
| POST | /api/recurring | Admin/Mgr | Create schedule |
| PUT | /api/recurring/:id | Admin/Mgr | Update schedule |
| GET | /api/categories | ✓ | List categories |
| GET | /api/notifications | ✓ | User notifications |
| GET | /api/health | - | Server status |

## Tech Stack
- **Frontend:** React 18, inline styles with design tokens
- **Backend:** Node.js, Express, PostgreSQL
- **Auth:** JWT (bcrypt password hashing)
- **Self-hosted:** Windows Server compatible
