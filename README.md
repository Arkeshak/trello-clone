# TaskBoard — Full-Stack Trello-like Task Manager

A full-stack Kanban-style task management application with drag-and-drop functionality, role-based access control, JWT authentication, and a sleek black-and-white UI.

---

## Project Overview

TaskBoard is a full-stack web application that allows teams to manage tasks across a three-column Kanban board: **To Do**, **Doing**, and **Done**. It implements two distinct user roles — normal users and administrators — each with their own permissions and dashboard experience.

Tasks can be created, assigned, and moved between columns using drag-and-drop. All status changes are persisted to the database and survive page refreshes.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, `@hello-pangea/dnd` |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB via Mongoose; `mongodb-memory-server` for zero-config local dev |
| **Authentication** | JSON Web Tokens (JWT), `bcryptjs` for password hashing |
| **HTTP Client** | Axios |

---

## Features

### User Roles & Permissions
| Feature | Normal User | Admin |
|---|---|---|
| Register & Login | ✅ | ✅ (seeded, not registered) |
| Create tasks | ✅ | ✅ |
| Assign **unassigned** tasks to themselves | ✅ | ✅ |
| Assign/reassign tasks to **any** user | ❌ | ✅ |
| View all tasks | ❌ (own + unassigned) | ✅ |
| View all users | ❌ | ✅ |
| Delete tasks | ❌ | ✅ |
| Move tasks via drag-and-drop | ✅ (own tasks only) | ✅ (all tasks) |

### Task Fields
Each task stores: **title**, **description**, **status** (`todo` / `doing` / `done`), **creator**, **assignee**, **createdAt**, **updatedAt**.

---

## Architecture

```
trello-clone/
├── backend/          # Express.js REST API
│   ├── middleware/   # JWT auth & role guards
│   ├── models/       # Mongoose schemas (User, Task)
│   ├── routes/       # /api/auth, /api/tasks, /api/users
│   ├── seed.js       # Admin seeding script (for production)
│   └── server.js     # App entry point (auto-seeds admin in dev)
└── frontend/         # Next.js application
    ├── components/   # Navbar, Column, TaskCard, CreateTaskModal
    ├── context/      # AuthContext (JWT stored in localStorage)
    ├── pages/        # index, login, register, board
    ├── styles/       # globals.css (black & white theme)
    └── utils/        # Axios API instance with token interceptor
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- Git

### 1. Clone the Repository
```bash
git clone <YOUR_GITHUB_REPO_LINK>
cd trello-clone
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `backend/.env` file (see Environment Variables below), then:
```bash
node server.js
```

> The backend starts on **port 5000**. If `MONGO_URI` points to localhost or is omitted, it automatically launches an in-memory MongoDB instance — no MongoDB installation needed for local development.

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

> The frontend starts on **port 3000**. Open [http://localhost:3000](http://localhost:3000).

### 4. Admin Seeding (Production)
In production with a real MongoDB URI, run the seed script once after deploying:
```bash
cd backend
node seed.js
```

---

## Environment Variable Documentation

### Backend — `backend/.env`

```env
# Server port (defaults to 5000)
PORT=5000

# MongoDB connection string
# Local dev: leave as localhost — uses in-memory MongoDB automatically
# Production: use your MongoDB Atlas URI
MONGO_URI=mongodb://localhost:27017/trelloclone

# JWT secret key — CHANGE THIS in production (use a 32+ character random string)
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Allowed CORS origins — set to your deployed frontend URL in production
# Comma-separated for multiple origins
ALLOWED_ORIGIN=https://your-app.vercel.app
```

### Frontend — `frontend/.env.local`

```env
# Backend API base URL
# Local dev: http://localhost:5000/api
# Production: your deployed backend URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Default Administrator Credentials

The admin account is automatically created when the backend starts (in dev mode) or via `node seed.js` (in production).

| Field | Value |
|---|---|
| **Email** | `admin@trello.com` |
| **Password** | `Admin@1234` |

> Administrators **cannot** be created via the registration page — only through the seed script, as required.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login, returns JWT |
| `GET` | `/api/tasks` | 🔐 User | Get tasks (admin: all; user: own + unassigned) |
| `POST` | `/api/tasks` | 🔐 User | Create a task |
| `PUT` | `/api/tasks/:id` | 🔐 User | Update task (status/assignee with role restrictions) |
| `DELETE` | `/api/tasks/:id` | 🔐 Admin | Delete a task |
| `GET` | `/api/users` | 🔐 Admin | List all users |

---

## Security Implementation

- **Password hashing**: All passwords are hashed using `bcryptjs` with 10 salt rounds before storage.
- **JWT authentication**: Tokens expire after 7 days and are verified on every protected route.
- **Role-based access control (RBAC)**: Enforced server-side via `protect` and `adminOnly` middleware.
- **CORS restriction**: The API only accepts requests from the configured `ALLOWED_ORIGIN`.
- **Sensitive credentials**: Managed through environment variables — never hardcoded.

---

## Deployment Information

- **Frontend**: [Insert Deployed Frontend URL]
- **Backend API**: [Insert Deployed Backend URL]

### Recommended Deployment
- **Frontend** → [Vercel](https://vercel.com) — connect your GitHub repo, set `NEXT_PUBLIC_API_URL` in Vercel environment variables.
- **Backend** → [Render](https://render.com) or [Railway](https://railway.app) — set `MONGO_URI`, `JWT_SECRET`, and `ALLOWED_ORIGIN` in the service's environment variables. Run `node seed.js` once via the service console to seed the admin.
- **Database** → [MongoDB Atlas](https://cloud.mongodb.com) — free M0 tier is sufficient.

---

## Application Screenshots

**Login Page**
![Login Page](frontend/public/screenshots/login.png)

**Task Board (Admin View)**
![Admin Board](frontend/public/screenshots/admin-board.png)
