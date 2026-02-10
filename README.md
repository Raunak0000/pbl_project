# 🚀 SyncSpace

<div align="center">

**A modern, collaborative task management platform with real-time synchronization**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
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
- [Usage Guide](#-usage-guide)
- [Architecture](#-architecture)
- [Development](#-development)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

SyncSpace is a full-featured collaborative task management application designed for teams who need real-time synchronization and powerful organization tools. Built with modern web technologies, it provides an intuitive interface for managing projects through multiple views (Kanban, Calendar, Chat) while supporting live collaboration across team members.

### Key Highlights

- 🔄 **Real-time Collaboration** - See changes instantly as team members work
- 🎨 **Multiple Views** - Switch between Kanban boards, Calendar, and Chat
- ✍️ **Rich Text Editing** - Full-featured editor powered by Tiptap/ProseMirror
- 🌓 **Dark Mode** - Beautiful light and dark themes
- 👥 **Role-Based Access** - Admin and user roles with appropriate permissions
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

---

## ✨ Features

### 📊 Task Management

- **Kanban Board View**
  - Drag-and-drop tasks between columns (To Do, In Progress, Done, Blocked)
  - Visual task cards with status indicators
  - Quick task creation and editing
  - Real-time board updates across all users

- **Calendar View**
  - Month-by-month task visualization
  - Date-based task organization
  - Quick date navigation
  - Task deadlines and scheduling

- **Rich Task Editor**
  - Full-featured WYSIWYG editor (Tiptap)
  - Support for headers, lists, links, bold, italic
  - Auto-save functionality (750ms debounce)
  - Task metadata (status, assignee, dates)

### 👥 Collaboration Features

- **Live Editing**
  - Real-time synchronization using Socket.io client
  - Presence indicators showing active users
  - Conflict-free collaborative editing
  - User activity tracking

- **Chat View**
  - Team communication integrated with tasks
  - Message history
  - User presence indicators

### 🔐 Authentication & Authorization

- **User Management**
  - Secure login and registration
  - Session management with JWT-like tokens
  - Password authentication (mock backend)
  - First user becomes admin automatically

- **Admin Dashboard**
  - User management interface
  - Role assignment (Admin/User)
  - User deletion capabilities
  - System overview and statistics

### 🎨 User Experience

- **Theme System**
  - Light/Dark mode toggle
  - Persists preference in localStorage
  - Respects system preferences
  - Smooth theme transitions

- **Responsive Design**
  - Mobile-first approach
  - Adaptive layouts for all screen sizes
  - Touch-friendly interactions

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.8.2 | Type safety |
| **Vite** | 6.2.0 | Build tool & dev server |
| **Tailwind CSS** | CDN | Utility-first styling |
| **Socket.io Client** | 4.8.3 | Real-time communication |

### Rich Text Editing

| Package | Version | Purpose |
|---------|---------|---------|
| **@tiptap/react** | 2.5.7 | React integration |
| **@tiptap/core** | 2.5.7 | Core editor |
| **@tiptap/starter-kit** | 2.5.7 | Essential extensions |
| **ProseMirror** | 1.x | Underlying editor engine |

### State Management & Context

- React Context API for global state
- Custom hooks for auth, theme, and live editing
- LocalStorage for persistence

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/syncspace.git
   cd syncspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` directory.

---

## 📁 Project Structure

```
synnnncspace-main/
├── components/              # React components
│   ├── auth/               # Authentication components
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── admin/              # Admin-only components
│   │   └── AdminDashboard.tsx
│   ├── CalendarView.tsx    # Calendar interface
│   ├── ChatView.tsx        # Chat interface
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Header.tsx          # App header/navigation
│   ├── KanbanBoard.tsx     # Kanban board view
│   ├── LandingPage.tsx     # Landing page
│   ├── PresenceIndicator.tsx
│   ├── TaskCard.tsx        # Individual task cards
│   ├── TaskEditor.tsx      # Rich text task editor
│   ├── TaskModal.tsx       # Task detail modal
│   ├── ThemeToggle.tsx     # Dark mode toggle
│   └── TiptapEditor.tsx    # Tiptap editor wrapper
├── contexts/               # React Context providers
│   ├── AuthContext.tsx     # Authentication state
│   ├── LiveEditingContext.tsx # Real-time sync
│   └── ThemeContext.tsx    # Theme management
├── services/               # Business logic & APIs
│   ├── liveEditingService.ts  # WebSocket/live editing
│   └── mockBackend.ts      # Mock authentication API
├── App.tsx                 # Root component
├── index.tsx              # Application entry point
├── types.ts               # TypeScript type definitions
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies & scripts
```

---

## 📖 Usage Guide

### First Time Setup

1. **Register an Account**
   - Click "Register" on the landing page
   - The first user registered becomes an admin
   - Subsequent users are regular users

2. **Create Your First Board**
   - Navigate to the Dashboard
   - Boards are created automatically with sample tasks

3. **Create Tasks**
   - Click the "+" button in any column
   - Enter task details in the task editor
   - Tasks auto-save as you type

### Working with Tasks

- **Edit**: Click on any task card to open the editor
- **Move**: Drag tasks between columns on the Kanban board
- **View**: Switch between Kanban and Calendar views
- **Format**: Use the rich text editor for detailed descriptions

### Admin Features

- Access the Admin Dashboard from the header menu
- View all registered users
- Delete users (except yourself)
- Monitor user roles

### Collaboration

- Multiple users can edit simultaneously
- See real-time presence indicators
- Changes sync automatically across all connected clients

---

## 🏗 Architecture

### Data Flow

```
User Action → Component → Context → Service → Storage
                                      ↓
                                 Live Editing
                                      ↓
                              Other Clients
```

### State Management

- **AuthContext**: User authentication, session management
- **ThemeContext**: Dark/light mode preferences
- **LiveEditingContext**: Real-time synchronization

### Storage Strategy

Currently uses **localStorage** for:
- User accounts and authentication
- Task data and boards
- Theme preferences
- Live editing state

> **Note**: This is a mock backend. Data persists only in your browser and is not shared across devices. A real backend implementation would use a database and WebSocket server.

### Live Editing Implementation

The app uses a simulated live editing system that can be easily replaced with real WebSocket connections:

- **Current**: Custom events + localStorage for same-tab communication
- **Future**: Socket.io connection to a real backend server
- **Commented code** in `liveEditingService.ts` shows WebSocket integration points

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- Context API for state management
- Tailwind for styling

---

## 🗺 Roadmap

### Current Status: Frontend Complete ✅

### Planned Features

- [ ] **Backend Implementation**
  - [ ] Node.js/Express server
  - [ ] PostgreSQL/MongoDB database
  - [ ] Real WebSocket server with Socket.io
  - [ ] JWT authentication
  - [ ] RESTful API endpoints

- [ ] **Enhanced Features**
  - [ ] File attachments on tasks
  - [ ] Task comments and activity log
  - [ ] Advanced filtering and search
  - [ ] Task templates
  - [ ] Email notifications
  - [ ] Export to CSV/PDF

- [ ] **Collaboration**
  - [ ] @mentions in chat
  - [ ] Task assignments
  - [ ] Team workspaces
  - [ ] Activity feeds

- [ ] **DevOps**
  - [ ] Docker containerization
  - [ ] CI/CD pipeline
  - [ ] Automated testing
  - [ ] Production deployment

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Tiptap** - Excellent headless rich text editor
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io** - Real-time communication library
- **React Team** - Amazing UI library

---

<div align="center">

**Built with ❤️ using React and TypeScript**

[Report Bug](https://github.com/yourusername/syncspace/issues) · [Request Feature](https://github.com/yourusername/syncspace/issues)

</div>
