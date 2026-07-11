# SR Food Ecosystem

Monorepo for the SR Food (ShreeRadheFood) platform — a railway food ordering system.

## Structure

```
srfood-ecosystem/
├── frontend/          # React + Vite + TanStack frontend
├── backend/           # Express.js + TypeScript backend API
├── README.md
└── .gitignore
```

## Frontend

- **Stack**: React 19, TanStack Router, TanStack Query, Vite, Tailwind CSS, Zustand
- **Build**: `cd frontend && npm run build`
- **Output**: `frontend/dist/`

## Backend

- **Stack**: Express.js, TypeScript, MongoDB (Mongoose), JWT auth
- **Build**: `cd backend && npm run build`
- **Start**: `cd backend && npm start`

## Development

### Prerequisites

- Node.js >= 18
- npm or bun

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/shubhamsingh325601/srfood-ecosystem.git
   cd srfood-ecosystem
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Copy environment templates:
   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.production backend/.env
   ```

5. Start development servers:
   ```bash
   # Terminal 1 - Frontend
   cd frontend && npm run dev

   # Terminal 2 - Backend
   cd backend && npm run dev
   ```

## Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
