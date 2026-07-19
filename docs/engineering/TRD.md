# Technical Requirements Document (TRD) — CareerTrack Lite

## 1. System Overview
CareerTrack Lite is a secure, decoupled, single-tenant SaaS application that enables users to record and track job applications. The system relies on a React-based Single Page Application (SPA) communicating over HTTP via REST APIs to a Node.js backend. Data is persisted securely using PostgreSQL with strict user-authorization boundaries.

## 2. Technology Choices
- **Frontend Framework:** React.js (Vite compiler). Chosen for rapid development, component reuse, and fast HMR support.
- **Language:** TypeScript. Recommended in specs, ensures type safety across database schemas (Prisma types) and client states.
- **Styling:** Tailwind CSS. Speeds up responsive UI creation and enforces design tokens.
- **Backend Framework:** Node.js + Express.js. A lightweight, flexible standard for building performant REST APIs.
- **Database:** PostgreSQL. Preferred over NoSQL for strictly structured entity relationships (User 1:N Applications).
- **ORM:** Prisma. Generates fully typed client models and simplifies migrations.
- **Security:** bcrypt (password hashing) + jsonwebtoken (stateless auth).

## 3. Architecture
The application uses an n-tier architecture separated horizontally across network bounds.
1. **Presentation Layer:** React application running in browser.
2. **Transport/Routing Layer:** Express API exposing endpoints.
3. **Business/Service Layer:** Controllers orchestrating validation and logic.
4. **Data Access Layer:** Prisma abstraction isolating SQL.

## 4. Folder Structure (Monorepo Approach)
```text
/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI parts (Buttons, Inputs)
│   │   ├── pages/           # Route views (Dashboard, Login, List)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # Fetch/Axios API wrappers
│   │   ├── utils/           # Formatting, date utilities
│   │   ├── App.tsx          # Router configuration
│   │   └── main.tsx         # Mount point
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── src/
│   │   ├── controllers/     # Route handlers mapping requests to DB
│   │   ├── middlewares/     # JWT verification, Error handling
│   │   ├── routes/          # Express Router definitions
│   │   ├── utils/           # bcrypt helpers, token generators
│   │   └── server.ts        # App instantiation
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/                    # System Documentation
└── README.md
```

## 5. Coding Standards
- **TypeScript:** Enforce strict typing (`strict: true`). Minimize usage of `any`. Share types between client and server where possible.
- **Formatting:** Use Prettier for auto-formatting and ESLint for static analysis.
- **Immutability:** Avoid mutating states directly in React; rely on `useState` setters or immutable updates (e.g., array spread operators).
- **KISS/YAGNI:** Build exactly what is specified in the requirements. Do not add complex state managers (like Redux) if simple React Context/Hooks suffice.

## 6. Design Patterns
- **Controller-Router Pattern (Backend):** The `router` maps URLs to `controller` functions. The controller extracts parameters and delegates heavy lifting to the ORM or service layer.
- **Middleware Pattern (Backend):** Logic for authentication, request logging, and unified error handling are separated into Express middleware blocks.
- **Container-Presenter Pattern (Frontend):** Page components (Containers) fetch data and manage state, passing props down to dumb UI components (Presenters) like standard layout cards.

## 7. Validation Strategy
- **Client-Side:** HTML5 form attributes (`required`, `type="email"`) plus manual React state validation (e.g., ensuring lengths are valid before enabling the submit button). Provide immediate feedback without network lag.
- **Server-Side:** Use simple input validation functions or lightweight libraries (e.g., Zod) in controllers before processing to prevent bad DB insertions. Always sanitize inputs.

## 8. Error Handling
- **Backend:** 
  - Controllers must wrap operations in `try-catch`.
  - Errors are passed to a unified Express Error Middleware using `next(error)`.
  - Production mode strips internal stack traces and returns clean JSON `{ success: false, message: "..." }`.
- **Frontend:**
  - `try-catch` on API calls.
  - Surface error messages gracefully using toast notifications or inline text. Never crash the UI on a network failure.

## 9. Performance Considerations
- Use Prisma connection pooling if deploying to serverless environments (Neon/Vercel) to avoid exhausting database connections.
- Ensure API routes use selective fields (e.g., avoiding selecting `passwordHash` when fetching users).
- Client renders list updates efficiently by using stable array keys (application ID).

## 10. Security
- Use `.env` files exclusively for sensitive configuration parameters (`DATABASE_URL`, `JWT_SECRET`). Do not commit these files to version control.
- Enforce CORS headers permitting only the deployed frontend origin.
- Token validation is applied uniformly to all application resource routes.

## 11. Deployment
- **Frontend (Vercel):** Connect `client/` folder to GitHub repo; Vercel automatically runs `npm build` and deploys static assets.
- **Backend (Render):** Deploy `server/` as a web service running `npm start`. Add environment variables in the Render dashboard.
- **Database (Neon):** Spin up serverless Postgres instance, extract `DATABASE_URL`, and apply it to Render backend configuration.

## 12. Future Scalability
- **Pagination:** For users with hundreds of applications, the `/api/applications` route can implement `limit` and `offset` logic.
- **Caching:** Add a Redis layer for the `/dashboard/stats` endpoint if aggregation becomes computationally expensive.
- **Microservices:** The optional AI integration module can be split into an isolated microservice to prevent long-running LLM inferences from blocking core thread execution.
