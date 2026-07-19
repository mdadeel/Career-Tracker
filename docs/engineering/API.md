# API Endpoint Documentation — CareerTrack Lite

> **Base URL:** `/api`
> **Content-Type:** `application/json`
> **Authentication:** All endpoints except Registration, Login, and Health require a valid JWT in the `Authorization: Bearer <token>` header.

---

## Standard Response Envelope

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "companyName", "message": "Company name is required" }
  ]
}
```

---

## 1. Health Check

### `GET /api/health`

| Property | Value |
|----------|-------|
| **Purpose** | Verify the API server is running and reachable |
| **Auth Required** | No |

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-07-19T12:00:00.000Z"
  }
}
```

---

## 2. Authentication

### `POST /api/auth/register`

| Property | Value |
|----------|-------|
| **Purpose** | Create a new user account |
| **Auth Required** | No |

**Request Body:**
```json
{
  "name": "Rahat Ahmed",
  "email": "rahat@example.com",
  "password": "securePass123"
}
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| `name` | Required, string, min 2 characters |
| `email` | Required, valid email format, unique in database |
| `password` | Required, string, min 6 characters |

**Response — 201 Created:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Rahat Ahmed",
      "email": "rahat@example.com"
    }
  }
}
```

**Errors:**
| Status | Condition | Message |
|--------|-----------|---------|
| 400 | Missing or invalid fields | `"Validation failed"` with field errors |
| 409 | Email already registered | `"Email already in use"` |
| 500 | Server/database failure | `"Internal server error"` |

---

### `POST /api/auth/login`

| Property | Value |
|----------|-------|
| **Purpose** | Authenticate user and issue JWT |
| **Auth Required** | No |

**Request Body:**
```json
{
  "email": "rahat@example.com",
  "password": "securePass123"
}
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| `email` | Required, valid email format |
| `password` | Required, non-empty string |

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Rahat Ahmed",
      "email": "rahat@example.com"
    }
  }
}
```

**Errors:**
| Status | Condition | Message |
|--------|-----------|---------|
| 400 | Missing fields | `"Validation failed"` |
| 401 | Wrong email or password | `"Invalid credentials"` |
| 500 | Server failure | `"Internal server error"` |

---

### `GET /api/auth/me`

| Property | Value |
|----------|-------|
| **Purpose** | Get current authenticated user's profile |
| **Auth Required** | Yes |

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Rahat Ahmed",
    "email": "rahat@example.com",
    "createdAt": "2026-07-19T10:00:00.000Z"
  }
}
```

**Errors:**
| Status | Condition | Message |
|--------|-----------|---------|
| 401 | Missing or invalid token | `"Unauthorized"` |

---

## 3. Job Applications

### `POST /api/applications`

| Property | Value |
|----------|-------|
| **Purpose** | Create a new job application |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "companyName": "Google",
  "jobTitle": "Software Engineer",
  "jobUrl": "https://careers.google.com/jobs/123",
  "source": "LinkedIn",
  "applicationDate": "2026-07-15",
  "status": "Applied",
  "notes": "Referred by a friend in the Cloud team"
}
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| `companyName` | Required, string, max 255 chars |
| `jobTitle` | Required, string, max 255 chars |
| `jobUrl` | Optional, valid URL format |
| `source` | Required, one of: `LinkedIn`, `Bdjobs`, `Indeed`, `Wellfound`, `Facebook`, `Referral`, `Other` |
| `applicationDate` | Required, valid ISO date string |
| `status` | Required, one of: `Saved`, `Applied`, `Assessment`, `Interview`, `Rejected`, `Offer` |
| `notes` | Optional, string |

**Response — 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "e5f6g7h8-...",
    "userId": "a1b2c3d4-...",
    "companyName": "Google",
    "jobTitle": "Software Engineer",
    "jobUrl": "https://careers.google.com/jobs/123",
    "source": "LinkedIn",
    "applicationDate": "2026-07-15",
    "status": "Applied",
    "notes": "Referred by a friend in the Cloud team",
    "createdAt": "2026-07-19T12:30:00.000Z",
    "updatedAt": "2026-07-19T12:30:00.000Z"
  }
}
```

**Errors:**
| Status | Condition | Message |
|--------|-----------|---------|
| 400 | Missing required fields or invalid enum values | `"Validation failed"` |
| 401 | Not authenticated | `"Unauthorized"` |
| 500 | Server failure | `"Internal server error"` |

---

### `GET /api/applications`

| Property | Value |
|----------|-------|
| **Purpose** | List all applications for the authenticated user |
| **Auth Required** | Yes |

