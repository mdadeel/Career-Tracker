# Feature Specifications — CareerTrack Lite

## 1. Authentication & Session Management
- [ ] **User Registration**
  - Form validation:
    - Name: Required, length > 2 characters.
    - Email: Required, valid email pattern.
    - Password: Required, minimum 6 characters.
  - Password hashing via `bcrypt` (10 rounds) in the backend.
  - Generates token and automatically logs user in.
- [ ] **Secure Login**
  - Validates credentials against DB.
  - Issues JWT containing `userId` and `email` signed with secret.
  - Stored in client `localStorage` under `token` key.
- [ ] **Authenticated Router**
  - Protected client routes using React Router (redirects to `/login` if no token exists).
  - Protected server routes using `AuthMiddleware` (checks `Authorization: Bearer <token>`).
- [ ] **Sign Out**
  - Button in primary layout header.
  - Destroys token in client and redirects to landing page.

## 2. Interactive Dashboard
- [ ] **Aggregate KPI Summary Cards**
  - **Total Applications:** Count of all applications.
  - **Saved:** Count of applications with status `Saved`.
  - **Applied:** Count of applications with status `Applied`.
  - **Assessment:** Count of applications with status `Assessment`.
  - **Interview:** Count of applications with status `Interview`.
  - **Rejected:** Count of applications with status `Rejected`.
  - **Offer:** Count of applications with status `Offer`.
- [ ] **Recent Activity Stream**
  - Lists the 5 most recently created applications.
  - Displays: Job Title, Company, Date Added, and Status Badge.
  - Clicking an item opens the detail modal.

## 3. Job Application Management (CRUD)
- [ ] **Application Creation**
  - Form fields:
    - `companyName` (String, required)
    - `jobTitle` (String, required)
    - `jobUrl` (String, optional, must match URL format)
    - `source` (Enum, required: `LinkedIn`, `Bdjobs`, `Indeed`, `Wellfound`, `Facebook`, `Referral`, `Other`)
    - `applicationDate` (Date, required, defaults to current date)
    - `status` (Enum, required: `Saved`, `Applied`, `Assessment`, `Interview`, `Rejected`, `Offer`)
    - `notes` (String, optional, rich text or plain text)
- [ ] **Details View**
  - Reads single application details.
  - Clickable URL link with safety attribute `rel="noopener noreferrer"`.
  - Date formatted to readable format (e.g., `YYYY-MM-DD` or `Month DD, YYYY`).
- [ ] **Application Updates**
  - Edit form loads and validates current values.
  - Restricts modification of fields to valid data types.
  - Triggers dashboard data refresh.
- [ ] **Application Deletion**
  - Dialog modal for confirmation.
  - Invokes `DELETE /api/applications/:id`.
  - Animates item removal from UI lists.

## 4. Search, Filtering, and Sorting
- [ ] **Unified Text Search**
  - Input field at the top of the All Applications list.
  - Searches `companyName` and `jobTitle` using SQL `ILIKE` (or case-insensitive RegExp in MongoDB).
- [ ] **Facet Filters**
  - **Status Filter:** Select status (All, Saved, Applied, Assessment, Interview, Rejected, Offer).
  - **Source Filter:** Select source (All, LinkedIn, Bdjobs, Indeed, Wellfound, Facebook, Referral, Other).
- [ ] **List Sorting**
  - Sort options:
    - Newest Added (Default)
    - Oldest Added
    - Application Date: Newest First
    - Application Date: Oldest First

## 5. UI/UX Quality & Responsiveness
- [ ] **Responsive Design**
  - Desktop: Sidebar or header navigation.
  - Tablet/Mobile: Collapsible hamburger menu and full-screen modals.
  - Fluid grid layouts utilizing Tailwind CSS.
- [ ] **Interactivity States**
  - Hover states on cards, buttons, and links.
  - Disabled submit buttons with indicator text (e.g., "Saving...") during network activity.
  - Skeleton loaders for cards while dashboard is loading.
- [ ] **Notifications & Banners**
  - Toast notifications for success/error events (e.g., "Application saved successfully").
- [ ] **Footer Branding**
  - Footer on all main pages displaying candidate's Full Name, Student ID, and copyright.

## 6. AI Integration Module (Bonus)
- [ ] **Job Spec Analyzer**
  - Paste box for raw job descriptions.
  - Loading skeleton during API communication.
  - AI Output Sections:
    - **Summary:** Clean 3-sentence summary.
    - **Key Skills:** Target list of required technologies.
    - **Interview prep:** 3 predicted behavioral/technical questions.
    - **Keywords:** Tailoring suggestions.

## 7. Future Features (Post-MVP)
- [ ] **Calendar Exporter**
  - Exports interviews directly to Google Calendar/iCal.
- [ ] **Resume Matching**
  - Score candidate's stored resume text against the job description.
- [ ] **Document Attachment**
  - Attach specific PDF files (custom cover letter or resume version) to each application card.
