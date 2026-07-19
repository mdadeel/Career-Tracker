# System Architecture — CareerTrack Lite

## 1. High-Level Architecture

CareerTrack Lite follows a **decoupled client-server architecture**. The React SPA communicates with the Express REST API over HTTPS. The API server manages authentication, business logic, and data persistence through Prisma ORM connected to PostgreSQL.

```mermaid
graph TB
    subgraph Client ["Client (Browser)"]
        SPA[React SPA<br/>Vite + TypeScript + Tailwind]
    end

    subgraph Server ["Server (Render)"]
        API[Express.js REST API<br/>TypeScript]
        MW[Middleware Layer<br/>Auth · CORS · RateLimit · ErrorHandler]
        SVC[Service Layer<br/>Business Logic]
    end

    subgraph Data ["Data (Neon)"]
        ORM[Prisma ORM Client]
        DB[(PostgreSQL Database)]
    end

    SPA -->|HTTPS + JWT Bearer| API
    API --> MW
    MW --> SVC
    SVC --> ORM
    ORM --> DB
```

## 2. Component Diagram

```mermaid
graph LR
    subgraph Frontend
        Pages[Pages<br/>Landing · Login · Register<br/>Dashboard · Applications · 404]
        Components[Components<br/>Navbar · KPICard · AppTable<br/>AppForm · Modal · StatusBadge]
        Hooks[Hooks<br/>useAuth · useApplications<br/>useDashboard]
        Services[API Services<br/>authService · appService<br/>dashboardService]
    end

    subgraph Backend
        Routes[Routes<br/>authRoutes · appRoutes<br/>dashboardRoutes · healthRoute]
        Controllers[Controllers<br/>authController · appController<br/>dashboardController]
        Middlewares[Middlewares<br/>authMiddleware · errorHandler<br/>rateLimiter · validateRequest]
        Utils[Utils<br/>hashPassword · generateToken<br/>verifyToken]
    end

    subgraph Database
        PrismaSchema[Prisma Schema<br/>User Model · Application Model]
        PrismaClient[Prisma Client<br/>Generated TypeSafe Queries]
        PG[(PostgreSQL<br/>users · applications)]
    end

    Pages --> Components
    Pages --> Hooks
    Hooks --> Services
    Services -->|HTTP| Routes
    Routes --> Middlewares
    Middlewares --> Controllers
    Controllers --> PrismaClient
    PrismaClient --> PG
    PrismaSchema -.->|prisma generate| PrismaClient
```

## 3. Request Lifecycle

Every API request follows a deterministic pipeline through the Express middleware stack.

```mermaid
sequenceDiagram
    autonumber
    participant C as Client (React)
    participant R as Express Router
    participant CORS as CORS Middleware
    participant RL as Rate Limiter
    participant Auth as Auth Middleware
    participant V as Validator
    participant Ctrl as Controller
    participant P as Prisma Client
    participant DB as PostgreSQL

    C->>R: HTTP Request (Method + Path + Headers + Body)
    R->>CORS: Check Origin
    CORS->>RL: Rate Limit Check
    RL->>Auth: Verify JWT Token
    
    alt Token Invalid or Missing
        Auth-->>C: 401 Unauthorized
    else Token Valid
        Auth->>V: Validate Request Body/Params
        alt Validation Fails
            V-->>C: 400 Bad Request (Field Errors)
        else Validation Passes
            V->>Ctrl: Execute Business Logic
            Ctrl->>P: Database Query/Mutation
            P->>DB: SQL Statement
            DB-->>P: Result Set
            P-->>Ctrl: Typed Result Object
            Ctrl-->>C: JSON Response (200/201)
        end
    end
```

## 4. Authentication Lifecycle

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as React Client
    participant BE as Express API
    participant DB as PostgreSQL

    Note over U,DB: Registration Flow
    U->>FE: Submit Registration Form
    FE->>BE: POST /api/auth/register {name, email, password}
    BE->>BE: Validate inputs
    BE->>DB: Check if email exists
    alt Email Taken
        DB-->>BE: User found
        BE-->>FE: 400 Email already registered
    else Email Available
        BE->>BE: bcrypt.hash(password, 10)
        BE->>DB: INSERT INTO users (name, email, passwordHash)
        DB-->>BE: New User Record
        BE->>BE: jwt.sign({userId, email}, JWT_SECRET)
        BE-->>FE: 201 {token, user}
        FE->>FE: Store token in localStorage
        FE->>U: Redirect to /dashboard
    end

    Note over U,DB: Login Flow
    U->>FE: Submit Login Form
    FE->>BE: POST /api/auth/login {email, password}
    BE->>DB: SELECT * FROM users WHERE email = ?
    alt User Not Found
        BE-->>FE: 401 Invalid credentials
    else User Found
        BE->>BE: bcrypt.compare(password, passwordHash)
        alt Password Mismatch
            BE-->>FE: 401 Invalid credentials
        else Password Match
            BE->>BE: jwt.sign({userId, email}, JWT_SECRET)
            BE-->>FE: 200 {token, user}
            FE->>FE: Store token in localStorage
            FE->>U: Redirect to /dashboard
        end
    end

    Note over U,DB: Authenticated Request
    U->>FE: Navigate to /applications
    FE->>FE: Read token from localStorage
    FE->>BE: GET /api/applications (Authorization: Bearer token)
    BE->>BE: jwt.verify(token, JWT_SECRET)
    BE->>DB: SELECT * FROM applications WHERE userId = ?
    DB-->>BE: Application Records
    BE-->>FE: 200 {data: [...]}
    FE->>U: Render Application List

    Note over U,DB: Logout Flow
    U->>FE: Click Logout
    FE->>FE: Remove token from localStorage
    FE->>U: Redirect to /login
```

## 5. Data Flow

```mermaid
graph TD
    subgraph "Write Path (Create/Update/Delete)"
        W1[User submits form] --> W2[Client validates fields]
        W2 --> W3[POST/PATCH/DELETE to API]
        W3 --> W4[Auth middleware extracts userId]
        W4 --> W5[Controller validates body]
        W5 --> W6[Prisma executes mutation]
        W6 --> W7[PostgreSQL commits transaction]
        W7 --> W8[Response returned to client]
        W8 --> W9[Client updates local state]
    end

    subgraph "Read Path (List/Detail/Stats)"
        R1[User navigates to page] --> R2[Client sends GET with JWT]
        R2 --> R3[Auth middleware extracts userId]
        R3 --> R4[Controller builds query with userId filter]
        R4 --> R5[Prisma executes SELECT with WHERE userId]
        R5 --> R6[PostgreSQL returns rows]
        R6 --> R7[Controller formats response]
        R7 --> R8[Client renders data]
    end
```

## 6. Key Architectural Principles

| Principle | Implementation |
|-----------|---------------|
| **Data Isolation** | Every database query includes `WHERE userId = req.user.userId`. No cross-user data leakage is possible. |
| **Stateless Auth** | JWT tokens carry identity claims. The server stores no session state. Horizontal scaling requires no session replication. |
| **Layered Separation** | Routes → Middleware → Controllers → Prisma. No layer bypasses another. Controllers never execute raw SQL. |
| **Fail Explicitly** | All controller logic wrapped in try-catch. Errors forwarded to a centralized error handler that returns structured JSON. |
| **Single Source of Schema** | `schema.prisma` is the canonical source of truth for both the database structure and the generated TypeScript types. |
