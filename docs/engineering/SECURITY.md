# Security Specifications — CareerTrack Lite

## 1. Overview

Security is a first-class concern for CareerTrack Lite. The application handles personally identifiable information (email addresses), credentials (passwords), and private career data. This document defines the security controls applied across all layers of the stack.

## 2. Password Hashing

| Property | Value |
|----------|-------|
| **Algorithm** | bcrypt |
| **Salt Rounds** | 10 |
| **Library** | `bcryptjs` or `bcrypt` (native) |

### Rules
- Raw passwords are **never** stored, logged, or returned in API responses.
- Passwords are hashed **server-side only** before database insertion.
- Password comparison uses `bcrypt.compare()` which is timing-safe.
- Minimum password length: 6 characters (enforced at both client and server).

### Implementation Pattern
```
Register:
  passwordHash = await bcrypt.hash(password, 10)
  INSERT INTO users (..., passwordHash)

Login:
  user = SELECT * FROM users WHERE email = ?
  isValid = await bcrypt.compare(inputPassword, user.passwordHash)
```

## 3. JWT Security

| Property | Value |
|----------|-------|
| **Algorithm** | HS256 (HMAC-SHA256) |
| **Secret Source** | `JWT_SECRET` environment variable |
| **Secret Requirements** | Minimum 256-bit (32-byte) random string |
| **Token Expiry** | 24 hours |
| **Storage** | Client `localStorage` (MVP); upgrade path: `httpOnly` cookie |

### Rules
- JWT secret must **never** be hardcoded in source code.
- JWT secret must **never** be committed to version control.
- Tokens are validated on **every** protected request via middleware.
- Expired tokens return `401 Unauthorized` — the client must re-authenticate.
- Token payload contains only `userId` and `email` — no sensitive data (no password hash, no PII beyond email).

### Token Generation
```
jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
)
```

## 4. CORS Configuration

| Property | Value |
|----------|-------|
| **Library** | `cors` (Express middleware) |
| **Allowed Origins** | `CLIENT_URL` environment variable (deployed frontend URL) |
| **Allowed Methods** | `GET, POST, PATCH, DELETE, OPTIONS` |
| **Allowed Headers** | `Content-Type, Authorization` |
| **Credentials** | `true` (if using cookies in the future) |

### Rules
- **Never** use `origin: "*"` in production. Restrict to the exact deployed frontend domain.
- CORS is a **browser-level** protection; server-side callers bypass it. Combine with authentication for real access control.

### Configuration Pattern
```typescript
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
```

## 5. Helmet (HTTP Security Headers)

| Property | Value |
|----------|-------|
| **Library** | `helmet` (Express middleware) |

Helmet sets secure HTTP headers automatically:

| Header | Purpose |
|--------|---------|
| `X-Content-Type-Options: nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options: DENY` | Prevents clickjacking via iframe embedding |
| `X-XSS-Protection: 0` | Disables browser XSS filter (modern CSP is preferred) |
| `Strict-Transport-Security` | Enforces HTTPS connections |
| `Referrer-Policy: no-referrer` | Prevents leaking URLs in referrer headers |
| `Content-Security-Policy` | Restricts resource loading sources |

### Configuration
```typescript
import helmet from "helmet";
app.use(helmet());
```

## 6. Rate Limiting

| Property | Value |
|----------|-------|
| **Library** | `express-rate-limit` |

### Rate Limit Rules

| Endpoint Group | Window | Max Requests | Rationale |
|---------------|--------|-------------|-----------|
| `POST /api/auth/login` | 15 minutes | 10 | Prevent brute-force password attacks |
| `POST /api/auth/register` | 1 hour | 5 | Prevent mass account creation |
| Global API | 15 minutes | 100 | General abuse prevention |

### Configuration Pattern
```typescript
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", loginLimiter);
```

## 7. Input Validation

### Client-Side
- HTML5 `required`, `type="email"`, `minLength` attributes for immediate feedback.
- React state-based validation before enabling the submit button.
- Client validation is a **UX convenience** — it is never trusted by the server.

### Server-Side
- Validate every incoming request body in the controller or via a validation middleware.
- Use a schema validation library (e.g., Zod) for declarative input rules.
- Reject invalid requests with `400 Bad Request` and structured error messages before any database operation.

### Validation Checklist
| Field | Validations |
|-------|-------------|
| `name` | Required, string, length 2–255 |
| `email` | Required, valid email format, trimmed, lowercased |
| `password` | Required, string, minimum 6 characters |
| `companyName` | Required, string, length 1–255 |
| `jobTitle` | Required, string, length 1–255 |
| `jobUrl` | Optional, valid URL format if provided |
| `source` | Required, must match `ApplicationSource` enum |
| `status` | Required, must match `ApplicationStatus` enum |
| `applicationDate` | Required, valid ISO date string |
| `notes` | Optional, string |
| `id` (path param) | Must be a valid UUID format |

## 8. Authorization & Ownership Enforcement

### Rules
1. Every database query for applications **must** filter by `userId = req.user.userId`.
2. Single-resource operations (`GET /:id`, `PATCH /:id`, `DELETE /:id`) must verify ownership after fetching the record.
3. Ownership failure returns `403 Forbidden` — not `404`. This avoids masking the authorization violation.

