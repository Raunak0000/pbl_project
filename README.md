# 🚀 SyncSpace

<div align="center">

**A full-stack, real-time collaborative task management platform**

[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.3-6DB33F.svg)](https://spring.io/projects/spring-boot)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B.svg)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)](https://www.typescriptlang.org/)
[![Java](https://img.shields.io/badge/Java-21-ED8B00.svg)](https://openjdk.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Architecture](#-architecture)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

SyncSpace is a full-stack collaborative task management application with a React frontend and a Spring Boot backend, persisted to MongoDB. It features real-time collaboration via STOMP WebSockets, a Kanban board with drag-and-drop, a calendar view, a rich-text editor, team chat, and a command palette — all wrapped in a sleek GitHub-Dark Navy theme.

### Key Highlights

- ☕ **Spring Boot + MongoDB Backend** — RESTful API with JWT authentication and ownership-based authorization
- 🎨 **GitHub-Dark Navy Theme** — Deep navy backgrounds, green action accents, and zero white
- 🔄 **Real-time Sync** — Live collaboration via STOMP over WebSockets (SockJS fallback)
- 📊 **Multiple Views** — Kanban board, Calendar, and Chat
- ⌨️ **Command Palette** — `Cmd + K` keyboard shortcut for quick navigation
- 🔐 **Role-Based Access** — Admin and User roles with collaborative board access
- ✍️ **Rich Text Editor** — Full-featured WYSIWYG editor powered by Tiptap / ProseMirror
- 📝 **Activity Logging** — Granular audit trail for all task changes

---

## ✨ Features

### 📊 Task Management

- **Kanban Board** — Drag-and-drop tasks between To Do, In Progress, and Done columns. Reorder columns. Filter by status, sort by date/priority. Dependency validation prevents moving blocked tasks to Done.
- **Calendar View** — Month-by-month task visualization by due date with day-cell task previews.
- **Task Modal** — Full-featured task editor with title, description (Tiptap), status, assignee, due date, priority, tags, team, and task dependency (`blockedBy`) fields.
- **Task Cards** — Visual status badges, priority dots, due-date indicators (overdue/due soon/upcoming), assignee avatars, tag chips, and checklist progress bars.

### 👥 Collaboration

- **Live Editing** — Real-time synchronization across all connected clients using STOMP over WebSockets (with SockJS fallback). Task creates, updates, deletes, and board changes are broadcast instantly.
- **Presence Indicators** — See which users are actively editing which tasks, with automatic stale-presence cleanup after 10 seconds.
- **Chat View** — Team communication integrated alongside task boards.
- **Board Deletion Sync** — When an admin deletes a project, it vanishes from all active sessions instantly.
- **Activity Logging** — Every task change (status, title, description, assignee, priority, labels, etc.) is logged with user attribution and timestamps.

### 🔐 Authentication & Authorization

- **JWT Authentication** — Secure login and registration with BCrypt password hashing and JJWT tokens.
- **Token Blocklist** — Server-side JWT invalidation on logout, stored in MongoDB.
- **Rate Limiting** — Login attempts throttled to 5 per IP per 15-minute window.
- **Collaborative Access** — All authenticated users can see and work on all boards. Board deletion is restricted to the creator or an admin.
- **Admin Dashboard** — User management interface for admins (view all users, delete users, view board activity logs).
- **Auto Admin** — The first registered user is automatically assigned the `ADMIN` role.

### 🎨 User Experience

- **GitHub-Dark Navy Theme** — A custom color palette (`#0D1117` page bg, `#161B22` surfaces, `#21262D` elevated surfaces, `#3FB950` green accent, `#58A6FF` blue accent, `#F85149` danger) applied across all UI components.
- **Command Palette** — `Cmd + K` to search boards and filter teams without leaving the keyboard.
- **Framer Motion Animations** — Smooth entrance animations, hover effects, and micro-interactions throughout.
- **Responsive Design** — Collapsible sidebar, mobile header, and adaptive layouts for all screen sizes.

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI framework |
| **TypeScript** | 5.8 | Type safety |
| **Vite** | 6.2 | Build tool & dev server |
| **Tailwind CSS** | 4.2.2 | Utility-first styling (via `@tailwindcss/vite` plugin) |
| **Framer Motion** | 11.x | Animations & transitions |
| **Tiptap** | 2.5.7 | Rich text editor (ProseMirror) |
| **Axios** | 1.13 | HTTP client for API calls |
| **Lucide React** | 0.563 | Icon library |
| **@stomp/stompjs** | 7.3 | STOMP WebSocket client |
| **sockjs-client** | 1.6.1 | WebSocket SockJS fallback |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Spring Boot** | 4.0.3 | REST API framework |
| **Java** | 21 | Runtime |
| **MongoDB** | — | NoSQL database |
| **Spring Security** | — | Authentication & authorization |
| **JJWT** | 0.12.6 | JWT token generation & validation |
| **Lombok** | — | Boilerplate reduction |
| **Spring Validation** | — | DTO request validation |
| **Spring WebSocket** | — | STOMP messaging & live collaboration |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Java** 21
- **Maven** 3.9+
- **MongoDB** (local instance or Atlas)
- **Docker & Docker Compose** (optional — for containerized deployment)

### Option A: Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/syncspace.git
cd syncspace
```

#### 2. Start the Backend

```bash
cd syncspace-backend

# Configure your MongoDB connection in src/main/resources/application.properties
# Key properties: spring.data.mongodb.uri, jwt.secret, jwt.expiration, server.port

./mvnw spring-boot:run
```

The backend will start on the port configured in `application.properties` (default: `10000`).

> ⚠️ Make sure `.env.local` has `VITE_API_URL` pointing to the correct backend port.

#### 3. Start the Frontend

```bash
# From the project root
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`.

#### 4. Build for Production

```bash
npm run build      # Output in dist/
npm run preview    # Preview the production build
```

### Option B: Docker Compose (All-in-One)

```bash
# From the project root — starts MongoDB, Backend, and Frontend
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8080/api` |
| MongoDB | `localhost:27017` |

Environment overrides can be set in a `.env` file at the project root:

```env
MONGO_URI=mongodb://mongo:27017/syncspace
JWT_SECRET=your-secret-key
VITE_API_URL=http://localhost:8080/api
SERVER_PORT=8080
```

---

## 📁 Project Structure

```
syncspace/
├── components/                  # React UI Components
│   ├── auth/
│   │   ├── LoginPage.tsx        # Login form
│   │   └── RegisterPage.tsx     # Registration form
│   ├── admin/
│   │   └── AdminDashboard.tsx   # Admin user management & activity logs
│   ├── CalendarView.tsx         # Calendar month view
│   ├── ChatView.tsx             # Team chat interface
│   ├── CommandPalette.tsx       # Cmd+K quick search
│   ├── Dashboard.tsx            # Main dashboard + board grid
│   ├── Header.tsx               # App header bar
│   ├── KanbanBoard.tsx          # Kanban columns + drag-and-drop
│   ├── LandingPage.tsx          # Marketing landing page
│   ├── PresenceIndicator.tsx    # Live editing presence dots
│   ├── TaskCard.tsx             # Individual task card
│   ├── TaskEditor.tsx           # Inline task editor
│   ├── TaskModal.tsx            # Full task detail modal
│   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   └── TiptapEditor.tsx         # Tiptap WYSIWYG rich text editor
├── contexts/
│   ├── AuthContext.tsx           # Auth state (sessionStorage-backed)
│   ├── LiveEditingContext.tsx    # Presence & active editors
│   └── ThemeContext.tsx          # Theme preferences
├── services/
│   ├── api.ts                   # Axios API client (authApi, api, adminApi)
│   ├── liveEditingService.ts    # STOMP/WebSocket real-time service
│   └── mockBackend.ts           # Mock data for offline/testing
├── syncspace-backend/           # Spring Boot Backend
│   ├── Dockerfile.backend       # Backend Docker image
│   └── src/main/java/com/syncpace/backend/
│       ├── BackendApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java       # CORS, CSRF, JWT filter, BCrypt
│       │   ├── JwtService.java           # Token generation, validation & blocklist
│       │   ├── JwtAuthFilter.java        # Per-request JWT verification
│       │   ├── WebSocketsConfig.java     # STOMP broker & SockJS endpoint
│       │   ├── MongoConfig.java          # MongoDB auditing
│       │   └── GlobalExceptionHandler.java
│       ├── controller/
│       │   ├── AuthController.java       # /api/auth (login, register, logout)
│       │   ├── BoardController.java      # /api/board (CRUD)
│       │   ├── TaskController.java       # /api/tasks (CRUD + status + logs)
│       │   ├── AdminController.java      # /api/admin (users, board logs)
│       │   └── WebSocketsController.java # STOMP message relay
│       ├── dto/
│       │   ├── LoginRequest.java
│       │   └── RegisterRequest.java
│       ├── model/
│       │   ├── Board.java
│       │   ├── Task.java
│       │   ├── TaskStatus.java
│       │   ├── User.java
│       │   ├── ActivityLog.java          # Audit log entity
│       │   ├── ActivityAction.java       # 10 tracked action types
│       │   ├── AppCounter.java           # Atomic first-user-is-admin counter
│       │   └── InvalidatedToken.java     # JWT blocklist entry
│       ├── repository/
│       │   ├── BoardRepo.java
│       │   ├── TaskRepo.java
│       │   ├── UserRepo.java
│       │   ├── ActivityLogRepo.java
│       │   └── InvalidatedTokenRepo.java
│       └── service/
│           └── TaskService.java          # Business logic + activity logging
├── App.tsx                      # Root component (routing, state, CRUD)
├── index.tsx                    # React DOM entry point
├── index.html                   # HTML shell
├── index.css                    # Global styles
├── types.ts                     # Shared TypeScript interfaces & constants
├── vite.config.ts               # Vite config (TailwindCSS v4 plugin)
├── package.json                 # Frontend dependencies
├── docker-compose.yml           # 3-service stack (MongoDB + Backend + Frontend)
├── Dockerfile.frontend          # Frontend Docker image (Nginx)
├── nginx.conf                   # Nginx config for SPA routing
├── .env.local                   # Local dev API URL
└── .env.production              # Production API URL
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (first user → ADMIN) |
| `POST` | `/api/auth/login` | Public | Login and receive a JWT token (rate-limited) |
| `POST` | `/api/auth/logout` | JWT | Invalidate current token (server-side blocklist) |

### Boards

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/board` | JWT | Get all boards (collaborative — all users see all) |
| `POST` | `/api/board` | JWT | Create a new board |
| `DELETE` | `/api/board/:id` | JWT | Delete a board (creator or admin only) |

### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tasks/board/:boardId` | JWT | Get paginated tasks for a board |
| `POST` | `/api/tasks` | JWT | Create a new task |
| `PUT` | `/api/tasks/:id` | JWT | Update a task |
| `PATCH` | `/api/tasks/:id/status?status=` | JWT | Update task status (with dependency validation) |
| `DELETE` | `/api/tasks/:id` | JWT | Delete a task |
| `GET` | `/api/tasks/:id/logs` | JWT | Get activity logs for a task |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/users` | ADMIN | List all registered users |
| `DELETE` | `/api/admin/users/:id` | ADMIN | Delete a user (cannot self-delete) |
| `GET` | `/api/admin/boards/:id/logs` | ADMIN | Get activity logs for a board |

### WebSocket

| Protocol | Endpoint | Description |
|---|---|---|
| SockJS | `/ws` | WebSocket connection endpoint |
| STOMP Subscribe | `/topic/live-editing` | Receive real-time events |
| STOMP Send | `/app/live-editing` | Broadcast events to all clients |

> All REST endpoints (except auth) require a valid JWT in the `Authorization: Bearer <token>` header.

---

## 🏗 Architecture

### Data Flow

```
User Action → React Component → Context/State → Axios API Client → Spring Boot Controller
                                                                          ↓
                                                                    TaskService
                                                                          ↓
                                                                     MongoDB
                                                                      + ActivityLog
```

### Real-time Sync Flow

```
User Action → liveEditingService.broadcast() → STOMP Client → Spring Boot WebSocket Controller
                                                                          ↓
                                                               /topic/live-editing (broker)
                                                                          ↓
                                                              All Connected STOMP Clients
                                                                          ↓
                                                              App.tsx event handler → setState()
```

### State Management

| Context | Purpose |
|---|---|
| **AuthContext** | User session, JWT token, login/logout, role detection (sessionStorage) |
| **ThemeContext** | Dark/light mode preference, persisted to localStorage |
| **LiveEditingContext** | Active editor tracking, presence indicators |

### Security

- **BCrypt** password hashing on registration
- **JWT tokens** (JJWT) issued on login, validated on every request via `JwtAuthFilter`
- **Token blocklist** — Invalidated tokens stored in MongoDB, checked on every request
- **Rate limiting** — 5 login attempts per IP per 15 minutes (in-memory throttle)
- **Board access** — Collaborative model where all authenticated users can access all boards; deletion restricted to board creator or admin
- **Admin authorization** — `@PreAuthorize("hasRole('ADMIN')")` on admin endpoints
- **CORS** configured in `SecurityConfig` for allowed frontend origins

---

## 🗺 Roadmap

### Completed ✅

- [x] React 19 + TypeScript frontend with Kanban, Calendar, and Chat views
- [x] Spring Boot 4 + MongoDB backend with JWT auth
- [x] Collaborative board access model with role-based admin controls
- [x] GitHub-Dark Navy theme across all components
- [x] Command palette (`Cmd + K`)
- [x] Real-time collaboration via STOMP WebSockets (SockJS fallback)
- [x] Presence indicators (see who's editing what)
- [x] Framer Motion animations
- [x] Tiptap rich text editor
- [x] Admin dashboard (user management + board activity logs)
- [x] Activity logging — granular audit trail for all task changes
- [x] JWT token blocklist (server-side logout)
- [x] Login rate limiting (5 attempts / 15 min / IP)
- [x] Docker Compose deployment (MongoDB + Backend + Frontend/Nginx)
- [x] Task dependency validation (`blockedBy` prevents premature completion)

### Planned

- [ ] **File Attachments** — Upload and attach files to tasks
- [ ] **Task Comments** — Threaded discussions on individual tasks
- [ ] **Advanced Search & Filtering** — Full-text search across all boards and tasks
- [ ] **Email Notifications** — Alerts for due dates, assignments, and mentions
- [ ] **CI/CD Pipeline** — Automated testing and deployment
- [ ] **Board Sharing & Permissions** — Granular per-board access control

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add TypeScript types for all new code
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Spring Boot** — Robust Java backend framework
- **React** — Declarative UI library
- **Tiptap** — Headless rich text editor
- **Tailwind CSS v4** — Utility-first CSS framework
- **Framer Motion** — Production-ready animation library
- **Lucide** — Beautiful open-source icon set
- **JJWT** — JSON Web Token library for Java
- **STOMP.js** — WebSocket messaging client
- **SockJS** — WebSocket fallback transport

---

<div align="center">

**Built with ❤️ using React, Spring Boot, and MongoDB**

[Report Bug](https://github.com/yourusername/syncspace/issues) · [Request Feature](https://github.com/yourusername/syncspace/issues)

</div>
