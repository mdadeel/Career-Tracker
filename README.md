# CareerTrack Lite

> A production-grade, full-stack job application tracker — register, log every application, follow it
> through your pipeline (Saved → Applied → Assessment → Interview → Offer / Rejected), store JDs and resume links,
> and monitor conversion velocity from one private dashboard.

Built as an individual project: a React 18 + TypeScript frontend, an Express +
TypeScript REST API, and a PostgreSQL database accessed through Prisma ORM. Each
user can only see and modify **their own** applications with complete JWT-based data isolation.

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
- [Pages & UI Architecture](#pages--ui-architecture)
- [Deployment](#deployment)
- [AI Tools & Engineering Principles](#ai-tools--engineering-principles)
- [Challenges, Limitations & Future Work](#challenges-limitations--future-work)
- [Author & Credits](#author--credits)

---

## Features

- **Secure Auth** — Registration & login with bcrypt-hashed passwords and JWT sessions.
- **Full CRUD & Rich Data** — Create, read, update, and delete job applications with salary ranges ($ min/max/currency), location, employment type, remote status, JD text, and resume links.
- **Strict Ownership** — Every application route is scoped to the authenticated user; no user can read or mutate another user's data.
- **Visual Pipeline (Kanban Board)** — Six statuses (`Saved`, `Applied`, `Assessment`, `Interview`, `Rejected`, `Offer`) with visual badges and drag-and-drop column management (`@dnd-kit`).
- **Dashboard Stats & Insights** — Metrics for total applications, interviews, offers, response rate, time to interview, weekly submissions, and Clearbit company logos.
- **Bento 2.0 Feature Matrix** — Asymmetric 5-card micro-animation grid (Intelligent Pipeline, `Cmd+K` Command Input typewriter loop, Live Interview Calendar countdown, Analytics Conversion Funnel, JD & Resume Vault).
- **Interactive Sandbox / Playground** — Prospective users can test searching (company, title, location) and status filtering live on the landing page before registering.
- **SEO & Schema.org Engine** — Dynamic title/meta tag management, OpenGraph & Twitter Cards, and JSON-LD structured data (`SoftwareApplication` and `FAQPage` schemas via `react-helmet-async`).
- **Brand Logo System** — Modern SVG logo mark (`Logo.tsx`, `LogoFull.tsx`) featuring intersecting gradient ribbons that form a rising arrow mark.
- **Search, Filter & Sort** — Global search by company, job title, status, source, and newest/oldest sorting.
- **Rich UI & Dark Mode** — High-agency design-system tokens (`zinc-900`/`slate-900`), full dark mode support across all 12+ UI components, tactile spring physics (`hover:-translate-y-0.5 active:scale-[0.98]`), loading skeletons, empty states, and delete confirmation modals.
- **Extras** — Analytics charts (Recharts), interview calendar view, pipeline board, saved-jobs view (localStorage), settings, and a global `Cmd+K` command palette.

---

## Tech Stack

| Layer      | Technology                                                            |
| ---------- | --------------------------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS v3, React Router v6, Recharts, @dnd-kit, react-helmet-async, @phosphor-icons/react |
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
│   │   ├── components/      # UI primitives (ui/), forms, SEOHead, route guards
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

# Seed demo user + 24 realistic sample applications
npm run db:seed
```

The seed script creates a demo account populated with 24 realistic applications across 7 months (Stripe, Vercel, Linear, Supabase, Cloudflare, Figma, etc.):

```
Email:    demo@careertrack.app
Password: demo@123
```

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

Open **http://localhost:5173**. The Vite dev server proxies `/api` requests to the API on port 5000.

---

## Testing

```bash
cd client
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # with coverage
```

The suite covers the auth context, applications hook, API client, cache, and formatting utilities.

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
| `jobDescription` | String?                    | Full JD paste                  |
| `resumeLink`     | String?                    | Direct link to submitted resume|
| `interviewDate`  | DateTime?                  | Scheduled interview timestamp  |
| `salaryMin/Max`  | Int?                       | Salary range limits            |
| `salaryCurrency` | String                     | Default `USD`                  |
| `location`       | String?                    | Location / City                |
| `employmentType` | String?                    | Full-time, Part-time, Contract |
| `remoteStatus`   | String?                    | Remote, Hybrid, On-site        |
| `companyLogo`    | String?                    | Logo image URL                 |
| `userId`         | String                     | FK → `users.id` (cascade delete)|
| `createdAt` / `updatedAt` | DateTime          | Auto                           |

---

## Authentication & Authorization

- Passwords are hashed with **bcrypt** (rounds=10) before storage.
- Login returns a **JWT** token; the client stores it in `localStorage` and sends it as a Bearer token header.
- `authMiddleware` verifies the token on every protected route and attaches `req.user`.
- **Ownership** is strictly enforced in the application service layer: queries are filtered by `userId`, preventing cross-user data exposure.

---

## Pages & UI Architecture

| Route              | Page                | Access     | Description |
| ------------------ | ------------------- | ---------- | ----------- |
| `/`                | Landing (home)      | Public     | Asymmetric split hero, interactive tabbed mockup, Bento 2.0 feature grid, live sandbox, FAQ accordion, SEO Head & JSON-LD schema |
| `/login`           | Login               | Public     | User sign in with logo mark & brand subtitle |
| `/register`        | Register            | Public     | User registration with password validation |
| `/dashboard`       | Dashboard + stats   | Protected  | Metrics summary, pipeline distribution bars, weekly submissions, upcoming interviews, recent apps with Clearbit logos |
| `/applications`    | All applications    | Protected  | Filterable/searchable table view with JD & Resume indicators |
| `/applications/new`| Add application     | Protected  | Rich application form with salary, location, JD paste & resume link |
| `/applications/:id/edit` | Edit application | Protected | Edit application details |
| `/analytics`       | Analytics charts    | Protected  | Recharts monthly application trends, funnel counts, source effectiveness, and avg time to interview |
| `/calendar`        | Calendar view       | Protected  | Month grid displaying scheduled interviews and application dates |
| `/pipeline`        | Pipeline board      | Protected  | Drag-and-drop Kanban board spanning 6 stages (`@dnd-kit`) |
| `/saved-jobs`      | Saved jobs          | Protected  | LocalStorage bookmarking for job listings |
| `/settings`        | Settings            | Protected  | Account details & password change form |
| `*`                | 404                 | Public     | Not found fallback page |

---

## Deployment

### Backend (Render)

1. Create a new **Web Service** pointing at the repo's `server/` directory.
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `npm start`
4. Add env vars: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRY`, `PORT`, `NODE_ENV=production`, `CLIENT_URL` (your Vercel URL).
5. Run `npx prisma migrate deploy` (via Render's shell or release step).

### Frontend (Vercel)

1. Import the repo and set the root to `client/`.
2. Build command: `npm run build` · Output: `dist`.
3. Set `VITE_API_URL` to the deployed Render API URL.

### Database (Neon)

- Create a free PostgreSQL project, copy `DATABASE_URL` and `DIRECT_URL` into the backend env.

---

## AI Tools & Engineering Principles

AI tooling was used for **architectural design, high-agency planning, and code optimization**.
- **Design Taste Directives**: Enforced deterministic typography (`Geist`/`Satoshi`), desaturated color palettes, anti-center bias (asymmetric split hero), bento 2.0 motion specs, and zero generic placeholders (real company data).
- **SEO & Structured Data**: Built modular document head management using `react-helmet-async` with schema.org `SoftwareApplication` and `FAQPage` JSON-LD schemas.

---

## Author & Credits

**CareerTrack Lite** — Project Submission
- **Author**: Shahnawas Adeel
- **Student ID**: WEB12-1911
