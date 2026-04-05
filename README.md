# EduPilot AI

> **AI-powered study platform** — Turn any PDF into flashcards, adaptive quizzes, and a private AI tutor. Powered by Google Gemini.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [Common Scripts](#common-scripts)
- [Deployment](#deployment)

---

## Overview

EduPilot AI helps students learn faster by automatically processing uploaded PDF documents using the Gemini AI API to generate:

- **Flashcard sets** with spaced-repetition tracking
- **Adaptive quizzes** with scored results
- **Private AI tutor** — chat directly with any document
- **Document summaries** and concept explainers
- **Learning analytics** dashboard

The platform includes a **Stripe**-powered subscription system (Free tier + Pro Scholar) and full **Google OAuth** support via Better Auth.

---

## Architecture

```
B6A5/
├── backend/      # Node.js + Express REST API (TypeScript)
│   └── src/
│       ├── app/
│       │   ├── config/       # Environment variable loader
│       │   ├── errors/       # Custom AppError class
│       │   ├── lib/          # auth.ts, prisma.ts, cloudinary.ts
│       │   ├── middleware/   # checkAuth, usageLimiter, upload, validation
│       │   ├── module/       # Feature modules (auth, document, quiz …)
│       │   ├── routes/       # Central router (index.ts)
│       │   ├── templates/    # EJS templates (Google OAuth redirect)
│       │   └── utils/        # JWT, token, cookie helpers
│       ├── app.ts            # Express app factory
│       └── server.ts         # HTTP server entry point
│
└── frontend/     # Next.js 16 App Router (React 19, TypeScript, Tailwind CSS v4)
    └── src/
        ├── app/              # Next.js pages (App Router)
        ├── components/       # Reusable UI components (shadcn/ui)
        ├── config/           # Auth route config
        ├── hooks/            # useAuth and other hooks
        ├── lib/              # axiosInstance, JWT utils, authUtils
        ├── schemas/          # Zod validation schemas
        ├── services/         # API service functions
        └── proxy.ts          # Next.js middleware (auth guard)
```

**Communication:** The frontend talks to the backend exclusively via `axios` over HTTP/HTTPS. Cookies (`accessToken`, `refreshToken`, `better-auth.session_token`) are set as `HttpOnly` cookies by the backend and forwarded automatically by the browser.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | ≥ 20 | Required for both frontend and backend |
| **npm** | ≥ 10 | Bundled with Node.js 20+ |
| **PostgreSQL** | ≥ 15 | Can use Railway, Supabase, or local |
| **Cloudinary account** | — | For PDF + file storage |
| **Google Cloud project** | — | For OAuth 2.0 credentials |
| **Gemini API key** | — | Google AI Studio → free tier available |
| **Stripe account** | — | For payment processing |

---

## Environment Setup

### Backend — `backend/.env`

```env
# Server
NODE_ENV=development
PORT=5000

# Database (PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@localhost:5432/edupilot"

# Better Auth (session management)
BETTER_AUTH_SECRET="a-long-random-secret-32-chars-min"
BETTER_AUTH_URL="http://localhost:5000"

# JWT
ACCESS_TOKEN_SECRET="your-access-token-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Better Auth session config (seconds)
BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN=86400
BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE=86400

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Frontend URL (for CORS & OAuth redirects)
FRONTEND_URL="http://localhost:3000"
```

### Frontend — `frontend/.env.local`

```env
# Backend API base URL
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"

# JWT secret (same as backend — used for client-side token decode in middleware)
JWT_ACCESS_SECRET="your-access-token-secret"
```

---

## Running Locally

> Run both servers simultaneously in separate terminal windows.

### 1. Clone & install

```bash
git clone <repository-url>
cd B6A5

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Set up the database

```bash
cd backend

# Run Prisma migrations
npm run migrate

# Generate Prisma client
npm run generate

# (Optional) Seed the admin user
npm run seed:admin
```

### 3. Start the backend

```bash
cd backend
npm run dev
# → http://localhost:5000
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
# → http://localhost:3000
```

---

## Common Scripts

### Backend

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start with hot-reload (`tsx watch`) |
| Build | `npm run build` | Compile to `dist/` via `tsup` |
| Start (prod) | `npm start` | `prisma migrate deploy && node dist/server.js` |
| Migrate | `npm run migrate` | Create + apply a new Prisma migration |
| Generate | `npm run generate` | Re-generate Prisma client |
| Seed admin | `npm run seed:admin` | Insert default admin user |
| DB push | `npm run push` | Push schema without migration (dev only) |
| Prisma Studio | `npm run studio` | Open Prisma GUI at `localhost:5555` |

### Frontend

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start Next.js dev server |
| Build | `npm run build` | Production build |
| Start (prod) | `npm start` | Serve built output |
| Lint | `npm run lint` | Run ESLint |

---

## Deployment

### Backend (Railway / Render / Fly.io)

- The **`start` script** runs `prisma migrate deploy && node dist/server.js` — migrations run automatically on each deploy.
- The **`build` script** runs `prisma generate && tsup …` — the `postinstall` hook also calls `prisma generate`.
- Set all variables from `backend/.env` as platform environment variables.
- Expose port `5000` (or set `PORT` env var to the platform-assigned port).

### Frontend (Vercel / Netlify)

- Set `NEXT_PUBLIC_API_URL` to the deployed backend URL.
- Set `JWT_ACCESS_SECRET` to match the backend value.
- Framework preset: **Next.js**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16 (App Router) |
| Frontend language | TypeScript + React 19 |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui + Radix UI |
| Form validation | React Hook Form + Zod |
| HTTP client | Axios |
| Charts | Recharts |
| Backend framework | Express.js 5 |
| Backend language | TypeScript |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | Better Auth + JWT |
| File storage | Cloudinary |
| AI engine | Google Gemini (via `@google/genai`) |
| Payments | Stripe |
| Build tool (backend) | tsup |
