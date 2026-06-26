# FC Bayern München — Club Intelligence Platform

A professional football club intelligence platform for FC Bayern München, built with enterprise Java architecture, real football data from Sportmonks, advanced scouting, transfer planning, analytics, and executive decision-support tools.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Recharts |
| Backend | Java 21 + Spring Boot 3 + Spring Security + Spring Data JPA |
| Database | MySQL 8 |
| Auth | JWT + BCrypt |
| Data | Sportmonks Football API v3 |
| Infra | Docker + Docker Compose + Nginx |

## Quick Start

### 1. Configure Environment

```bash
cp .env.example .env
# Edit .env and fill in your Sportmonks API key:
# SPORTMONKS_API_KEY=your_key_here
```

### 2. Run with Docker Compose

```bash
docker-compose up --build
```

Access: http://localhost

### 3. Local Development

**Backend:**
```bash
# Start MySQL first (or use docker-compose up mysql)
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm run dev
# Access: http://localhost:5173
```

## Default Accounts (seeded on first boot)

| Email | Password | Role |
|---|---|---|
| admin@fcbayern.de | Bayern2024! | Club Owner |
| director@fcbayern.de | Bayern2024! | Sporting Director |
| analyst@fcbayern.de | Bayern2024! | Recruitment Analyst |
| finance@fcbayern.de | Bayern2024! | Finance Manager |

## API Endpoints

| Group | Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh` |
| Dashboard | `GET /api/dashboard/summary` |
| Squad | `GET /api/squad`, `GET /api/squad/depth-chart` |
| Players | `GET /api/players`, `GET /api/players/{id}` |
| Scouting | `CRUD /api/scouting/reports`, `CRUD /api/scouting/shortlists` |
| Transfers | `GET /api/transfers` |
| Analytics | `GET /api/analytics/squad-strength`, `age-curve`, `position-depth`, `injury-risk`, `financial-health`, `transfer-opportunities` |
| Sync | `POST /api/sync/trigger`, `GET /api/sync/logs` |

## Data Sync

Trigger from UI (Sync page) or wait for scheduled jobs:

| Job | Schedule |
|---|---|
| Bayern Squad | Daily 3:00 AM |
| Injuries | Every 6 hours |
| Transfers | Daily 8:00 AM |
| League Players | Monday 4:00 AM |

## Roles & Access

| Role | Access |
|---|---|
| CLUB_OWNER | Full access to all modules |
| SPORTING_DIRECTOR | Squad, Players, Scouting, Transfers, Analytics, Sync |
| RECRUITMENT_ANALYST | Players, Scouting, limited Analytics |
| FINANCE_MANAGER | Dashboard, Financial Analytics only |
