# SyncSpace

A collaborative task management application with real-time editing capabilities.

## Features

- **Kanban Board** - Organize tasks with drag-and-drop columns
- **Calendar View** - Visualize tasks by date
- **Live Editing** - See updates in real-time across multiple users
- **Rich Text Editor** - Format task descriptions with Tiptap
- **Dark Mode** - Toggle between light and dark themes
- **User Authentication** - Login and register with role-based access
- **Admin Dashboard** - Manage users and permissions

## Tech Stack

- React 19
- TypeScript
- Vite
- Tiptap Editor
- Socket.io Client (for live editing)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build

```bash
npm run build
```

## Note

Currently runs with a mock backend using localStorage. Data persists in your browser but is not shared across devices.
