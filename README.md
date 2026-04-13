# 🌌 SyncSpace

![React](https://img.shields.io/badge/react-19.0.0-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-%236DB33F.svg?style=for-the-badge&logo=spring-boot&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Java](https://img.shields.io/badge/java-21-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)

**SyncSpace** is a full-stack, real-time collaborative task management platform built to be a modern, highly responsive alternative to Jira or Trello. It brings together powerful workload visualization, instant cross-client synchronization, and a seamless developer-friendly user experience.

---

## 📑 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [API Reference](#-api-reference)
- [Getting Started (Local Setup)](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Live Deployment](#-live-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **Kanban Board** — Effortless drag-and-drop mechanics across To Do / In Progress / Done columns, fluid column reordering, and robust dependency validation (preventing blocked tasks from moving to Done).
- **Task Management** — Comprehensive task editor with rich text capabilities (powered by Tiptap), advanced taxonomy (labels, priorities with custom color badges), assignment tracking, and proactive due date indicators (overdue / due-soon).
- **Real-time Collaboration** — Experience instant presence indicators showing exactly who is editing what. The board globally synchronizes in milliseconds across all active clients via WebSockets.
- **Task Comments** — Threaded inline discussions with real-time text synchronization and ownership validation (delete own comments).
- **Live Notifications** — Push-based notification bell triggers instantly when you are assigned a new task or your assigned tasks receive new comments.
- **Calendar View** — A high-level month-by-month topographical display sorting tasks visually by due date.
- **Dynamic Dashboard** — Live analytical metrics outlining workload intensity, holistic team progress, and segmented task distribution charts.
- **Team Chat** — Integrated multi-channel real-time discussion spaces to streamline team communication without leaving the board.
- **Command Palette** — Power user (`Cmd+K`) global search and navigation to snap between boards, tasks, and settings.
- **Authentication & Security** — Fortified with JWT authentication, BCrypt password hashing, proactive rate-limiting, and instantaneous token invalidation on logout. 
- **Admin & Activity Auditing** — Built-in Admin dashboard for user management, coupled with exhaustive, timestamped activity logging attributing every mutation across the system. 

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **Editor**: Tiptap (Rich Text)
- **Networking/Real-time**: Axios, STOMP/SockJS (WebSockets)
- **Icons**: Lucide React

### Backend
- **Framework**: Spring Boot 4, Java 21, Maven
- **Security**: Spring Security, JJWT (JSON Web Token)
- **Data Access**: Spring Data MongoDB
- **Real-time**: Spring WebSocket (STOMP message broker)

### Infrastructure
- **Database**: MongoDB Atlas
- **Hosting**: Vercel (Frontend), Render (Backend)

---

## 🏗 Architecture

SyncSpace operates as a monorepo containing a high-performance React application serving as the UI and a separate Spring Boot directory (`/syncspace-backend`) housing the REST API and WebSocket controllers.

```text
CLIENT (Browser)                                    SERVER (Spring Boot 4)
┌──────────────────────┐   HTTP / REST API (JWT)    ┌──────────────────────────┐
│                      │ ◄────────────────────────► │                          │
│                      │                            │  Controllers             │
│   React 19 Frontend  │   WebSocket (SockJS/STOMP) │  Services                │
│   (Vercel)           │ ◄────────────────────────► │  Repositories            │
│                      │      /topic/live-editing   │                          │
│                      │   /topic/notifications/*   │                          │
└──────────────────────┘                            └───────────┬──────────────┘
                                                                │
                                                                ▼
                                                    ┌──────────────────────────┐
                                                    │ MONGODB ATLAS            │
                                                    │ collections:             │
                                                    │ users, tasks, boards,    │
                                                    │ comments, notifications, │
                                                    │ activity_logs, counters  │
                                                    └──────────────────────────┘
```

---

## 📸 Screenshots

| View | Description |
|---|---|
| **Kanban Board** | View of the main task board demonstrating drag-and-drop columns, labels, assignments, and presence indicators. *(Placeholder)* |
| **Task Detail Overlay** | The rich text editor overlay showing threaded comments, priority badges, and dependency lists. *(Placeholder)* |
| **Metrics Dashboard** | Chart visualization of team workload and assignment distribution. *(Placeholder)* |
| **Command Palette** | The `Cmd+K` interface searching across real-time task scopes. *(Placeholder)* |

---

## 🔌 API Reference

The backend exposes a highly structured REST API. All endpoints (except `/api/auth/**`) require a valid `Bearer <JWT>` header.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user (`ADMIN` defaults for first user). |
| `POST` | `/api/auth/login` | Returns user payload and JWT token. |
| `POST` | `/api/auth/logout` | Invalidates the active JWT. |

### Boards
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/board` | Retrieves all boards. |
| `POST` | `/api/board` | Create a new project board. |
| `DELETE`| `/api/board/{id}` | Permanently delete a board and its cascading tasks. |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/tasks/board/{boardId}` | Fetch paginated tasks for a specific board. |
| `POST` | `/api/tasks` | Create a new task. |
| `PUT`  | `/api/tasks/{id}` | Perform a full update on task configuration. |
| `PATCH`| `/api/tasks/{id}/status` | Quickly shift task status boundaries (To Do -> Done). |
| `DELETE`| `/api/tasks/{id}` | Delete task. |
| `GET`  | `/api/tasks/{id}/logs` | Pull chronological task history / audit log. |

### Comments & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/tasks/{id}/comments` | Read thread comments on a task. |
| `POST` | `/api/tasks/{id}/comments` | Post a comment & optionally trigger STOMP notification. |
| `DELETE`|`/api/tasks/{id}/comments/{commentId}`| Delete an owned comment. |
| `GET`  | `/api/notifications` | Get active user's push notifications stream. |
| `GET`  | `/api/notifications/unread-count` | Returns integer of unread interactions. |
| `PATCH`| `/api/notifications/{id}/read` | Marks singular notification as read. |
| `PATCH`| `/api/notifications/read-all` | Clears unread states for everything. |
| `DELETE`|`/api/notifications` | Clears notification history entirely. |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/admin/users` | List all system users. |
| `DELETE`| `/api/admin/users/{id}` | Process account termination. |
| `GET`  | `/api/admin/boards/{id}/logs` | View all holistic operations occurring on a board. |

---

## 🚀 Getting Started

To test and run **SyncSpace** locally:

### 1. Prerequisite Checks
- `Node.js` (v18+)
- `Java 21 JDK`
- `Maven`
- `MongoDB` cluster accessible via URI string

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd syncspace-backend
   ```
2. Export the required credentials either natively natively or by structuring an `.env` layout:
   ```bash
   export SPRING_DATA_MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/syncspace"
   export JWT_SECRET="your_very_secure_long_secret_key"
   ```
3. Run the Spring Boot instance:
   ```bash
   ./mvnw spring-boot:run
   ```
   > The backend will initialize on `http://localhost:10000`

### 3. Frontend Setup
1. In a split terminal, initialize the React app from the project root:
   ```bash
   npm install
   ```
2. Build the `.env` local environment:
   ```env
   VITE_API_URL=http://localhost:10000/api
   ```
3. Spin up Vite:
   ```bash
   npm run dev
   ```
   > The frontend will be accessible at `http://localhost:3000`

---

## 🔐 Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `SPRING_DATA_MONGODB_URI` | Backend | Connection string locating your Atlas DB instance. |
| `JWT_SECRET` | Backend | High-entropy string securing the token generation algorithm. |
| `ALLOWED_ORIGINS` | Backend | CORS boundary definition (defaults to `http://localhost:3000`). |
| `PORT` | Backend | Spring Boot hosting port. |
| `VITE_API_URL` | Frontend | React endpoint reference targeting the backend host. |

---

## 🌐 Live Deployment

SyncSpace operates on a dual-cloud structure using Vercel alongside Render:

- **Frontend**: [https://syncspace-omega.vercel.app](https://syncspace-omega.vercel.app)
- **Backend API**: [https://syncspace-backend-2.onrender.com](https://syncspace-backend-2.onrender.com)

---

## 🤝 Contributing
1. Fork the repository
2. Create a Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the Branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This projected is distributed under the [MIT License](https://opensource.org/licenses/MIT).
