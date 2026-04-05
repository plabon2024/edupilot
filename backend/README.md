# EduPilot AI — Backend

> Express.js 5 REST API powering the EduPilot AI platform. Built with TypeScript, Prisma ORM, PostgreSQL, Better Auth, Gemini AI, Cloudinary, and Stripe.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Auth](#-auth-apiv1auth)
  - [Documents](#-documents-apiv1documents)
  - [AI](#-ai-apiv1ai)
  - [Flashcards](#-flashcards-apiv1flashcards)
  - [Quizzes](#-quizzes-apiv1quizzes)
  - [Progress](#-progress-apiv1progress)
  - [Payments](#-payments-apiv1payments)
  - [Admin](#-admin-apiv1admin)
- [Testing with Postman](#testing-with-postman)
- [Error Response Format](#error-response-format)

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **Express.js 5** | HTTP framework |
| **TypeScript** | Type safety |
| **Prisma 7** | ORM + migrations |
| **PostgreSQL** | Primary database |
| **Better Auth** | Session management + Google OAuth |
| **JWT (jsonwebtoken)** | Access / refresh token generation |
| **Cloudinary** | PDF file storage |
| **Google Gemini** (`@google/genai`) | AI flashcard, quiz, chat generation |
| **Stripe** | Subscription payments + webhook |
| **Multer** | Multipart file parsing |
| **EJS** | Server-side template (OAuth redirect) |
| **Zod** | Request body validation |
| **tsup** | Production bundler |

---

## Prerequisites

- Node.js ≥ 20
- PostgreSQL database (local or remote — Railway, Supabase, etc.)
- Cloudinary account
- Google Cloud project with OAuth 2.0 credentials
- Google AI Studio API key (Gemini)
- Stripe account

---

## Installation

```bash
cd backend
npm install

# Copy env template and fill in values
cp .env.example .env

# Run database migrations
npm run migrate

# Generate Prisma client
npm run generate

# (Optional) seed admin user
npm run seed:admin
```

---

## Environment Variables

Create `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/edupilot?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="minimum-32-character-random-secret"
BETTER_AUTH_URL="http://localhost:5000"
BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN=86400
BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE=86400

# JWT
ACCESS_TOKEN_SECRET="your-access-token-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="111111111111111"
CLOUDINARY_API_SECRET="your-api-secret"

# Google OAuth
GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"

# Gemini AI
GEMINI_API_KEY="AIza..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# CORS / redirects
FRONTEND_URL="http://localhost:3000"
```

---

## Project Structure

```
backend/src/
├── app/
│   ├── config/
│   │   └── index.ts          # Loads env vars with dotenv
│   ├── errors/
│   │   └── AppError.ts       # Custom error class (message + HTTP status)
│   ├── interface/
│   │   └── index.d.ts        # Express Request type augmentation (req.user)
│   ├── lib/
│   │   ├── auth.ts           # Better Auth instance (Google OAuth, session config)
│   │   ├── prisma.ts         # Singleton Prisma client
│   │   └── cloudinary.ts     # Cloudinary SDK client
│   ├── middleware/
│   │   ├── checkAuth.ts      # JWT guard — attaches req.user
│   │   ├── globalErrorhandler.ts
│   │   ├── notFound.ts
│   │   ├── uploadToCloudinary.ts # Multer + Cloudinary stream uploader
│   │   ├── usageLimiter.ts   # Daily AI usage rate limiter
│   │   └── validateRequest.ts # Zod request validator
│   ├── module/
│   │   ├── auth/             # register, login, logout, refresh, change-password, Google OAuth
│   │   ├── document/         # Upload, list, get, update, delete PDFs
│   │   ├── ai/               # Flashcard gen, quiz gen, summary, chat, explain
│   │   ├── flashcard/        # List, review, star, delete flashcard sets
│   │   ├── quiz/             # Get, submit, results, delete quizzes
│   │   ├── progress/         # Dashboard stats, per-document progress
│   │   ├── payment/          # Stripe checkout, verify, webhook, history
│   │   └── admin/            # Admin dashboard, user/payment management
│   ├── routes/
│   │   └── index.ts          # Mounts all module routers under /api/v1
│   ├── templates/
│   │   └── googleRedirect.ejs # EJS template for post-OAuth token handoff
│   └── utils/
│       ├── cookie.ts         # Cookie set/clear helpers
│       ├── jwt.ts            # Sign/verify JWT
│       ├── token.ts          # Set HttpOnly cookie helpers
│       ├── pdfParser.ts      # pdf-parse wrapper
│       ├── textChunker.ts    # Text chunking for Gemini context
│       └── geminiService.ts  # Gemini API wrapper
├── app.ts                    # Express app factory (CORS, middleware, routes)
└── server.ts                 # HTTP server entry (bootstrap)
```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev** | `npm run dev` | `tsx watch` — hot-reload TypeScript |
| **Build** | `npm run build` | `prisma generate && tsup src/server.ts` |
| **Start** | `npm start` | Run migrations + serve `dist/server.js` |
| **Migrate** | `npm run migrate` | Create & apply new Prisma migration |
| **Generate** | `npm run generate` | Re-generate Prisma client after schema change |
| **Studio** | `npm run studio` | Open Prisma Studio at `localhost:5555` |
| **DB Push** | `npm run push` | Push schema without creating migration |
| **Seed Admin** | `npm run seed:admin` | Insert the initial admin user |

---

## Authentication

All protected routes use `checkAuth(Role.ADMIN, Role.USER)` middleware.

The middleware reads the **`accessToken`** from:
1. The `Authorization: Bearer <token>` header, **or**
2. The `accessToken` HttpOnly cookie

On success it attaches `req.user = { userId, role, email, name, … }` to the request.

**Cookie names set by the backend:**

| Cookie | Expiry | Description |
|---|---|---|
| `accessToken` | 15 min | Short-lived JWT |
| `refreshToken` | 7 days | Long-lived JWT for session renewal |
| `better-auth.session_token` | 1 day | Better Auth session (required for Google OAuth) |

### Postman — setting auth

Add the following to your **Postman collection** → *Variables*:

```
baseUrl   = http://localhost:5000/api/v1
token     = <paste accessToken here after login>
```

For each protected request, add a Header:
```
Authorization: Bearer {{token}}
```

Or configure the collection to send cookies automatically (Collection → Authorization → Cookie).

---

## API Reference

All endpoints are prefixed with `/api/v1`.  
Successful responses always follow:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

---

### 🔐 Auth `/api/v1/auth`

#### POST `/auth/register`
Register a new user account.

**Auth required:** No

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clx...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "USER",
      "emailVerified": true
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

#### POST `/auth/login`
Sign in with email and password.

**Auth required:** No

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "Password@123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": { "id": "clx...", "role": "USER", "email": "jane@example.com" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

#### GET `/auth/me`
Get the currently authenticated user's profile.

**Auth required:** Yes

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "emailVerified": true,
    "isSubscribed": false,
    "subscriptionEndsAt": null,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

#### POST `/auth/refresh-token`
Exchange a refresh token for new access + refresh tokens.

**Auth required:** No (reads `refreshToken` + `better-auth.session_token` from cookies)

**Response `200`:**
```json
{
  "success": true,
  "message": "Tokens refreshed",
  "data": { "accessToken": "eyJ...", "refreshToken": "eyJ..." }
}
```

---

#### POST `/auth/change-password`
Change the authenticated user's password.

**Auth required:** Yes

**Request body:**
```json
{
  "currentPassword": "OldPassword@1",
  "newPassword": "NewPassword@1"
}
```

**Response `200`:**
```json
{ "success": true, "message": "Password changed successfully" }
```

---

#### POST `/auth/logout`
Invalidate the current session.

**Auth required:** Yes

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

#### GET `/auth/login/google`
Redirect to Google OAuth consent page.

**Auth required:** No  
**Query params:** `redirect` (optional) — path to redirect to after success (e.g. `/dashboard`)

**Usage:** Navigate browser to this URL directly or call from frontend.

---

### 📄 Documents `/api/v1/documents`

All document routes require authentication.

---

#### POST `/documents/upload`
Upload a PDF document.

**Auth required:** Yes  
**Content-Type:** `multipart/form-data`

**Form fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✅ | PDF file |
| `title` | Text | ❌ | Optional display title |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "doc_abc",
    "fileName": "lecture.pdf",
    "title": "Lecture 1",
    "fileUrl": "https://res.cloudinary.com/...",
    "status": "PENDING",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

#### GET `/documents`
List all documents for the authenticated user.

**Auth required:** Yes

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "id": "doc_abc", "title": "Lecture 1", "fileName": "lecture.pdf", "status": "READY" }
  ]
}
```

---

#### GET `/documents/:id`
Get a single document by ID.

**Auth required:** Yes

---

#### PUT `/documents/:id`
Update document metadata.

**Auth required:** Yes

**Request body (all optional):**
```json
{
  "title": "Updated Title",
  "status": "READY"
}
```

---

#### DELETE `/documents/:id`
Delete a document and its associated data.

**Auth required:** Yes

**Response `200`:**
```json
{ "success": true, "message": "Document deleted" }
```

---

### 🤖 AI `/api/v1/ai`

All AI routes require authentication. Free-tier users are rate-limited to **5 AI calls/day** via `usageLimiter` middleware.

---

#### POST `/ai/generate-flashcards`
Generate flashcard set from a document.

**Auth required:** Yes

**Request body:**
```json
{ "documentId": "doc_abc" }
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "set_xyz",
    "documentId": "doc_abc",
    "flashcards": [
      { "id": "card_1", "front": "What is photosynthesis?", "back": "The process by which plants…" }
    ]
  }
}
```

---

#### POST `/ai/generate-quiz`
Generate a quiz from a document.

**Auth required:** Yes

**Request body:**
```json
{ "documentId": "doc_abc", "questionCount": 10 }
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "quiz_xyz",
    "title": "Lecture 1 Quiz",
    "questions": [
      {
        "id": "q_1",
        "question": "What does ATP stand for?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A"
      }
    ]
  }
}
```

---

#### POST `/ai/generate-summary`
Generate a concise summary of a document.

**Auth required:** Yes

**Request body:**
```json
{ "documentId": "doc_abc" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "summary": "This document covers…" }
}
```

---

#### POST `/ai/chat`
Send a message to the AI tutor for a specific document.

**Auth required:** Yes

**Request body:**
```json
{
  "documentId": "doc_abc",
  "message": "Explain the sodium-potassium pump in simple terms."
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "reply": "The sodium-potassium pump is a protein…" }
}
```

---

#### POST `/ai/explain-concept`
Explain a highlighted block of text in simple terms.

**Auth required:** Yes

**Request body:**
```json
{
  "documentId": "doc_abc",
  "concept": "Action potential depolarization phase"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "explanation": "Think of it like a wave of electricity…" }
}
```

---

#### GET `/ai/chat-history/:documentId`
Retrieve full chat history for a document.

**Auth required:** Yes

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "role": "user", "content": "What is ATP?", "createdAt": "…" },
    { "role": "assistant", "content": "ATP stands for…", "createdAt": "…" }
  ]
}
```

---

### 🃏 Flashcards `/api/v1/flashcards`

All flashcard routes require authentication.

---

#### GET `/flashcards`
List all flashcard sets for the authenticated user.

---

#### GET `/flashcards/document/:documentId`
List flashcard sets for a specific document.

---

#### POST `/flashcards/cards/:cardId/review`
Mark a flashcard as reviewed.

**Response `200`:** Updated card object.

---

#### PUT `/flashcards/cards/:cardId/star`
Toggle the starred status of a flashcard.

**Response `200`:** Updated card object.

---

#### DELETE `/flashcards/:id`
Delete a flashcard set and all its cards.

---

### 🧠 Quizzes `/api/v1/quizzes`

All quiz routes require authentication.

---

#### GET `/quizzes/document/:documentId`
List all quizzes for a document.

---

#### GET `/quizzes/:id`
Get a single quiz (with questions, without answers).

---

#### POST `/quizzes/:id/submit`
Submit answers for a quiz and get scored results.

**Request body:**
```json
{
  "answers": [
    { "questionId": "q_1", "selectedAnswer": "A" },
    { "questionId": "q_2", "selectedAnswer": "C" }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "score": 80,
    "totalQuestions": 10,
    "correctAnswers": 8,
    "results": [...]
  }
}
```

---

#### GET `/quizzes/:id/results`
Get the results of a previously submitted quiz.

---

#### DELETE `/quizzes/:id`
Delete a quiz.

---

### 📊 Progress `/api/v1/progress`

All progress routes require authentication.

---

#### GET `/progress/dashboard`
Get overview statistics for the authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalDocuments": 5,
      "totalFlashcardSets": 12,
      "totalFlashcards": 120,
      "reviewedFlashcards": 45,
      "starredFlashcards": 10,
      "totalQuizzes": 8,
      "completedQuizzes": 6,
      "averageScore": 82
    },
    "recentActivity": {
      "documents": [...],
      "quizzes": [...]
    }
  }
}
```

---

#### GET `/progress/document/:documentId`
Get learning progress for a specific document.

---

### 💳 Payments `/api/v1/payments`

---

#### POST `/payments/checkout`
Create a Stripe Checkout Session.

**Auth required:** Yes

**Request body:**
```json
{ "months": 1 }
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "url": "https://checkout.stripe.com/pay/cs_test_..." }
}
```

> Redirect the user to `data.url` to complete payment on Stripe's hosted page.

---

#### POST `/payments/verify`
Verify a completed Stripe session and activate subscription.

**Auth required:** Yes

**Request body:**
```json
{ "sessionId": "cs_test_..." }
```

---

#### POST `/payments/webhook`
Stripe webhook listener. **Must be called with a raw body.**

**Auth required:** No (verified by Stripe signature)  
**Header:** `Stripe-Signature: <sig>`

> Configure this in your Stripe Dashboard → Webhooks → Add endpoint.  
> Locally, use the Stripe CLI: `stripe listen --forward-to localhost:5000/webhook`

---

#### GET `/payments/status`
Get current subscription status for the authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "isSubscribed": true,
    "subscriptionEndsAt": "2025-02-15T00:00:00.000Z"
  }
}
```

