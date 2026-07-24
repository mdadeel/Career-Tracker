# 🎯 CareerTrack Lite

<div align="center">

![CareerTrack Banner](https://img.shields.io/badge/CareerTrack_Lite-SaaS_Job_Tracker-6366f1?style=for-the-badge&logo=target)

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-39825B?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Vitest](https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black)](https://neon.tech)

> A production-grade, highly secure, and responsive job application tracking SaaS. Register, log every application, track it through a visual pipeline, analyze metrics, and prepare for interviews using AI tools — all in one dashboard.

</div>

---

## 📖 Table of Contents
- [✨ Core Features](#-core-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📐 System Architecture](#-system-architecture)
- [🧬 Advanced Application Patterns](#-advanced-application-patterns)
- [🔒 Security Architecture](#-security-architecture)
- [🤖 AI Integration Engine](#-ai-integration-engine)
- [📂 Project Structure](#-project-structure)
- [🚀 Local Setup & Installation](#-local-setup--installation)
- [📈 Database Configuration](#-database-configuration)
- [🧪 Testing Suite](#-testing-suite)
- [📡 API Reference](#-api-reference)
- [📊 Data Models](#-data-models)
- [🗺️ Pages & UI Architecture](#-pages--ui-architecture)
- [🚢 Production Deployment](#-production-deployment)
- [🎓 Author & Submission Credits](#-author--submission-credits)

---

## ✨ Core Features

*   **🔒 Complete JWT Data Isolation** — Relational database isolation with token authorization. Users can only view or modify their own applications.
*   **📋 Full CRUD & Rich Application Metadata** — Store salary ranges ($ min/max/currency), location, employment type, remote status, full job descriptions (JDs), and resume links.
*   **📊 Interactive Dashboard & Metrics** — Real-time KPI summaries (Total Apps, Interview Count, Offers, Response Rate) and auto-updating recent activity feeds.
*   **🎛️ Drag-and-Drop Pipeline (Kanban)** — Manage applications across 6 stages (`Saved`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`) using a spring-animated column interface powered by `@dnd-kit`.
*   **📈 Deep Analytics & Visualizations** — 4 interactive Recharts diagrams charting monthly submission velocities, conversion funnels, source effectiveness, and status distributions.
*   **📅 Interview Calendar** — Comprehensive month-view grid displaying scheduled interviews and application dates.
*   **🛠️ Bento 2.0 Feature Matrix** — An asymmetric layout with micro-animations showing dynamic features (Intelligent Pipeline, `Cmd+K` Command typewriter, Interview countdowns, Analytics funnels, and JD Vaults).
*   **🎮 Live Sandbox Mode** — Allows visitors on the landing page to experience search and status filters on real-world mock data before registering.
*   **⚡ Premium User Experience** — Global keyboard shortcuts, Ctrl+K command palette, debounced inputs, local storage drafts, 30s TTL in-memory caching, responsive navigation (sidebar/mobile drawer), and full dark mode.
*   **🔍 SEO & Structured Metadata** — Helmet-driven document titles, OpenGraph tags, and JSON-LD structured data (`SoftwareApplication` and `FAQPage` schemas).

---

## 🛠️ Tech Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v3, React Router v6, Recharts, `@dnd-kit`, `react-helmet-async`, `@phosphor-icons/react` | Client-side routing, state mutations, interactive charts, drag-and-drop pipelines, responsive templates. |
| **Backend** | Node.js, Express 4, TypeScript, Zod (validation), Helmet (headers), Express Rate Limit | REST API endpoints, user authentication, payload validation, server security. |
| **Database** | PostgreSQL (Neon Cloud) via Prisma ORM Client | Relational schema management, transactions, connection pooling, and seeding. |
| **Testing** | Vitest, Testing Library (React/Hooks) | Component, helper, and custom hooks validation. |
| **Hosting** | Vercel (Client) · Render (Server/API) · Neon (Database) | Production CI/CD pipelines. |

---

## 📐 System Architecture

CareerTrack Lite operates as a decoupled, stateless SPA-API web application.

```mermaid
graph TB
    subgraph Client ["Client Interface (Browser)"]
        SPA[React SPA<br/>Vite + TypeScript + Tailwind]
    end

    subgraph Server ["Server Boundary (Render)"]
        API[Express.js REST API<br/>TypeScript]
        MW[Middleware Stack<br/>Auth · CORS · Rate Limit · Helmet]
        SVC[Service Layer<br/>Business Logic]
    end

    subgraph Data ["Data Storage (Neon Cloud)"]
        ORM[Prisma ORM Client]
        DB[(PostgreSQL Database)]
    end

    SPA -->|HTTPS + JWT Bearer| API
    API --> MW
    MW --> SVC
    SVC --> ORM
    ORM --> DB
```

### Component Flow

```mermaid
graph LR
    subgraph Frontend
        Pages[Pages<br/>Landing · Login · Dashboard<br/>Applications · Analytics]
        Components[Components<br/>Navbar · AppTable · AppForm<br/>Dialog · CommandPalette]
        Hooks[Hooks<br/>useAuth · useApplications<br/>useKeyboardShortcuts]
        Services[API Service Layer<br/>api.ts · authService.ts<br/>appService.ts · aiService.ts]
    end

    subgraph Backend
        Routes[Routes<br/>authRoutes · applicationRoutes<br/>analyticsRoutes · aiRoutes]
        Controllers[Controllers<br/>authController · appController<br/>aiController]
        Middlewares[Middlewares<br/>authMiddleware · rateLimiter<br/>errorHandler · validateRequest]
    end

    subgraph Database
        PrismaClient[Prisma Client<br/>TypeSafe Queries]
        PG[(PostgreSQL<br/>users · applications)]
    end

    Pages --> Components
    Pages --> Hooks
    Hooks --> Services
    Services -->|HTTP Requests| Routes
    Routes --> Middlewares
    Middlewares --> Controllers
    Controllers --> PrismaClient
    PrismaClient --> PG
```

---

## 🧬 Advanced Application Patterns

The codebase features advanced design patterns to ensure developer productivity, rapid client response times, and premium usability.

### 1. Optimistic CRUD & State Reconciliation
The application hook [useApplications.ts](file:///home/adeel/Documents/projects/task/client/src/hooks/useApplications.ts) implements optimistic UI updates. When a user creates, updates, or deletes an application:
*   The UI state is updated immediately based on the expected result.
*   The actual HTTP request runs in the background.
*   If the server request succeeds, the local state is reconciled.
*   If the server request fails, the client rolls back to the previous snapshot, and displays a localized error toast notification.

### 2. In-Memory Client Cache
To reduce network load, the API service layer [api.ts](file:///home/adeel/Documents/projects/task/client/src/services/api.ts) maintains a client-side in-memory cache:
*   A `Map<string, CacheEntry>` caches GET request responses with a **30-second Time-To-Live (TTL)**.
*   Any write operation (POST, PATCH, DELETE) automatically invalidates relevant cache entries.
*   Reduces database query load and ensures instant navigation between dashboard, pipeline, and calendar pages.

### 3. Keyboard Shortcuts Engine
The [useKeyboardShortcuts.ts](file:///home/adeel/Documents/projects/task/client/src/hooks/useKeyboardShortcuts.ts) hook provides a global keyboard listener:
*   Supports single-key triggers (`n` for new application, `/` to focus search).
*   Supports sequential key combinations (`g` then `d` to go to dashboard, `g` then `a` to go to applications page).
*   Supports modifier key combos (Ctrl+K / Cmd+K to launch the Command Palette).
*   Intelligently ignores triggers when keyboard focus is inside inputs, textareas, or selectable dropdowns.

### 4. Form Draft Auto-Save
Form components save unfinished data drafts to browser `localStorage` using a 1.5-second debounced function:
*   Protects users from losing long job descriptions or notes on accidental tab closes or navigation changes.
*   Drafts automatically expire after 24 hours to prevent stale data conflicts.
*   Separate local storage keys isolate modal drafts from standalone page drafts.

---

## 🔒 Security Architecture

CareerTrack Lite implements a multi-layered security strategy aligning with the OWASP Top 10 guidelines.

```mermaid
sequenceDiagram
    autonumber
    participant Client as React Client
    participant CORS as CORS Middleware
    participant RL as Rate Limiter
    participant Auth as Auth Middleware
    participant Validator as Zod Schema Validator
    participant DB as PostgreSQL (Neon)

    Client->>CORS: HTTP Request (Headers + JWT Bearer)
    CORS->>RL: Origin Check (CLIENT_URL)
    RL->>Auth: Request Rate limit check
    Auth->>Validator: Verify & Decode JWT Claim
    alt JWT Invalid/Expired
        Auth-->>Client: 401 Unauthorized
    else JWT Valid
        Validator->>DB: Parse & Sanitize Request
        alt Validation Fails
            Validator-->>Client: 400 Bad Request
        else Validation Passes
            DB-->>Client: Return Filtered Data (WHERE userId = id)
        end
    end
```

### Key Security Implementations

*   **🔑 Strict SQL Parameterization** — All database queries are executed via Prisma’s client wrapper, which auto-parameterizes values to prevent SQL injection.
*   **🛡️ Cryptographic Salted Hashing** — Passwords are hashed server-side with `bcrypt` (10 rounds). Raw passwords are never stored, logged, or returned in API responses.
*   **🎫 Stateless JWT Credentials** — Session authorization relies on JWTs signed with `HS256`. The payload contains only the non-sensitive fields `userId` and `email`. Tokens expire in 24 hours.
*   **🚦 Endpoint Rate Limiting** — Standard Express rate limit rules:
    *   `POST /api/auth/login`: Max 10 attempts per 15 minutes (brute-force defense).
    *   `POST /api/auth/register`: Max 5 accounts per hour.
    *   Global API: Max 100 requests per 15 minutes.
*   **🧬 Contextual Data Isolation** — All CRUD operations are scoped using authorization headers:
    ```typescript
    // server/src/services/application-service.ts
    const apps = await prisma.application.findMany({
      where: { userId: req.user.userId }
    });
    ```
*   **📦 HTTP Security Headers** — `helmet` sets headers to block MIME-type sniffing (`nosniff`), disable iframe embedding (`DENY` to protect against clickjacking), and limit referrers.

---

## 🤖 AI Integration Engine

The server includes a dedicated AI services wrapper ([ai.service.ts](file:///home/adeel/Documents/projects/task/server/src/services/ai.service.ts)) that supports multiple LLM providers.

```
       ┌────────────────────────┐
       │   AI SERVICE WRAPPER   │
       └───────────┬────────────┘
                   │
         ┌─────────┼─────────┬──────────────┐
         ▼         ▼         ▼              ▼
     [Gemini]   [OpenAI]  [OpenRouter]   [Custom]
         │         │         │              │
         └─────────┴────┬────┴──────────────┘
                        ▼
            [Pollinations AI Fallback]
```

### Supported Providers
1.  **Google Gemini** — Direct API connectivity (`gemini-2.5-flash` or custom configurations).
2.  **OpenAI** — Official API client compatibility (`gpt-4o-mini`, etc.).
3.  **OpenRouter** — High-availability gateway integration.
4.  **Custom Endpoints** — Connects to local or custom OpenAI-compatible proxies (e.g., Ollama, LM Studio).
5.  **Pollinations AI** — Zero-config system-default fallback ensuring all AI features work out-of-the-box without requiring an API key.

### Core Features
*   **📄 Job Spec Parser (`POST /api/ai/parse-jd`)** — Parses raw job description copy-paste blocks into structured schema fields:
    ```json
    {
      "companyName": "string",
      "jobTitle": "string",
      "location": "string",
      "salaryMin": 120000,
      "salaryMax": 150000,
      "salaryCurrency": "USD",
      "employmentType": "Full-time",
      "remoteStatus": "Remote",
      "extractedSkills": ["React", "TypeScript", "Prisma"]
    }
    ```
*   **🎯 Resume-to-JD Matcher (`POST /api/ai/match-score/:id`)** — Compares the user's saved resume text against a job description, calculating a match percentage and extracting missing vs. matching skills.
*   **💬 Interview Prep Generator (`POST /api/ai/interview-prep/:id`)** — Generates 5 realistic behavioral, technical, and situational interview questions with tips based on the STAR method.
*   **✉️ Professional Outreach Drafter (`POST /api/ai/generate-email`)** — Drafts templates for job application follow-ups, thank-you notes, or cold outreach emails.

---

## 📂 Project Structure

```
task/
├── client/                     # Vite + React Client
│   ├── src/
│   │   ├── components/         # Component architecture
│   │   │   ├── ui/             # Reusable design primitives (Buttons, Inputs, Dialogs)
│   │   │   ├── CommandPalette  # Global navigations palette
│   │   │   └── SEOHead.tsx     # Dynamic SEO manager
│   │   ├── constants/          # Select options, menus, and paths
│   │   ├── context/            # Context providers (Auth, Toast notification context)
│   │   ├── hooks/              # Custom hooks (optimistic handlers, theme detectors)
│   │   ├── pages/              # Routes components (Kanban board, analytics page, settings)
│   │   ├── services/           # Network request layers (cache filters, raw fetch handlers)
│   │   └── utils/              # Text parsing and layout formatters
│   ├── tailwind.config.js      # Brand design system tokens
│   └── vite.config.ts          # Proxy dev configurations
│
└── server/                     # Node.js + Express API
    ├── prisma/                 # Schema layout, migrations, and seed scripts
    └── src/
        ├── controllers/        # Express handlers (auth, analytics, AI routes)
        ├── middlewares/        # Security protections & rate limit filters
        ├── routes/             # Path definitions
        ├── services/           # Service layers and ORM connectors
        └── server.ts           # HTTP server bootstrapping
```

---

## 🚀 Local Setup & Installation

### Prerequisites
*   **Node.js** v18 or newer
*   **npm** v9 or newer
*   A **PostgreSQL** database (e.g., from [Neon.tech](https://neon.tech))

### Installation Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/mdadeel/Career-Tracker.git
    cd Career-Tracker
    ```

2.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

---

## 📈 Database Configuration

1.  **Set Environment Variables:**
    Create a `.env` file in the `server` directory based on [server/.env.example](file:///home/adeel/Documents/projects/task/server/.env.example):
    ```env
    PORT=5000
    DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?schema=public"
    DIRECT_URL="postgresql://USER:PASSWORD@HOST/DB?schema=public"
    JWT_SECRET="generate-a-long-random-string-here"
    JWT_EXPIRY="24h"
    CLIENT_URL="http://localhost:5173"
    ```

2.  **Generate Database Client:**
    ```bash
    npx prisma generate
    ```

3.  **Apply Database Migrations:**
    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Seed Demo Data:**
    Populates the database with a test user and 24 realistic applications across 7 months (Stripe, Notion, Cal.com, Fly.io, etc.):
    ```bash
    npm run db:seed
    ```

    > [!IMPORTANT]
    > **Default Seed Credentials:**
    > *   **Email:** `demo@careertrack.app`
    > *   **Password:** `demo@123`

---

## 🧪 Testing Suite

The testing suite contains components, hooks, service, and utility tests.

```bash
# Navigate to client directory
cd client

# Run all test cases once
npm test

# Run tests in watch mode for development
npm run test:watch

# Run tests with test coverage statistics
npm run test:coverage
```

---

## 📡 API Reference

Base Endpoint: `/api`

### 1. Authentication (`/api/auth`)
<details>
<summary>View Auth Endpoints</summary>

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | – | Register a new account. Returns a JWT and user object. |
| `POST` | `/login` | – | Authenticate credentials. Returns a JWT and user object. |
| `GET` | `/me` | ✅ | Get profile details for the currently logged-in user. |
| `PATCH` | `/password` | ✅ | Update password (requires current password validation). |

#### Sample Response (`POST /login`):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "a6f8b9d2-e3a1-4f81-9b9a-4c8d7e6f5a3b",
      "name": "Alex Morgan",
      "email": "demo@careertrack.app"
    }
  }
}
```
</details>

### 2. Applications Management (`/api/applications`)
<details>
<summary>View Applications Endpoints</summary>

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | ✅ | Get user's applications (supports filtering via query params: `search`, `status`, `source`, `sortBy=newest\|oldest`). |
| `GET` | `/:id` | ✅ | Get a single application by UUID. |
| `POST` | `/` | ✅ | Create a new application entry. |
| `PATCH` | `/:id` | ✅ | Update an application. Verify ownership before saving. |
| `DELETE` | `/:id` | ✅ | Delete an application. |

#### Filter Query Example:
`GET /api/applications?search=engineer&status=Interview&source=LinkedIn&sortBy=newest`
</details>

### 3. Analytics & Dashboard (`/api/dashboard` & `/api/analytics`)
<details>
<summary>View Analytics Endpoints</summary>

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | ✅ | Get quick KPI summary counts and the 5 most recent application logs. |
| `GET` | `/analytics/stats` | ✅ | Get detailed metrics (monthly submission rates, funnel dropoffs, application source yields). |
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalApplications": 24,
      "interviewRate": 16.6,
      "offerRate": 8.3
    },
    "monthlyTrends": [
      { "month": "Jan", "count": 2 },
      { "month": "Feb", "count": 4 }
    ]
  }
}
```
</details>

### 4. AI Services Coordinator (`/api/ai`)
<details>
<summary>View AI Endpoints</summary>

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/parse-jd` | ✅ | Parses a raw job description string and returns structured info. |
| `POST` | `/test-config` | ✅ | Test connection for user-supplied custom AI models. |
| `POST` | `/match-score/:id` | ✅ | Match resume text against a saved application's JD. |
| `POST` | `/interview-prep/:id` | ✅ | Generate 5 interview questions and STAR-method answering tips. |
| `POST` | `/generate-email` | ✅ | Generate a follow-up or cold outreach email template. |
</details>

---

## 📊 Data Models

Schema mapped through Prisma PostgreSQL types:

```mermaid
erDiagram
    User {
        UUID id PK
        String name
        String email UK
        String passwordHash
        DateTime createdAt
        DateTime updatedAt
    }
    Application {
        UUID id PK
        String companyName
        String jobTitle
        String jobUrl
        Enum source
        DateTime applicationDate
        Enum status
        String notes
        String jobDescription
        String resumeLink
        DateTime interviewDate
        Int salaryMin
        Int salaryMax
        String salaryCurrency
        String location
        String employmentType
        String remoteStatus
        String companyLogo
        UUID userId FK
        DateTime createdAt
        DateTime updatedAt
    }

    User ||--o{ Application : "owns"
```

---

## 🗺️ Pages & UI Architecture

| Route | Page | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/` | LandingPage | **Public** | Asymmetric hero split, interactive mockup, Bento 2.0 feature matrices, and live sandbox dashboard. |
| `/login` | LoginPage | **Public** | Authentication interface featuring rate-limit warnings and a single-click Demo Mode login. |
| `/register` | RegisterPage | **Public** | Sign-up form with password strength indicator. |
| `/dashboard` | DashboardPage | **Protected** | General KPI metrics, funnel charts, upcoming interview alerts, and activity logs. |
| `/pipeline` | PipelinePage | **Protected** | Kanban board containing 6 status swimlanes with drag-and-drop mechanics. |
| `/applications` | ApplicationsPage | **Protected** | Searchable grid and detail panels for managing application listings. |
| `/analytics` | AnalyticsPage | **Protected** | Recharts area and bar graphs analyzing monthly velocities and source yields. |
| `/calendar` | CalendarPage | **Protected** | Month-grid calendar displaying interview schedules. |
| `/settings` | SettingsPage | **Protected** | Manage user preferences (Theme, Profile info, Change Password, and LLM Provider settings). |

---

## 🚢 Production Deployment

### 1. Server API Deployed to Render
1.  Create a new **Web Service** pointing to your repository.
2.  Set the Root Directory to `server/`.
3.  Configure the build commands:
    ```bash
    npm install && npx prisma generate && npm run build
    ```
4.  Configure the start command:
    ```bash
    npm start
    ```
5.  Set database migration scripts as a Release Command:
    ```bash
    npx prisma migrate deploy
    ```
6.  Set up environment variables: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRY`, `CLIENT_URL` (points to the client domain), and optional `AI_API_KEY`.

### 2. Client SPA Deployed to Vercel
1.  Import your project on the Vercel Dashboard.
2.  Set the root folder path to `client/`.
3.  Configure the Build Command: `npm run build`.
4.  Configure the Output Directory: `dist`.
5.  Add the environment variable `VITE_API_URL` pointing to your deployed API server endpoint (`https://your-api.onrender.com/api`).

---

## 🎓 Author & Submission Credits

*   **Project Name:** CareerTrack Lite
*   **Author:** Shahnawas Adeel
*   **Student ID:** WEB12-1911
