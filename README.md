# CareerTrack Lite

> A full-stack job application tracker — register, log every application, follow it
> through your pipeline (Saved → Applied → Assessment → Interview → Offer / Rejected),
> and see where you stand at a glance.

Built as a 3-day individual project: a React + TypeScript frontend, an Express +
TypeScript REST API, and a PostgreSQL database accessed through Prisma ORM. Each
user can only see and modify **their own** applications.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Installation](#local-installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [Testing](#testing)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Authentication & Authorization](#authentication--authorization)
- [Pages](#pages)
- [Deployment](#deployment)
- [AI Tools Used](#ai-tools-used)
- [Challenges, Limitations & Future Work](#challenges-limitations--future-work)

---

## Features

- **Secure auth** — registration & login with bcrypt-hashed passwords and JWT sessions.
- **Full CRUD** — create, read, update, and delete job applications.
- **Strict ownership** — every application route is scoped to the authenticated user;
  no user can read or mutate another user's data.
- **Pipeline tracking** — six statuses (`Saved`, `Applied`, `Assessment`, `Interview`,
  `Rejected`, `Offer`) with visual badges.
- **Dashboard stats** — total, per-status counts, and recently added applications.
- **Search, filter & sort** — by company, job title, status, source, and newest/oldest.
- **Rich UI** — responsive layout with sidebar navigation, loading / empty / error
  states, delete confirmation, and disabled submit buttons during submission.
- **Extras** — analytics charts, calendar view, pipeline board, saved-jobs view,
  settings, and a command palette.

---

## Tech Stack

| Layer      | Technology                                                            |
| ---------- | --------------------------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, dnd-kit |
| Backend    | Node.js, Express 4, TypeScript, Zod (validation)                      |
| Database   | PostgreSQL (hosted on Neon) via Prisma ORM                            |
| Auth       | JWT (`jsonwebtoken`), bcrypt password hashing                          |
| Testing    | Vitest + Testing Library (frontend unit/integration)                  |
| Deployment | Vercel (frontend) · Render (backend/API) · Neon (PostgreSQL)          |

---

## Project Structure

```
careertrack-lite/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI primitives (ui/), forms, route guards
│   │   ├── context/         # AuthContext, ToastContext
│   │   ├── hooks/           # useApplications, useDashboard, useAnalytics, ...
│   │   ├── pages/           # Landing, Login, Register, Dashboard, Applications, ...
│   │   ├── services/        # API client + per-domain services
│   │   ├── types/           # Shared TypeScript types
│   │   └── utils/           # Formatting & helpers
│   ├── index.html
│   ├── tailwind.config.js  # Brand/surface/ink design tokens
│   └── vite.config.ts       # Dev proxy: /api -> :5000
├── server/                 # Express + TypeScript API
│   ├── prisma/              # schema.prisma, migrations, seed.ts
│   ├── src/
│   │   ├── controllers/      # auth, application, dashboard, analytics
│   │   ├── middlewares/      # auth, error-handler, rate-limiter
│   │   ├── routes/           # auth, application, dashboard, analytics, health
│   │   ├── services/         # Business logic
│   │   ├── utils/            # prisma client, password, token
│   │   └── server.ts         # App entrypoint
│   └── .env.example
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ (tested on 20+)
- **npm** 9+
- A **PostgreSQL** database — a free [Neon](https://neon.com) project works well
- (Optional) **Git** for version control

---

## Local Installation

```bash
# 1. Clone
git clone https://github.com/mdadeel/Career-Tracker.git
cd Career-Tracker

# 2. Install server deps
cd server && npm install

# 3. Install client deps (new terminal)
cd ../client && npm install
```

---

## Environment Variables

Copy the example files and fill in real values. **Never commit `.env`.**

### `server/.env`

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DB?schema=public"

# JWT
JWT_SECRET="a-long-random-string-change-in-production"
JWT_EXPIRY="24h"

# Server
PORT=5000
NODE_ENV="development"

# Frontend URL (CORS)
CLIENT_URL="http://localhost:5173"
```

### `client/.env`

```env
# API base URL (used by the Vite dev proxy & build)
VITE_API_URL="http://localhost:5000/api"
```

> In production the client is built and `VITE_API_URL` points at the deployed API.

---

## Database Setup

```bash
cd server

# Generate the Prisma client
npx prisma generate

# Create & apply migrations (PostgreSQL)
npx prisma migrate dev --name init

# (Optional) Seed a demo user + sample applications
npm run db:seed
```

The seed creates a demo account:

```
Email:    alex@example.com
Password: password123
```

Use these as your **test credentials** when submitting / demoing.

---

## Running the App

Two terminals:

```bash
# Terminal 1 — API (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` requests to the
API on port 5000.

---

## Testing

```bash
cd client
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # with coverage
```

The suite covers the auth context, the applications hook, the API client, the
cache, and formatting utilities (5 test files).

---

## API Reference

Base URL: `/api`. All response bodies follow
`{ success: boolean, data?: ..., message?: string }`.

### Auth — `/api/auth`

| Method | Endpoint            | Auth | Purpose                |
| ------ | ------------------- | ---- | ---------------------- |
| POST   | `/register`         | –    | Create account         |
| POST   | `/login`            | –    | Log in (returns JWT)   |
| GET    | `/me`               | ✅   | Current user profile   |
| PATCH  | `/password`         | ✅   | Change password        |

### Applications — `/api/applications`

| Method | Endpoint     | Auth | Purpose                |
| ------ | ------------ | ---- | ---------------------- |
| GET    | `/`          | ✅   | List **own** apps (supports `?search=&status=&source=&sortBy=newest\|oldest`) |
| GET    | `/:id`       | ✅   | View one application   |
| POST   | `/`          | ✅   | Create application     |
| PATCH  | `/:id`       | ✅   | Update application     |
| DELETE | `/:id`       | ✅   | Delete application     |

### Dashboard — `/api/dashboard`

| Method | Endpoint   | Auth | Purpose                  |
| ------ | ---------- | ---- | ------------------------ |
| GET    | `/stats`   | ✅   | Totals + per-status counts + recent apps |

### Analytics — `/api/analytics`

| Method | Endpoint   | Auth | Purpose                |
| ------ | ---------- | ---- | ---------------------- |
| GET    | `/stats`   | ✅   | Aggregated analytics   |

### Health — `/api/health`

| Method | Endpoint | Auth | Purpose           |
| ------ | -------- | ---- | ----------------- |
| GET    | `/`      | –    | `{ status: "healthy" }` |

**Auth header:** `Authorization: Bearer <token>`. Missing/invalid tokens return
`401 { success: false, message: "Authentication required" | "Invalid or expired token" }`.

---

## Data Model

Defined in `server/prisma/schema.prisma` (PostgreSQL).

### `User` (table: `users`)

| Field         | Type      | Notes                |
| ------------- | --------- | -------------------- |
| `id`          | UUID      | Primary key          |
| `name`        | String    |                      |
| `email`       | String    | Unique              |
| `passwordHash`| String    | bcrypt hash          |
| `createdAt` / `updatedAt` | DateTime | Auto |

### `Application` (table: `applications`)

| Field            | Type                       | Notes                          |
| ---------------- | -------------------------- | ------------------------------ |
| `id`             | UUID                       | Primary key                    |
| `companyName`    | String                     | Required                       |
| `jobTitle`       | String                     | Required                       |
| `jobUrl`         | String?                    | Job post URL                   |
| `source`         | Enum `ApplicationSource`   | LinkedIn, Bdjobs, Indeed, Wellfound, Facebook, Referral, Other |
| `applicationDate`| DateTime                   | Required                       |
| `status`         | Enum `ApplicationStatus`   | Default `Saved`                |
| `notes`          | String?                    |                                |
| `jobDescription` | String?                    | Optional extras                |
| `resumeLink`     | String?                    |                                |
| `interviewDate`  | DateTime?                  |                                |
| `salaryMin/Max`  | Int?                       |                                |
| `salaryCurrency` | String                     | Default `USD`                  |
| `location`       | String?                    |                                |
| `employmentType` | String?                    |                                |
| `remoteStatus`   | String?                    |                                |
| `companyLogo`    | String?                    |                                |
| `userId`         | String                     | FK → `users.id` (cascade delete) |
| `createdAt` / `updatedAt` | DateTime          | Auto                           |

**Relationship:** one `User` has many `Application`s; each `Application` belongs to
one `User`. Indexes on `userId` and `(userId, status)` back the per-user queries.

---

## Authentication & Authorization

- Passwords are hashed with **bcrypt** before storage (see `server/src/utils/password.ts`).
- Login returns a **JWT** (`server/src/utils/token.ts`); the client stores it in
  `localStorage` and sends it as a Bearer token.
- `authMiddleware` verifies the token on every protected route and attaches
  `req.user`. Invalid/missing tokens → `401`.
- **Ownership** is enforced in the application service layer: queries are always
  filtered by `userId`, so a user can never access another user's applications.

---

## Pages

| Route              | Page                | Access     |
| ------------------ | ------------------- | ---------- |
| `/`                | Landing (home)      | Public     |
| `/login`           | Login               | Public     |
| `/register`        | Register            | Public     |
| `/dashboard`       | Dashboard + stats   | Protected  |
| `/applications`    | All applications    | Protected  |
| `/applications/new`| Add application     | Protected  |
| `/applications/:id/edit` | Edit application | Protected  |
| `/analytics`       | Analytics charts    | Protected  |
| `/calendar`        | Calendar view       | Protected  |
| `/pipeline`        | Pipeline board      | Protected  |
| `/saved-jobs`      | Saved jobs          | Protected  |
| `/settings`        | Settings            | Protected  |
| `*`                | 404                 | Public     |

The landing page is built with components inspired by
[21st.dev](https://21st.dev) patterns (animated gradient background, cursor
spotlight, animated gradient headline text, scroll-reveal), adapted to the
project's Tailwind design tokens.

---

## Deployment

### Backend (Render)

1. Create a new **Web Service** pointing at the repo's `server/` directory.
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `npm start`
4. Add env vars: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRY`,
   `PORT`, `NODE_ENV=production`, `CLIENT_URL` (your Vercel URL).
5. Run `npx prisma migrate deploy` (via Render's shell or a release step).

### Frontend (Vercel)

1. Import the repo and set the root to `client/`.
2. Build command: `npm run build` · Output: `dist`.
3. Set `VITE_API_URL` to the deployed Render API URL.

### Database (Neon)

- Create a free project, copy `DATABASE_URL` and `DIRECT_URL` into the backend env.

> **Final testing before submitting:** open the live site in an incognito window,
> log in with the test credentials, confirm `/api/health` responds, create/edit/
> delete an application, and check the mobile layout.

---

## AI Tools Used

AI tooling was used for **learning, planning, and debugging only**. The code was
written and is fully understood by the author. Specifically, AI assisted with:
- Translating the 21st.dev component patterns into the project's existing design
  tokens for the landing page.
- Generating and refining README/test scaffolding.
- Debugging build and lint issues.

All submitted code is original and explainable.

---

## Challenges, Limitations & Future Work

**Challenges solved**
- Enforcing per-user data isolation end-to-end (middleware + service-layer filtering).
- Mapping third-party UI component styles onto a bespoke Tailwind token system
  without introducing a conflicting dependency (e.g. framer-motion was avoided by
  reimplementing animations with CSS keyframes).

**Known limitations**
- The server build currently has a few unused-import TypeScript warnings in
  `CommandPalette.tsx`, `CalendarPage.tsx`, and `PipelinePage.tsx` that should be
  cleaned before a strict `tsc` production build.
- No automated CI; tests are run locally.

**Future improvements**
- Add the optional AI job-description summarizer (paste a JD → skills / prep topics
  / interview questions), kept behind a flag so the tracker works without it.
- Add pagination for large application lists.
- Add password-reset flow and email verification.
- Introduce end-to-end (Playwright) tests for the core journey.

---

## Author

CareerTrack Lite — individual 3-day project submission.
