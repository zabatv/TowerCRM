# TowerCRM 🏢

A modern CRM for language schools and educational centers. Manage branches, employees, leads, groups, lessons, and enrollments — all in one place.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, NestJS, TypeScript |
| **Frontend** | React 18, Vite, TypeScript |
| **Database** | PostgreSQL (prod), SQLite (dev) |
| **ORM** | Prisma |
| **Auth** | JWT + bcrypt |
| **API Docs** | Swagger / OpenAPI |
| **Containerization** | Docker, docker-compose |

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9
- Docker (optional, for PostgreSQL)

### 1. Clone & Install

```bash
git clone <repo-url> towercrm
cd towercrm
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

For local development with SQLite (no Docker needed), set:
```env
DATABASE_URL="file:./dev.db"
DATABASE_PROVIDER="sqlite"
```

### 3. Run Database Migrations & Seed

```bash
cd backend
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
cd ..
```

### 4. Start Development Server

```bash
npm run dev
```

This starts both backend (port 3000) and frontend (port 5173) concurrently.

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs

### 5. Login Credentials (from seed)

| Email | Password | Role |
|-------|----------|------|
| admin@towercrm.com | password123 | **admin** |
| manager@towercrm.com | password123 | manager |
| teacher@towercrm.com | password123 | teacher |
| sales@towercrm.com | password123 | sales |

## Docker Setup (PostgreSQL)

```bash
# Start all services
docker-compose up -d

# Run migrations & seed
docker-compose exec backend npx prisma migrate dev --name init
docker-compose exec backend npx ts-node prisma/seed.ts
```

Access at http://localhost:5173

## Project Structure

```
towercrm/
├── package.json              # Root monorepo scripts
├── docker-compose.yml        # PostgreSQL + app containers
├── Dockerfile                # Multi-stage build
├── README.md
├── API.md                    # API reference with curl examples
├── .env.example
├── shared/
│   └── types/                # Shared TypeScript types
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data (2 branches, 4 users, 6 leads, 2 groups, 4 lessons)
│   ├── src/
│   │   ├── main.ts           # Entry point with Swagger setup
│   │   ├── app.module.ts     # Root module
│   │   ├── auth/             # JWT auth, login, register
│   │   ├── users/            # User CRUD (admin only)
│   │   ├── branches/         # Branch CRUD
│   │   ├── leads/            # Lead CRUD + convert + bulk
│   │   ├── groups/           # Group CRUD
│   │   ├── lessons/          # Lesson CRUD + attendance + calendar
│   │   ├── enrollments/      # Enrollment CRUD
│   │   ├── activity-logs/    # Audit log viewer
│   │   ├── dashboard/        # Stats endpoint
│   │   ├── uploads/          # File upload support
│   │   ├── prisma/           # Prisma service module
│   │   └── common/           # Guards, decorators, filters
│   └── test/                 # E2E tests
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Routes & auth setup
│   │   ├── contexts/         # AuthContext with JWT
│   │   ├── api/              # API client modules
│   │   ├── components/       # Layout, Sidebar, ProtectedRoute
│   │   ├── pages/            # Dashboard, Branches, Employees, Leads, Groups, Lessons, Students, Reports
│   │   └── styles/           # CSS styles
│   └── vite.config.ts        # Proxy /api to backend
└── nginx/
    └── default.conf          # Nginx config for production
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start backend + frontend in dev mode |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Build all packages |
| `npm run migrate` | Run Prisma migrations |
| `npm run seed` | Seed database |
| `npm run studio` | Open Prisma Studio |
| `npm run test` | Run backend unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run lint` | Lint all packages |

## API Endpoints Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/register` | Public | Register |
| GET | `/api/auth/me` | All | Current user |
| GET | `/api/users` | Admin/Manager | List users |
| POST | `/api/users` | Admin | Create user |
| GET/POST/PUT/DELETE | `/api/branches` | Admin/Manager | Branch CRUD |
| GET/POST/PUT/DELETE | `/api/leads` | Admin/Manager/Sales | Lead CRUD |
| POST | `/api/leads/:id/convert` | Admin/Manager/Sales | Convert lead |
| POST | `/api/leads/bulk-assign` | Admin/Manager | Bulk assign |
| GET/POST/PUT/DELETE | `/api/groups` | Admin/Manager/Teacher | Group CRUD |
| GET/POST/PUT/DELETE | `/api/lessons` | Admin/Manager/Teacher | Lesson CRUD |
| GET | `/api/lessons/calendar` | All | Calendar events |
| POST | `/api/lessons/:id/attendance` | Admin/Manager/Teacher | Mark attendance |
| POST | `/api/enrollments` | Admin/Manager | Enroll student |
| GET | `/api/dashboard/stats` | All | Dashboard stats |
| GET | `/api/activity-logs` | Admin/Manager | Audit logs |
| GET | `/health` | Public | Health check |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL or SQLite connection string |
| `DATABASE_PROVIDER` | Yes | `postgresql` | `postgresql` or `sqlite` |
| `JWT_SECRET` | Yes | - | Secret key for JWT signing |
| `PORT` | No | `3000` | Backend port |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS origin |
| `NODE_ENV` | No | `development` | Environment |

## Deployment

### Docker Compose (Recommended for production)

```bash
# Set environment variables
export JWT_SECRET="your-random-secret"
export DATABASE_URL="postgresql://user:pass@host:5432/towercrm"

# Deploy
docker-compose up -d --build
```

### Render

See `render.yaml` for Render deployment config. Key steps:
1. Connect your GitHub repo
2. Render auto-detects `render.yaml`
3. Set environment variables in Render dashboard

### Manual Deploy

```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build

# Run with PM2 or systemd
DATABASE_URL="..." JWT_SECRET="..." npm run start
```

## Seed Data

Running `npx ts-node prisma/seed.ts` creates:

- **2 Branches**: Main Branch, Downtown Branch
- **4 Users**: admin, manager, teacher, sales
- **6 Leads**: mixed statuses and sources
- **2 Groups**: English A1, Spanish B1
- **4 Lessons**: 2 per group

## Testing

```bash
npm run test          # Unit tests
npm run test:e2e      # Integration tests
npm run lint          # Lint check
```

## Curl Examples

See [API.md](API.md) for a complete set of curl examples for all major operations.

### Quick examples:

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@towercrm.com","password":"password123"}' | \
  node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data.accessToken))")

# Create lead
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Lead","email":"test@example.com","source":"website"}'

# Enroll student
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userId":"USER_ID","groupId":"GROUP_ID"}'
```

## License

MIT
