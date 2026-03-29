# EduPilot Backend API

The backend service for **EduPilot**, an AI-powered educational platform. This RESTful API handles user authentication, document uploads, AI-driven generation of educational materials (flashcards, quizzes, summaries), payment processing, and comprehensive admin management.

## 🚀 Features

- **Robust Authentication**: Powered by Better-Auth, supporting email/password and Google OAuth, with secure session and JWT management.
- **Document Management**: Upload and process educational documents (PDFs, DOCs) stored securely via Cloudinary.
- **AI Engine (Gemini)**:
  - Generate automated Flashcards from documents.
  - Create dynamic Quizzes with automated grading.
  - Summarize documents and provide conversational AI "chat-with-document" capabilities.
- **Progress Tracking**: Track user quiz scores, flashcard reviews, and overall learning dashboards.
- **Payments & Subscriptions**: Stripe integration for handling free and premium user tiers.
- **Admin Module**: Dedicated administration endpoints for managing users, monitoring documents, tracking revenue, and platform analytics.

## 🛠️ Tech Stack

- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma (with multi-file schema configuration)
- **Authentication**: Better-Auth
- **AI Integration**: Google GenAI (Gemini)
- **Payment Gateway**: Stripe

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database
- API Keys for Google Gemini, Stripe, and Cloudinary.

## ⚙️ Installation

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd developement/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root of the `backend` directory based on required services:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/edupilot?schema=public"

   # Authentication
   BETTER_AUTH_SECRET="your-super-secret-key"
   BETTER_AUTH_URL="http://localhost:5000"

   # AI integration
   GEMINI_API_KEY="your-gemini-api-key"

   # Stripe
   STRIPE_SECRET_KEY="your-stripe-secret"
   
   # Cloudinary (If applicable based on storage setup)
   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
   ```

## 🗄️ Database Setup (Prisma)

This project uses Prisma's `prismaSchemaFolder` preview feature to organize models into separate files.

1. **Run Migrations (Apply schema to the database):**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Generate Prisma Client:**
   *Note: Ensure you are in the `developement/backend` folder so it reads `prisma.config.ts`.*
   ```bash
   npx prisma generate
   ```

## 💻 Running the Application

**Development Mode (with hot-reload):**
```bash
npm run dev
```

**Linting:**
```bash
npm run lint
```

## 📁 Project Structure

```text
src/
├── app/
│   ├── config/         # Environment variables & configuration
│   ├── errors/         # Custom AppError classes
│   ├── lib/            # External service initialization (Prisma, Auth, Cloudinary)
│   ├── middleware/     # Auth, usage limiting, global error handling
│   ├── module/         # Feature-based domain modules
│   │   ├── admin/      # Admin dashboard & management
│   │   ├── ai/         # Gemini interactions
│   │   ├── auth/       # Better-Auth integration
│   │   ├── document/   # File uploads and processing
│   │   ├── flashcard/  # Spaced repetition logic
│   │   ├── payment/    # Stripe checkouts
│   │   ├── progress/   # User statistics
│   │   └── quiz/       # Assessment logic
│   └── routes/         # Centralized API router
├── utils/              # Helper functions (token, formatting)
├── app.ts              # Express application configuration
└── server.ts           # Server entry point
```

## 🔒 Security & Middleware

- **Soft Deletes**: Deleting users or flagging documents updates statuses rather than wiping data, preventing data loss.
- **Usage Limiter**: The `/api/v1/ai` routes are protected by a usage limiter. Free users are capped at 10 AI actions per day, while premium (subscribed) users enjoy higher limits to prevent API abuse.
- **Global Error Handling**: Production environments strip detailed stack traces to prevent sensitive information leakage.

## 📄 License

This project is licensed under the ISC License.
