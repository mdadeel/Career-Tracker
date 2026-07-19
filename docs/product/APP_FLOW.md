# Application Flow & Diagrams — CareerTrack Lite

## 1. Navigation Flow Map
This diagram maps out the client-side routes, showing public pages vs. protected pages guarded by the JWT authentication layer.

```mermaid
graph TD
    %% Routes
    Landing[/Landing Page /] -->|Click Login| Login[Login Page /login]
    Landing -->|Click Register| Register[Register Page /register]
    
    %% Guard
    subgraph Protected Area
        Dashboard[Dashboard /dashboard]
        AppList[Applications /applications]
        AppForm[Add/Edit Form /applications/form]
        Details[Application Details /applications/:id]
        Stats[Stats /stats]
    end

    Login -->|Success| Dashboard
    Register -->|Success| Dashboard

    Dashboard --> AppList
    Dashboard --> AppForm
    AppList --> Details
    AppList --> AppForm
    AppForm -->|Save/Cancel| AppList
    
    %% Exits
    Protected Area -->|Click Logout| Landing
    AnyPath[Any Unknown Path] --> 404[404 Page]
```

---

## 2. Authentication Flow Lifecycle
This sequence diagram details the login process, showing how JWT is exchanged and cached, and how it is used for subsequent requests.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant FE as React Client (State/Storage)
    participant BE as Express API Server
    participant DB as PostgreSQL Database

    User->>FE: Fill Login Form & Submit
    FE->>BE: POST /api/auth/login (email, password)
    BE->>DB: Query User by Email
    DB-->>BE: User Record (Hashed Password)
    BE->>BE: Verify Password using bcrypt.compare()
    alt Credentials Invalid
        BE-->>FE: 401 Unauthorized (Invalid credentials)
        FE-->>User: Show credentials error message
    else Credentials Valid
        BE->>BE: Sign JWT (userId, email)
        BE-->>FE: 200 OK (token, user details)
        FE->>FE: Save token to localStorage
        FE->>FE: Redirect to /dashboard
        FE-->>User: Render Dashboard
    end
```

---

## 3. Application CRUD Process Flow
This state diagram illustrates the creation, modification, and deletion of job applications, validating data boundaries and backend responses.

```mermaid
stateDiagram-v2
    [*] --> List: View Applications
    List --> Form: Click "Add Application"
    List --> Modal: Click Application Row
    
    state Form {
        [*] --> Input: Enter Job Details
        Input --> Validate: Click Submit
        Validate --> API_Create: Validation Passed
        Validate --> Input: Validation Failed (Show Errors)
    }

    API_Create --> List: 201 Created (Refresh Data)
    Modal --> Form: Click Edit
    Form --> API_Update: Click Save
    API_Update --> List: 200 OK (Refresh Data)
    
    Modal --> ConfirmDelete: Click Delete
    ConfirmDelete --> API_Delete: Confirm
    ConfirmDelete --> Modal: Cancel
    API_Delete --> List: 200 OK (Remove from View)
```

---

## 4. Protected Route Request Authorization
How the backend intercepts and authorizes incoming requests to application endpoints.

```mermaid
sequenceDiagram
    autonumber
    participant FE as React Client
    participant MW as AuthMiddleware (Express)
    participant CTRL as ApplicationsController
    participant DB as PostgreSQL Database

    FE->>MW: GET /api/applications/123 (Authorization: Bearer <token>)
    alt Token Missing or Expired
        MW-->>FE: 401 Unauthorized
    else Token Present & Valid
        MW->>MW: Extract req.user (userId)
        MW->>CTRL: Pass control to Controller
        CTRL->>DB: Query Application ID 123
        DB-->>CTRL: Application Record (belongs to ownerId)
        alt ownerId != req.user.userId
            CTRL-->>FE: 403 Forbidden (Ownership failure)
        else ownerId == req.user.userId
            CTRL-->>FE: 200 OK (Application Data JSON)
        end
    end
```

---

## 5. End-to-End User Journey Loop
A map of the path a user takes from entering the app to adding, analyzing, and logging out.

```mermaid
graph LR
    Start([User Starts]) --> Auth{Has Account?}
    Auth -->|No| Register[Register Account]
    Auth -->|Yes| Login[Login to App]
    Register --> Dash[View Dashboard Stats]
    Login --> Dash
    Dash --> Add[Add Job Application]
    Add --> Analyze[Analyze Pipeline Stats]
    Analyze --> Filter[Search & Filter Jobs]
    Filter --> Edit[Update Job Status]
    Edit --> Logout[Logout & Terminate Session]
```
