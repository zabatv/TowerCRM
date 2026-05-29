# TowerCRM API Reference

Base URL: `http://localhost:3000/api` (dev) or `https://your-deployment.com/api`

Swagger UI: `http://localhost:3000/api/docs`

## Authentication

All endpoints except `/auth/login`, `/auth/register`, and `/health` require a JWT Bearer token.

```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register
```http
POST /api/auth/register
```

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "teacher"
  }'
```

### Login
```http
POST /api/auth/login
```

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@towercrm.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "name": "Admin User", "email": "admin@towercrm.com", "role": "admin" }
  }
}
```

### Get Current User
```http
GET /api/auth/me
```

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## Leads

### Create Lead
```http
POST /api/leads
```

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0100",
    "source": "website",
    "notes": "Interested in English course"
  }'
```

### List Leads (with filters)
```http
GET /api/leads?status=new&source=website&page=1&limit=20
```

```bash
curl "http://localhost:3000/api/leads?status=new&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Assign Lead
```http
PUT /api/leads/:id
```

```bash
curl -X PUT http://localhost:3000/api/leads/LEAD_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "assignedTo": "USER_ID",
    "status": "contacted"
  }'
```

### Convert Lead to Student
```http
POST /api/leads/:id/convert
```

```bash
curl -X POST http://localhost:3000/api/leads/LEAD_ID/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

### Bulk Assign Leads
```http
POST /api/leads/bulk-assign
```

```bash
curl -X POST http://localhost:3000/api/leads/bulk-assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "ids": ["LEAD_ID_1", "LEAD_ID_2"],
    "assignedTo": "USER_ID"
  }'
```

---

## Groups

### Create Group
```http
POST /api/groups
```

```bash
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "English Beginner A1",
    "course": "English",
    "level": "A1",
    "capacity": 12,
    "schedule": "{\"days\":[\"Mon\",\"Wed\",\"Fri\"],\"time\":\"10:00\"}"
  }'
```

### List Groups
```http
GET /api/groups?branchId=BRANCH_ID&status=active
```

```bash
curl "http://localhost:3000/api/groups?status=active" \
  -H "Authorization: Bearer <token>"
```

---

## Enrollments

### Enroll Student in Group
```http
POST /api/enrollments
```

```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "userId": "STUDENT_USER_ID",
    "groupId": "GROUP_ID"
  }'
```

---

## Lessons

### Create Lesson
```http
POST /api/lessons
```

```bash
curl -X POST http://localhost:3000/api/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "English A1 - Lesson 1",
    "description": "Introduction",
    "dateTime": "2025-06-10T10:00:00Z",
    "duration": 60,
    "teacherId": "TEACHER_ID",
    "groupId": "GROUP_ID",
    "branchId": "BRANCH_ID"
  }'
```

### Mark Attendance
```http
POST /api/lessons/:id/attendance
```

```bash
curl -X POST http://localhost:3000/api/lessons/LESSON_ID/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "attendance": [
      {"userId": "USER_ID_1", "status": "present"},
      {"userId": "USER_ID_2", "status": "absent"}
    ]
  }'
```

### Calendar View
```http
GET /api/lessons/calendar?from=2025-06-01&to=2025-06-30
```

```bash
curl "http://localhost:3000/api/lessons/calendar?from=2025-06-01&to=2025-06-30" \
  -H "Authorization: Bearer <token>"
```

---

## Branches

### Create Branch
```http
POST /api/branches
```

```bash
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "New Branch",
    "address": "123 Main St",
    "phone": "+1-555-0100"
  }'
```

---

## Users

### Create User (Admin only)
```http
POST /api/users
```

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Jane Teacher",
    "email": "jane@example.com",
    "password": "password123",
    "role": "teacher",
    "branchId": "BRANCH_ID"
  }'
```

---

## Dashboard

### Get Statistics
```http
GET /api/dashboard/stats
```

```bash
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

---

## Activity Logs

### List Activity Logs
```http
GET /api/activity-logs
```

```bash
curl "http://localhost:3000/api/activity-logs?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

---

## Health Check

```http
GET /health
```

```bash
curl http://localhost:3000/health
```

---

## OpenAPI Specification

The full OpenAPI spec is available at `/api/docs` when the server is running, or in JSON format at `/api/docs-json`.

### Key Models

```typescript
interface User {
  id: string; name: string; email: string; role: string;
  branchId?: string; isActive: boolean; createdAt: string;
}

interface Lead {
  id: string; name: string; email?: string; phone?: string;
  source?: string; status: 'new' | 'contacted' | 'converted' | 'lost';
  assignedTo?: string; notes?: string; createdAt: string;
}

interface Group {
  id: string; name: string; course?: string; level?: string;
  capacity: number; enrolledCount: number; status: string;
}

interface Lesson {
  id: string; title: string; description?: string;
  dateTime: string; duration: number; status: string;
}

interface Enrollment {
  id: string; userId: string; groupId: string;
  status: string; enrolledAt: string;
}
```