---

#### GET `/payments/history`
List all past payments for the authenticated user.

---

#### GET `/payments/:id`
Get a single payment record by ID.

---

#### DELETE `/payments/:id`
Cancel a `PENDING` payment.

---

### 🛡️ Admin `/api/v1/admin`

All admin routes require authentication **with the `ADMIN` role**.

---

#### GET `/admin/dashboard`
Platform-wide statistics.

---

#### GET `/admin/users`
List all users with filtering.

**Query params:** `status`, `subscribed`, `search`, `page`, `limit`

---

#### GET `/admin/users/:id`
Get a single user's full details.

---

#### PATCH `/admin/users/:id`
Update user profile fields.

---

#### DELETE `/admin/users/:id`
Soft-delete a user account.

---

#### PATCH `/admin/users/:id/status`
Update account status (`ACTIVE` | `SUSPENDED` | `INACTIVE`).

**Request body:**
```json
{ "status": "SUSPENDED" }
```

---

#### PATCH `/admin/users/:id/role`
Change user role (`USER` | `ADMIN`).

**Request body:**
```json
{ "role": "ADMIN" }
```

---

#### PATCH `/admin/users/:id/subscription`
Manually update a user's subscription dates.

---

#### GET `/admin/payments`
List all platform payments with filtering.

