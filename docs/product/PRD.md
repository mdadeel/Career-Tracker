# Product Requirement Document (PRD) — CareerTrack Lite

## 1. Vision
CareerTrack Lite is a lightweight, responsive, and highly secure job application tracking system. It enables job seekers to streamline their job search lifecycle by organizing their applications, tracking status pipelines, analyzing progress, and maintaining a structured history of their professional opportunities in one private dashboard.

## 2. Problem Statement
Job searching is a chaotic, multi-channel process. Candidates apply via LinkedIn, Bdjobs, company sites, and referrals, leading to fragmented tracking (often in unorganized spreadsheets or notes). Spreadsheets lack automated statistics, status indicators, and responsive mobile interfaces. Existing tracking products are bloated, require paid subscriptions, or leak user data. Candidates need a simple, free, responsive, and secure personal dashboard to manage their search.

## 3. Goals
- Provide a simple, private application tracking system.
- Deliver visual insights on job search performance through basic status statistics.
- Enable fast, responsive access on both mobile and desktop.
- Secure user data so that each user has exclusive access to their own records.
- Establish a production-grade template that deploys seamlessly to cloud providers (Vercel, Render, Neon).

## 4. Objectives
- Achieve 100% data isolation between users.
- Support complete CRUD operations for job applications.
- Provide real-time statistical summaries of the application pipeline.
- Offer search, sorting, and filtering capabilities.
- Maintain a sub-200ms API response time for typical operations.

## 5. Target Users & Personas
- **The Active Job Seeker (e.g., Rahat):** A recent graduate applying to 10+ jobs daily. Needs a fast way to input applications, change statuses as interviews get scheduled, and quickly see how many offers or rejections are active.
- **The Passive Candidate (e.g., Sumaiya):** A senior engineer looking for select roles. Needs a clean archive to save interesting job descriptions, keep links to job posts, and write personal notes about interviews.

## 6. Scope
### In Scope (MVP)
- **User Authentication:** Registration, login, secure logout, password hashing, and JWT token protection.
- **Protected Dashboard:** Aggregated KPI cards (Total, Saved, Applied, Assessment, Interview, Rejected, Offer) and a "Recently Added" applications feed.
- **Application CRUD:** Add, view, edit, and delete job applications with fields: Company Name, Job Title, Job URL, Source, Application Date, Status, and Notes.
- **Search & Discovery:** Search by company name or job title; filter by status or source; sort by date (newest/oldest).
- **Responsive Web UI:** Accessible, form-validated Tailwind UI compatible with mobile and desktop.

### Out of Scope (Future Phases)
- Calendar integrations for interview reminders.
- Email alerts or automatic status trackers via inbox parsing.
- Multiple resumes/CV management.
- Collaborative boards (sharing pipelines with mentors).

## 7. Functional Requirements

### FR-1: Authentication & Authorization
- **Registration:** Users can register with a name, email (unique), and password.
- **Login:** Users authenticate with email and password to receive a JWT.
- **Authorization:** Users can only view, edit, or delete applications they created.
- **Route Guarding:** Private routes (Dashboard, Application List, Application Form) redirect unauthenticated users to Login.

### FR-2: Job Application Management
- **Create:** Form to add applications with fields:
  - Company Name (Required, Text)
  - Job Title (Required, Text)
  - Job Post URL (Optional, URL format)
  - Application Source (Required, Dropdown: LinkedIn, Bdjobs, Indeed, Wellfound, Facebook, Referral, Other)
  - Application Date (Required, Date picker)
  - Application Status (Required, Dropdown: Saved, Applied, Assessment, Interview, Rejected, Offer)
  - Notes (Optional, Rich text/Textarea)
- **Read:**
  - Retrieve details of a specific application in a modal or page.
  - Retrieve lists of applications for the logged-in user.
- **Update:** Edit any of the application fields.
- **Delete:** Remove an application with a confirmation prompt.

### FR-3: Interactive Dashboard
- **KPI Metrics:** Displays cards with live counts for:
  - Total Applications
  - Saved
  - Applied
  - Assessments
  - Interviews
  - Rejections
  - Offers
- **Recent Applications:** Display a list of the 5 most recently created applications.

### FR-4: Search, Filtering, and Sorting
- **Search:** Query input matching Company Name or Job Title (case-insensitive substring match).
- **Filtering:** Dropdowns to filter list by Application Status and/or Application Source.
- **Sorting:** Toggle to sort applications by Application Date or Created Date (Newest First vs. Oldest First).

## 8. Non-Functional Requirements
- **Security:** Standard passwords hashed using bcrypt. JWT tokens signed with a 256-bit secret. HTTPS enforced in production. Prevents SQL injection using parameterized queries (Prisma Client).
- **Performance:** Page load time under 2 seconds. API endpoints respond in <200ms.
- **Usability:** Responsive design down to 320px width. Visible loading spinners, field validations, success/error banners, and disabled submit buttons during execution.
- **Reliability:** 99.9% uptime on Render/Vercel. Clean error handling without leaking server stacks to the client.

## 9. Business Rules
- A user must be logged in to create or view applications.
- Application status transitions must be unrestricted (e.g., a user can move a job from "Rejected" back to "Interview" if they get a callback).
- Duplicate emails are prohibited during registration.
- If a user deletes their account, all their job applications must be cascade deleted (not required for MVP account lifecycle, but must be designed in schema).

## 10. Acceptance Criteria
- **Auth Guard:** Accessing `/dashboard` or `/applications` without a JWT redirects to `/login`.
- **Ownership Check:** Attempting to fetch `GET /api/applications/:id` of another user's application returns a `403 Forbidden` response.
- **Responsive Layout:** The navbar collapses into a hamburger menu on screens narrower than 768px.
- **Validation Check:** Submitting the application form with an empty Company Name displays a "Company name is required" message.

## 11. Success Metrics
- **Uptime:** 99.9% availability of frontend and backend.
- **Load Time:** Core Web Vitals (LCP < 2.5s, CLS < 0.1).
- **Completion Rate:** 100% of user registrations and application flows succeed in testing.

## 12. Future Enhancements
- **AI Integration (Bonus):** Job description parser that uses LLM prompts to extract skills, keywords, and draft interview questions.
- **Bulk Import/Export:** Import/export application pipelines from/to CSV files.
