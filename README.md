# CaseTrak

Hardware Store Operations Management System

## What's Built (React Frontend)

- **Case Management** — Create, assign, status workflow (Open → Assigned → In Progress → Completed → Verified), comments with @mentions, priority/category/filters
- **SOPs** — Versioned standard operating procedures with step-by-step instructions, tools/safety lists, user suggestion system (admins approve/reject)
- **Store Wiki** — Markdown content with versioning, user suggestions, categories (Product Knowledge, Store Policies, Equipment Guides, Training, How-To)
- **AI Assistant** — Auto-suggests SOPs on cases, contextual troubleshooting, searches SOPs + wiki, helps write articles
- **Recurring Tasks** — Daily/weekly/monthly/yearly/custom intervals, auto-assign
- **Dashboard** — Stats, charts, workload view
- **Team Management** — 4 roles: Admin, Manager, Standard User, Viewer
- **Settings** — Editable categories, demo user switching

## Tech Stack

- **Frontend:** React 18 (Create React App)
- **Styling:** Inline styles with design token system
- **Font:** Outfit (Google Fonts)

## Getting Started

```bash
npm install
npm run dev     # Development server (port 3000)
npm run build   # Production build
npm start       # Serve production build
```

## Planned

- Node.js + PostgreSQL backend (self-hosted on Windows Server)
- Authentication/login system
- File uploads (photos/documents on cases)
- Service worker for offline/PWA support
- Real Claude API integration for AI assistant
- Email + push + in-app notifications
