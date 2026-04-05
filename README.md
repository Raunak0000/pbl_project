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

SyncSpace is a full-stack collaborative task management application with a React frontend and a Spring Boot backend, persisted to MongoDB. It features real-time cross-tab synchronization, a Kanban board with drag-and-drop, a calendar view, a rich-text editor, team chat, and a command palette — all wrapped in a sleek GitHub-Dark Navy theme.

### Key Highlights

- ☕ **Spring Boot + MongoDB Backend** — RESTful API with JWT authentication and ownership-based authorization
- 🎨 **GitHub-Dark Navy Theme** — Deep navy backgrounds, green action accents, and zero white
- 🔄 **Real-time Sync** — Cross-tab live editing via custom event broadcasting (WebSocket-ready)
- 📊 **Multiple Views** — Kanban board, Calendar, and Chat
- ⌨️ **Command Palette** — `Cmd + K` keyboard shortcut for quick navigation
- 🔐 **Role-Based Access** — Admin and User roles with secure, ownership-based board access
- ✍️ **Rich Text Editor** — Full-featured WYSIWYG editor powered by Tiptap / ProseMirror

---

## ✨ Features

### 📊 Task Management

- **Kanban Board** — Drag-and-drop tasks between To Do, In Progress, and Done columns. Reorder columns. Filter by status, sort by date/priority. Dependency validation prevents moving blocked tasks to Done.
- **Calendar View** — Month-by-month task visualization by due date with day-cell task previews.
- **Task Modal** — Full-featured task editor with title, description (Tiptap), status, assignee, due date, priority, tags, team, and task dependency (`blockedBy`) fields.
- **Task Cards** — Visual status badges, priority dots, due-date indicators (overdue/due soon/upcoming), assignee avatars, tag chips, and checklist progress bars.

### 👥 Collaboration

- **Live Editing** — Real-time synchronization across browser tabs using `localStorage` events and `CustomEvent` broadcasting. Architecture is ready for a direct swap to Socket.io / WebSockets.
- **Presence Indicators** — See which users are actively editing which tasks.
- **Chat View** — Team communication integrated alongside task boards.
- **Board Deletion Sync** — When an admin deletes a project, it vanishes from all active sessions instantly.

### 🔐 Authentication & Authorization