**Query params:** `status`, `userId`, `dateFrom`, `dateTo`, `sort`, `page`, `limit`

---

#### PATCH `/admin/payments/:id/status`
Update payment status.

---

#### GET `/admin/documents`
List all documents across all users.

**Query params:** `status`, `userId`, `page`, `limit`

---

#### GET `/admin/analytics/users-growth`
User registration growth data (for charts).

---

#### GET `/admin/analytics/revenue`
Revenue data aggregated by time period.

---

#### GET `/admin/analytics/usage`
AI usage statistics.

---

## Testing with Postman

### Quick setup

1. Open Postman → **Import** → paste this base URL: `http://localhost:5000`
2. Create a new **Collection** called `EduPilot AI`
3. Add a **Collection Variable**: `baseUrl = http://localhost:5000/api/v1`

### Authentication flow

```
1. POST {{baseUrl}}/auth/register   → copy accessToken from response
2. In Collection → Authorization → Bearer Token → paste token
3. All requests in the collection will now send the token
```

### Upload a PDF (multipart)

```
Method : POST
URL    : {{baseUrl}}/documents/upload
Auth   : Bearer <token>
Body   : form-data
         Key: file   Type: File   Value: <select your PDF>
         Key: title  Type: Text   Value: My Lecture Notes
```

### Test Stripe webhook locally

```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to http://localhost:5000/webhook

# Copy the "whsec_..." signing secret shown → set as STRIPE_WEBHOOK_SECRET in .env
```

---

## Error Response Format

All errors return:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errorDetails": { ... }   // Only in development
}
```

**Common HTTP status codes:**

| Code | Meaning |
|---|---|
| `400` | Bad Request — validation failed |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role |
| `404` | Not Found |
| `409` | Conflict — e.g. email already exists |
| `429` | Too Many Requests — AI usage limit exceeded |
| `500` | Internal Server Error |
