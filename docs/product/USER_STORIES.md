# User Stories — CareerTrack Lite

## 1. Authentication & Security

### US-1.1: Account Registration
- **User Story:** As an unregistered job seeker, I want to create a new account with my name, email, and password, so that I can have a private, secure space to track my applications.
- **Acceptance Criteria:**
  - Standard registration form with Name, Email, and Password fields.
  - Email format must be validated. Password must be at least 6 characters.
  - Duplicate email registrations must be rejected with a clear error message.
  - Successful registration automatically logs the user in and redirects to the Dashboard.

### US-1.2: Account Login
- **User Story:** As a registered user, I want to log in using my email and password, so that I can access my personalized job application pipeline.
- **Acceptance Criteria:**
  - Login form validating email format and password presence.
  - Unsuccessful attempts (invalid email or incorrect password) return a generic "Invalid credentials" error.
  - Successful login returns a JWT, stores it in the client, and redirects to the Dashboard.

### US-1.3: Secure Logout
- **User Story:** As a logged-in user, I want to log out of my account, so that my session is terminated and no one else can access my dashboard on this device.
- **Acceptance Criteria:**
  - Clicking "Logout" in the navbar immediately clears the stored token.
  - The user is redirected to the Login page.
  - Pressing the browser "Back" button after logout does not reveal protected pages.

### US-1.4: Protected Access
- **User Story:** As a user, I want my data to be protected from unauthorized access, so that other registered users or anonymous visitors cannot view or alter my job applications.
- **Acceptance Criteria:**
  - Accessing dashboard or application API endpoints without a token returns `401 Unauthorized`.
  - Attempting to access another user's application details via direct URL or API call returns `403 Forbidden`.

---

## 2. Interactive Dashboard

### US-2.1: Status Metrics Summary
- **User Story:** As a job seeker, I want to see a visual summary of all my job applications grouped by status, so that I can immediately evaluate the health and progress of my job search.
- **Acceptance Criteria:**
  - Display KPI cards for: Total Applications, Saved, Applied, Assessment, Interview, Rejected, and Offer.
  - Cards update dynamically in real time as applications are added, edited, or deleted.

### US-2.2: Recent Applications Feed
- **User Story:** As a job seeker, I want to see my most recently added applications on my dashboard, so that I can quickly review my latest search activities.
- **Acceptance Criteria:**
  - Display the 5 most recently created applications with company name, job title, status badge, and date.
  - Each item links directly to its respective details modal or edit page.

---

## 3. Job Application Management (CRUD)

### US-3.1: Add New Application
- **User Story:** As a job seeker, I want to record a new job application with its details, so that I can track its progress in my database.
- **Acceptance Criteria:**
  - Create button opens a form containing fields: Company Name, Job Title, Job URL, Source, Application Date, Status, and Notes.
  - Fields validation: Company Name, Job Title, Source, Date, and Status are required.
  - Disabled submit button while the API request is processing to prevent double submission.

### US-3.2: View Application Details
- **User Story:** As a job seeker, I want to view all details of a specific job application, so that I can read the notes, visit the job link, and check dates.
- **Acceptance Criteria:**
  - Clicking an application opens a details modal or sub-page showing all fields.
  - Display job URL as a clickable link opening in a new tab.

### US-3.3: Edit/Update Application
- **User Story:** As a job seeker, I want to edit an existing application (such as changing its status from "Applied" to "Interview"), so that my records remain accurate.
- **Acceptance Criteria:**
  - Edit form is pre-filled with the current data.
  - Saving changes updates the database, updates the UI list, and triggers a success notification.

### US-3.4: Delete Application
- **User Story:** As a job seeker, I want to delete an application from my tracker, so that I can remove accidental entries or irrelevant records.
- **Acceptance Criteria:**
  - Clicking "Delete" triggers a confirmation dialog ("Are you sure you want to delete this application?").
  - Confirming removes the record from the database and updates the UI list.

---

## 4. Search, Filtering, and Sorting

### US-4.1: Search by Company or Title
- **User Story:** As a job seeker with many applications, I want to search by typing a keyword, so that I can quickly find applications matching a company name or job title.
- **Acceptance Criteria:**
  - Search input updates the list dynamically as the user types (debounce optional but recommended).
  - Search searches both company name and job title fields (case-insensitive).

### US-4.2: Filter by Status and Source
- **User Story:** As a job seeker, I want to filter my application list by status (e.g., "Interview") or source (e.g., "LinkedIn"), so that I can focus on specific subgroups of applications.
- **Acceptance Criteria:**
  - Provide filter dropdowns for Status and Source.
  - Selecting an option updates the list instantly. Multiple filters (Status + Source) work in combination.

### US-4.3: Sort by Date
- **User Story:** As a job seeker, I want to sort my applications by application date, so that I can view my oldest or newest submissions first.
- **Acceptance Criteria:**
  - Provide a toggle or dropdown to select "Newest First" or "Oldest First".
  - Sorting is applied immediately to the filtered/searched list.

---

## 5. AI Assistant (Bonus Feature)

### US-5.1: Job Description Analysis
- **User Story:** As a job seeker, I want to paste a long job description, so that the AI can extract key skills and suggest preparation questions.
- **Acceptance Criteria:**
  - Textarea component for pasting job descriptions.
  - Clicking "Analyze" sends the text to the backend, which processes it via an LLM.
  - Returns a clean summary, a list of required skills, keywords for resume tailoring, and 3 mock interview questions.
  - Gracefully handles API key failure or limits without crashing the tracker.