**Query Parameters (all optional):**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Case-insensitive search across `companyName` and `jobTitle` |
| `status` | string | Filter by application status enum value |
| `source` | string | Filter by application source enum value |
| `sortBy` | string | Field to sort: `createdAt` or `applicationDate` (default: `createdAt`) |
| `order` | string | Sort direction: `asc` or `desc` (default: `desc`) |

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "e5f6g7h8-...",
      "companyName": "Google",
      "jobTitle": "Software Engineer",
      "source": "LinkedIn",
      "status": "Applied",
      "applicationDate": "2026-07-15",
      "createdAt": "2026-07-19T12:30:00.000Z"
    }
  ]
}
```

**Errors:**
| Status | Condition | Message |
|--------|-----------|---------|
| 401 | Not authenticated | `"Unauthorized"` |

---

### `GET /api/applications/:id`

| Property | Value |
|----------|-------|
| **Purpose** | Get full details of a specific application |
| **Auth Required** | Yes |

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID | Application identifier |

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "e5f6g7h8-...",
    "userId": "a1b2c3d4-...",
    "companyName": "Google",
    "jobTitle": "Software Engineer",
    "jobUrl": "https://careers.google.com/jobs/123",
    "source": "LinkedIn",
    "status": "Applied",
    "applicationDate": "2026-07-15",
    "notes": "Referred by a friend in the Cloud team",
    "createdAt": "2026-07-19T12:30:00.000Z",
    "updatedAt": "2026-07-19T12:30:00.000Z"
  }
}
```

**Errors:**
| Status | Condition | Message |
|--------|-----------|---------|
| 401 | Not authenticated | `"Unauthorized"` |
| 403 | Application belongs to another user | `"Forbidden"` |
| 404 | Application ID not found | `"Application not found"` |

---

### `PATCH /api/applications/:id`

| Property | Value |
|----------|-------|
| **Purpose** | Update an existing application |
| **Auth Required** | Yes |

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID | Application identifier |

**Request Body (partial update — send only changed fields):**
```json
{
  "status": "Interview",
  "notes": "Phone screen scheduled for July 25"
}
```

**Validation Rules:** Same as creation, but all fields are optional. At least one field must be present.

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "e5f6g7h8-...",
    "status": "Interview",
    "notes": "Phone screen scheduled for July 25",
    "updatedAt": "2026-07-20T09:00:00.000Z"
  }
}
```

**Errors:**
| Status | Condition | Message |
|--------|-----------|---------|
| 400 | No fields provided or invalid values | `"Validation failed"` |
| 401 | Not authenticated | `"Unauthorized"` |
| 403 | Application belongs to another user | `"Forbidden"` |
| 404 | Application ID not found | `"Application not found"` |

---

### `DELETE /api/applications/:id`

| Property | Value |
|----------|-------|
| **Purpose** | Permanently delete an application |
| **Auth Required** | Yes |

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID | Application identifier |

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "message": "Application deleted successfully"
  }
}
```

**Errors:**
| Status | Condition | Message |
|--------|-----------|---------|
| 401 | Not authenticated | `"Unauthorized"` |
| 403 | Application belongs to another user | `"Forbidden"` |
| 404 | Application ID not found | `"Application not found"` |

---

## 4. Dashboard

### `GET /api/dashboard/stats`

| Property | Value |
|----------|-------|
| **Purpose** | Get aggregated application statistics for the authenticated user |
| **Auth Required** | Yes |

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "saved": 5,
    "applied": 20,
    "assessment": 6,
    "interview": 4,
    "rejected": 5,
    "offer": 2,
    "recentApplications": [
      {
        "id": "e5f6g7h8-...",
        "companyName": "Google",
        "jobTitle": "Software Engineer",
        "status": "Applied",
        "createdAt": "2026-07-19T12:30:00.000Z"
      }
    ]
  }
}
```

**Errors:**
| Status | Condition | Message |
|--------|-----------|---------|
| 401 | Not authenticated | `"Unauthorized"` |

---

## 5. HTTP Status Code Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (new resource created) |
| 400 | Bad Request | Validation failure, malformed JSON, missing required fields |
| 401 | Unauthorized | Missing token, expired token, invalid token, wrong credentials |
| 403 | Forbidden | Authenticated user attempting to access another user's resource |
| 404 | Not Found | Resource ID does not exist in the database |
| 409 | Conflict | Duplicate unique constraint violation (e.g., email already taken) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled exception, database connection failure |