### Implementation Pattern
```typescript
const application = await prisma.application.findUnique({ where: { id } });

if (!application) return res.status(404).json({ success: false, message: "Application not found" });
if (application.userId !== req.user.userId) return res.status(403).json({ success: false, message: "Forbidden" });
```

## 9. SQL Injection Prevention

| Control | Method |
|---------|--------|
| **Prisma ORM** | Prisma Client uses parameterized queries by default. User input is never interpolated into SQL strings. |
| **No raw SQL** | Controllers must not use `$queryRaw` or `$executeRaw` with user-supplied input. If raw SQL is ever necessary, use `$queryRaw` with tagged template literals (Prisma auto-parameterizes tagged templates). |

## 10. Cross-Site Scripting (XSS) Prevention

| Layer | Control |
|-------|---------|
| **React** | React escapes all string interpolation in JSX by default. Content rendered via `{}` is auto-escaped. |
| **Dangerous APIs** | Never use `dangerouslySetInnerHTML` with user-provided content. If the `notes` field needs rich rendering, sanitize with a library like `DOMPurify` first. |
| **API Responses** | API always returns `Content-Type: application/json`. Browsers do not execute JSON as HTML. |
| **Helmet CSP** | Content Security Policy headers restrict inline script execution. |

## 11. Cross-Site Request Forgery (CSRF) Prevention

| Control | Method |
|---------|--------|
| **JWT in Authorization header** | CSRF attacks exploit cookie-based auth. Since the JWT is sent via the `Authorization` header (not a cookie), browsers do not automatically attach it to cross-origin requests. This makes the application inherently resistant to CSRF at the MVP stage. |
| **Future upgrade** | If tokens are moved to `httpOnly` cookies, add a CSRF token (double-submit cookie or synchronizer token pattern). |

## 12. Secrets Management

### Environment Variables

| Variable | Purpose | Where Used |
|----------|---------|------------|
| `DATABASE_URL` | PostgreSQL connection string | Backend (Prisma) |
| `JWT_SECRET` | Token signing key | Backend (Auth) |
| `CLIENT_URL` | Frontend origin for CORS | Backend (CORS) |
| `PORT` | Server listening port | Backend |
| `AI_API_KEY` | LLM API key (optional) | Backend (AI module) |

### Rules
- **Never** commit `.env` files to version control.
- Add `.env` to `.gitignore` before the first commit.
- Provide a `.env.example` file with variable names and no values.
- Set environment variables via the hosting platform's dashboard (Render, Vercel) for production.
- Rotate `JWT_SECRET` immediately if it is ever exposed.

### `.env.example`
```
PORT=
DATABASE_URL=
JWT_SECRET=
CLIENT_URL=
AI_API_KEY=
```

## 13. Error Information Leakage

### Rules
- **Never** expose stack traces, database error details, or internal file paths in API responses.
- Production error responses must only contain the human-readable message.
- Log full error details (stack, query, params) server-side for debugging.

### Error Middleware Pattern
```typescript
app.use((err, req, res, next) => {
  console.error(err.stack); // Server log only

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
});
```

## 14. OWASP Top 10 Coverage

| OWASP Category | Status | Implementation |
|---------------|--------|----------------|
| **A01: Broken Access Control** | ✅ Covered | Ownership checks on every resource operation; JWT-based route protection |
| **A02: Cryptographic Failures** | ✅ Covered | bcrypt password hashing; HTTPS in production; secrets in env vars |
| **A03: Injection** | ✅ Covered | Prisma parameterized queries; no raw SQL with user input |
| **A04: Insecure Design** | ✅ Covered | Layered architecture with middleware separation; defense-in-depth |
| **A05: Security Misconfiguration** | ✅ Covered | Helmet headers; restrictive CORS; environment-based configuration |
| **A06: Vulnerable Components** | ⚠️ Partial | Run `npm audit` regularly; keep dependencies updated |
| **A07: Auth Failures** | ✅ Covered | bcrypt hashing; rate-limited login; generic error messages |
| **A08: Data Integrity Failures** | ✅ Covered | Server-side validation; Prisma schema constraints; enum enforcement |
| **A09: Logging Failures** | ⚠️ Partial | Console-based logging at MVP; structured logging (Winston/Pino) recommended for production |
| **A10: SSRF** | ✅ N/A | Application does not make server-side requests to user-supplied URLs |

## 15. Security Checklist (Pre-Deployment)

- [ ] `.env` is in `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] `JWT_SECRET` is a strong random string (≥32 characters)
- [ ] `DATABASE_URL` uses SSL connection (`?sslmode=require`)
- [ ] CORS origin is restricted to the deployed frontend URL
- [ ] Helmet middleware is enabled
- [ ] Rate limiting is configured on auth endpoints
- [ ] All user inputs are validated server-side
- [ ] Ownership is verified on every application resource operation
- [ ] Error responses do not leak stack traces or internal details
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] Frontend does not use `dangerouslySetInnerHTML` with user data
- [ ] Passwords are never logged or returned in responses
