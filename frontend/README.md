# EduPilot AI — Frontend

> Next.js 16 App Router frontend for the EduPilot AI study platform.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Routing & Pages](#routing--pages)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [Middleware (Route Guard)](#middleware-route-guard)
- [Developer Notes](#developer-notes)

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **Next.js 16** | App Router, Server Components, Middleware |
| **React 19** | UI layer |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Utility-first styling |
| **shadcn/ui + Radix UI** | Accessible, unstyled component primitives |
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |
| **Axios** | HTTP client (with interceptors) |
| **jose + jwt-decode** | JWT verification in middleware and client |
| **Recharts** | Analytics charts |
| **react-markdown** | Render AI-generated markdown responses |
| **Lucide React** | Icon library |

---

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Backend server running (see root `README.md`)

---

## Installation

```bash
cd frontend
npm install
```

---

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# Backend API base URL (no trailing slash)
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"

# Must match the backend ACCESS_TOKEN_SECRET exactly
# Used only in Next.js middleware (proxy.ts) for server-side token verification
JWT_ACCESS_SECRET="your-access-token-secret"
```

> **Note:** `JWT_ACCESS_SECRET` is a **server-only** variable (no `NEXT_PUBLIC_` prefix). It is used exclusively inside `proxy.ts` (Next.js middleware) and never exposed to the browser.

---

## Project Structure

```
frontend/src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth group layout (redirects logged-in users)
│   │   ├── layout.tsx            # Guards: redirects authenticated → /dashboard
│   │   ├── login/page.tsx        # /login
│   │   ├── register/page.tsx     # /register
│   │   └── auth/
│   │       └── oauth/
│   │           └── error/page.tsx # /auth/oauth/error — OAuth failure page
│   │
│   ├── (root)/                   # Main app group
│   │   ├── layout.tsx            # Shared navbar + layout wrapper
│   │   ├── page.tsx              # / — Landing / Home page
│   │   ├── pricing/page.tsx      # /pricing
│   │   └── (protected)/          # Requires authenticated user
│   │       ├── layout.tsx        # Auth check wrapper
│   │       ├── dashboard/        # /dashboard
│   │       ├── documents/        # /documents, /documents/[id]
│   │       ├── flashcards/       # /flashcards
│   │       ├── quizzes/          # /quizzes, /quizzes/[quizId], /quizzes/[quizId]/result
│   │       ├── profile/          # /profile
│   │       ├── change-password/  # /change-password
│   │       ├── payment/          # /payment, /payment/history, /payment/success …
│   │       ├── progress/         # /progress
│   │       └── admin/            # /admin — Admin-only pages
│   │
│   ├── globals.css               # Global Tailwind base styles
│   ├── layout.tsx                # Root layout (fonts, providers)
│   └── not-found.tsx             # 404 page
│
├── components/
│   └── ui/                       # shadcn/ui components (Button, Card, Badge …)
│
├── config/
│   └── authRoutes.ts             # Route ownership map (PUBLIC / USER / ADMIN / COMMON)
│
├── hooks/
│   └── useAuth.ts                # Central auth hook (login, register, logout, changePassword)
│
├── lib/
│   ├── axiosInstance.ts          # Axios instance + authAPI methods
│   ├── authUtils.ts              # localStorage token + user helpers
│   ├── jwtUtils.ts               # Client-side JWT decode/verify
│   └── tokenUtils.ts             # Token expiry helpers
│
├── schemas/
│   └── auth.schema.ts            # Zod schemas: register, login, changePassword
│
├── services/
│   └── auth.services.ts          # Server-action style helpers (refresh tokens, getUserInfo)
│
├── types/                        # Global TypeScript type declarations
│
└── proxy.ts                      # Next.js middleware — route guard
```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev** | `npm run dev` | Start Next.js dev server at `localhost:3000` |
| **Build** | `npm run build` | Production build with type-checking |
| **Start** | `npm start` | Serve production build |
| **Lint** | `npm run lint` | Run ESLint across the project |

---

## Routing & Pages

### Public routes (no auth required)

| Path | Description |
|---|---|
| `/` | Landing page with hero, features, pricing sections |
| `/pricing` | Full pricing page |
| `/login` | Sign in with email/password or Google |
| `/register` | Create a new account |
| `/auth/oauth/error` | Shown when Google OAuth fails |

### Protected routes (login required)

| Path | Description |
|---|---|
| `/dashboard` | Overview stats, recent docs & quizzes |
| `/documents` | List uploaded PDFs |
| `/documents/[id]` | Document detail + AI chat + summary |
| `/documents/[id]/flashcard` | Flashcard viewer for a document |
| `/flashcards` | All flashcard sets |
| `/quizzes` | All quizzes |
| `/quizzes/[quizId]` | Take a quiz |
| `/quizzes/[quizId]/result` | Quiz result details |
| `/progress` | Learning analytics charts |
| `/profile` | User profile & subscription info |
| `/change-password` | Update account password |
| `/payment` | Subscription checkout |
| `/payment/history` | Past payment records |
| `/payment/success` | Post-checkout success page |
| `/payment/cancel` | Checkout cancelled |
| `/payment/failed` | Payment failed |

### Admin-only routes

| Path | Description |
|---|---|
| `/admin/dashboard` | Platform-wide stats |
| `/admin/users` | User management |
| `/admin/users/[id]` | Individual user detail |

---

## Authentication

The app uses a **dual-token** system:

```
┌─────────────────────────────────────────────────────────────────┐
│  accessToken (JWT, 15 min)    — stored in HttpOnly cookie       │
│  refreshToken (JWT, 7 days)   — stored in HttpOnly cookie       │
│  better-auth.session_token    — stored in HttpOnly cookie       │
│  user info                    — stored in localStorage          │
└─────────────────────────────────────────────────────────────────┘
```

- `useAuth` hook provides: `user`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`, `changePassword`, `googleLogin`, `refreshAccessToken`, `error`
- `proxy.ts` (Next.js Middleware) intercepts every request and enforces access rules:
  - Logged-in users → redirected away from `/login`, `/register`
  - Unauthenticated users → redirected to `/login` from protected routes
  - ADMIN routes → redirected to default dashboard if role is USER
  - Proactive token refresh when access token is near expiry

---

## API Integration

All HTTP calls go through `src/lib/axiosInstance.ts`:

```ts
// Base URL from environment variable
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,   // ← sends cookies automatically
});
```

The `authAPI` object wraps common auth calls:

```ts
authAPI.register(data)
authAPI.login(data)
authAPI.logout()
authAPI.changePassword(data)
authAPI.googleLogin(redirectPath?)
```

For all other resources, use `axiosInstance` directly:

```ts
import axiosInstance from '@/lib/axiosInstance';

// Example
const res = await axiosInstance.get('/documents');
const res = await axiosInstance.post('/ai/chat', { documentId, message });
```

---

## Middleware (Route Guard)

`src/proxy.ts` runs as a **Next.js Edge Middleware** on every request (excluding `_next/static`, images, and known static files).

**Rules enforced:**

| Rule | Condition | Action |
|---|---|---|
| 1 | Auth page + valid token | Redirect → default dashboard |
| 2 | Public route | Allow |
| 3 | Protected route + no token | Redirect → `/login?redirect=…` |
| 4 | Valid token but expiring soon | Refresh token proactively |
| 5 | COMMON protected route | Allow |
| 6 | Role-mismatch on role-specific route | Redirect → default dashboard |

---

## Developer Notes

- **shadcn/ui components** live in `src/components/ui/`. Do not edit them directly — re-run `npx shadcn-ui add <component>` to update.
- **Zod schemas** for all forms are centralized in `src/schemas/auth.schema.ts`. Add new schemas there.
- **Route ownership** (PUBLIC / USER / ADMIN / COMMON) is configured in `src/config/authRoutes.ts`. Always update this file when adding new pages.
- **`confirmPassword` fields** are stripped before sending to the API (`const { confirmPassword: _, ...submitData } = data`).
- The `tsc --noEmit` check produces one `.next/` type error from Next.js internals — this is a known Next.js 16 canary issue and does **not** affect the build (`next build` exits 0).
- All auth pages use a **split-layout** design: decorative gradient panel on the left (hidden on mobile), form on the right.
