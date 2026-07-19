# Product Roadmap — CareerTrack Lite

## Phase 1: MVP Core (Day 1 - Foundation)
Focus is establishing the project structure, local development environment, database schema, and authentication boundaries.

- **F-1.1: Core Infrastructure Setup**
  - Setup React (Vite, TypeScript, Tailwind CSS) project directory.
  - Setup Node.js (Express, TypeScript) server directory.
  - Initialize Prisma and configure PostgreSQL schemas for User and Application.
- **F-1.2: Identity Framework**
  - Implement password hashing using `bcrypt`.
  - Create registration and login API endpoints.
  - Configure JWT signing and validation middleware.
  - Implement basic registration/login page components on the client.

## Phase 2: Tracker Core & Ownership (Day 2 - Functionality)
Focus is completing the application management features, ensuring strict data boundaries, and creating the dashboard view.

- **F-2.1: Protected Applications API (CRUD)**
  - Implement backend endpoints for creating, reading, updating, and deleting applications.
  - **Ownership Guards:** Ensure that users can only query or mutate applications where `userId` equals the JWT payload's sub-claim.
- **F-2.2: Application List & Modals (Client)**
  - Create layout header, sidebar, and application list page.
  - Integrate modal screens for adding, editing, and deleting applications.
- **F-2.3: Dashboard Aggregation**
  - Backend route `/api/dashboard/stats` aggregating status fields.
  - Render KPI cards and a "Recently Added" applications table.

## Phase 3: Quality, Filtering & Deployment (Day 3 - Polish)
Focus is implementing advanced UX features, validating all input forms, and deploying the complete product live.

- **F-3.1: Search, Sort & Filters**
  - Add search input for company/title queries.
  - Add dropdown filters for source/status.
  - Add toggle for oldest/newest sorting.
- **F-3.2: UX Refinements**
  - Client-side and server-side validation messages.
  - Skeleton loading states and button disabling while submitting.
  - Success/error toast notifications.
- **F-3.3: Production Deployment**
  - Connect Prisma Client to a hosted PostgreSQL instance on Neon.
  - Deploy backend API to Render.
  - Deploy React static assets to Vercel.
  - Validate live database migrations and credentials.

## Phase 4: Extended Value (Post-MVP)
Focus is adding non-blocking, advanced integrations to elevate the value proposition.

- **F-4.1: AI Integration (Bonus)**
  - Integrate OpenAI/Anthropic SDKs into the backend.
  - Let users paste job descriptions to extract summaries, key terms, and interview preparation questions.
  - Enforce fallback logic so that failures in the AI module do not impact core tracker performance.
- **F-4.2: Data Exporter**
  - Export personal application records into CSV/Excel spreadsheets.
- **F-4.3: Reminders System**
  - Simple notification banners for upcoming interviews.