- **JWT Authentication** — Secure login and registration with BCrypt password hashing and JJWT tokens.
- **Ownership-Based Access** — Users only see and modify their own boards. All task CRUD operations verify board ownership on the backend before proceeding.
- **Admin Dashboard** — User management interface for admins (view all users, delete users, inspect roles).
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
| **Tailwind CSS** | CDN | Utility-first styling (config in `index.html`) |
| **Framer Motion** | 11.x | Animations & transitions |
| **Tiptap** | 2.5.7 | Rich text editor (ProseMirror) |
| **Axios** | 1.13 | HTTP client for API calls |
| **Lucide React** | 0.563 | Icon library |
| **Socket.io Client** | 4.8.3 | Real-time communication (ready) |

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

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16+
- **Java** 21
- **Maven** 3.9+
- **MongoDB** (local instance or Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/syncspace.git
cd syncspace
```

### 2. Start the Backend

```bash
cd syncspace-backend

# Configure your MongoDB connection in src/main/resources/application.properties
# Set JWT_SECRET in the root .env file

./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`.

### 3. Start the Frontend

```bash
# From the project root
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`.

### 4. Build for Production

```bash
npm run build      # Output in dist/
npm run preview    # Preview the production build
```

---

## 📁 Project Structure

```
synnnncspace-main/
├── components/                  # React UI Components
│   ├── auth/
│   │   ├── LoginPage.tsx        # Login form
│   │   └── RegisterPage.tsx     # Registration form
│   ├── admin/
│   │   └── AdminDashboard.tsx   # Admin user management
│   ├── CalendarView.tsx         # Calendar month view
│   ├── ChatView.tsx             # Team chat interface
│   ├── CommandPalette.tsx       # Cmd+K quick search
│   ├── Dashboard.tsx            # Main dashboard + sidebar
│   ├── Header.tsx               # App header bar
│   ├── KanbanBoard.tsx          # Kanban columns + drag-and-drop
│   ├── LandingPage.tsx          # Marketing landing page
│   ├── PresenceIndicator.tsx    # Live editing presence dots
│   ├── TaskCard.tsx             # Individual task card
│   ├── TaskEditor.tsx           # Inline task editor (Tiptap)
│   ├── TaskModal.tsx            # Full task detail modal
│   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   └── TiptapEditor.tsx         # Tiptap WYSIWYG wrapper
├── contexts/
│   ├── AuthContext.tsx           # Auth state (user, token, login/logout)
│   ├── LiveEditingContext.tsx    # Presence & active editors
│   └── ThemeContext.tsx          # Theme preferences
├── services/
│   ├── api.ts                   # Axios API client (boards, tasks, auth)
│   ├── liveEditingService.ts    # Real-time event bus (cross-tab sync)
│   └── mockBackend.ts           # Legacy mock auth (localStorage)
├── syncspace-backend/           # Spring Boot Backend
│   └── src/main/java/com/syncpace/backend/
│       ├── BackendApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java       # CORS, JWT filter, BCrypt
│       │   ├── JwtService.java           # Token generation & validation
│       │   ├── JwtAuthFilter.java        # Per-request JWT verification
│       │   └── GlobalExceptionHandler.java
│       ├── controller/
│       │   ├── AuthController.java       # POST /api/auth/login, /register
│       │   ├── BoardController.java      # CRUD /api/board
│       │   └── TaskController.java       # CRUD /api/tasks
│       ├── dto/
│       │   ├── LoginRequest.java
│       │   └── RegisterRequest.java
│       ├── model/
│       │   ├── Board.java
│       │   ├── Task.java
│       │   ├── TaskStatus.java
│       │   └── User.java
│       ├── repository/
│       │   ├── BoardRepo.java
│       │   ├── TaskRepo.java
│       │   └── UserRepo.java
│       └── service/
│           └── TaskService.java
├── App.tsx                      # Root component (routing, state)
├── index.tsx                    # Entry point
├── index.html                   # HTML shell + Tailwind config
├── types.ts                     # Shared TypeScript types
├── vite.config.ts               # Vite configuration
├── package.json                 # Frontend dependencies
└── .env                         # JWT_SECRET
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (first user → ADMIN) |
| `POST` | `/api/auth/login` | Login and receive a JWT token |

### Boards

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/board` | Get all boards for the authenticated user |
| `POST` | `/api/board` | Create a new board |
| `DELETE` | `/api/board/:id` | Delete a board (owner only) |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks/board/:boardId` | Get all tasks for a board |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `PATCH` | `/api/tasks/:id/status?status=` | Update task status |
| `DELETE` | `/api/tasks/:id` | Delete a task |

> All board and task endpoints require a valid JWT in the `Authorization: Bearer <token>` header and verify board ownership server-side.

---

## 🏗 Architecture

### Data Flow

```
User Action → React Component → Context/State → Axios API Client → Spring Boot Controller
                                                                          ↓
                                                                    TaskService
                                                                          ↓
                                                                     MongoDB
```

### Real-time Sync Flow

```
User Action → liveEditingService.broadcast() → localStorage event + CustomEvent
                                                         ↓
                                                Other Browser Tabs
                                                         ↓
                                              App.tsx event handler → setState()
```

### State Management

| Context | Purpose |
|---|---|
| **AuthContext** | User session, JWT token, login/logout, role detection |
| **ThemeContext** | Dark/light mode preference, persisted to localStorage |
| **LiveEditingContext** | Active editor tracking, presence indicators |

### Security

- **BCrypt** password hashing on registration
- **JWT tokens** (JJWT) issued on login, validated on every request via `JwtAuthFilter`
- **Ownership checks** — `BoardController` and `TaskController` verify `user.id == board.userId` before any operation
- **CORS** configured in `SecurityConfig` to allow the frontend origin

---

## 🗺 Roadmap

### Completed ✅

- [x] React 19 + TypeScript frontend with Kanban, Calendar, and Chat views
- [x] Spring Boot 4 + MongoDB backend with JWT auth
- [x] Ownership-based board and task authorization
- [x] GitHub-Dark Navy theme across all components
- [x] Command palette (`Cmd + K`)
- [x] Cross-tab live editing sync
- [x] Framer Motion animations
- [x] Tiptap rich text editor
- [x] Admin dashboard (user management)

### Planned

- [ ] **Real WebSocket Server** — Replace cross-tab simulation with Spring Boot WebSocket / Socket.io for true multi-device real-time sync
- [ ] **File Attachments** — Upload and attach files to tasks
- [ ] **Task Comments & Activity Log** — Threaded discussions on tasks
- [ ] **Advanced Search & Filtering** — Full-text search across all boards and tasks
- [ ] **Email Notifications** — Alerts for due dates, assignments, and mentions
- [ ] **Docker Containerization** — Single-command deployment with Docker Compose
- [ ] **CI/CD Pipeline** — Automated testing and deployment

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
- **Tailwind CSS** — Utility-first CSS framework
- **Framer Motion** — Production-ready animation library
- **Lucide** — Beautiful open-source icon set
- **JJWT** — JSON Web Token library for Java

---

<div align="center">

**Built with ❤️ using React, Spring Boot, and MongoDB**

[Report Bug](https://github.com/yourusername/syncspace/issues) · [Request Feature](https://github.com/yourusername/syncspace/issues)

</div>
