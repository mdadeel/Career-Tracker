export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "CareerTrack API",
    version: "1.0.0",
    description: `REST API for CareerTrack — a job application tracking SaaS.  
    
Built with Express, TypeScript, Prisma, and PostgreSQL.

## Authentication
Most endpoints require a JWT bearer token. Register or log in via \`/api/auth/login\`, then include the token in the \`Authorization\` header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting
- Auth endpoints: 10 requests per 15 minutes
- All other endpoints: 100 requests per 15 minutes
`,
    contact: {
      email: "support@careertrack.app",
    },
    license: {
      name: "MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Health", description: "Server health checks" },
    { name: "Auth", description: "Authentication and user management" },
    { name: "Applications", description: "Job application CRUD operations" },
    { name: "Dashboard", description: "Dashboard summary statistics" },
    { name: "Analytics", description: "Advanced analytics and insights" },
  ],
  paths: {
    // ── Health ──
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns the server status and current timestamp.",
        operationId: "healthCheck",
        responses: {
          "200": {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "healthy" },
                        timestamp: { type: "string", format: "date-time", example: "2026-07-19T12:00:00.000Z" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Auth: Register ──
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Creates a new user account and returns a JWT token.",
        operationId: "register",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2, example: "Alex Morgan" },
                  email: { type: "string", format: "email", example: "alex@example.com" },
                  password: { type: "string", minLength: 6, format: "password", example: "securepass123" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation error or email already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ── Auth: Login ──
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Authenticates a user and returns a JWT token.",
        operationId: "login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "alex@example.com" },
                  password: { type: "string", format: "password", example: "securepass123" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponse",
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ── Auth: Me ──
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        description: "Returns the authenticated user's profile.",
        operationId: "getMe",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized — missing or invalid token" },
          "404": { description: "User not found" },
        },
      },
    },

    // ── Auth: Change Password ──
    "/api/auth/password": {
      patch: {
        tags: ["Auth"],
        summary: "Change password",
        description: "Changes the authenticated user's password. Requires the current password for verification.",
        operationId: "changePassword",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string", format: "password", example: "oldpass123" },
                  newPassword: { type: "string", minLength: 6, format: "password", example: "newpass456" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password changed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        message: { type: "string", example: "Password changed successfully" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Current password is incorrect or validation failed" },
          "401": { description: "Unauthorized" },
        },
      },
    },

    // ── Applications: List ──
    "/api/applications": {
      get: {
        tags: ["Applications"],
        summary: "List applications",
        description: "Returns a paginated list of the user's job applications with optional filtering and sorting.",
        operationId: "listApplications",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 }, description: "Page number" },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 }, description: "Items per page" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search by company name, job title, or job description" },
          { name: "status", in: "query", schema: { $ref: "#/components/schemas/ApplicationStatus" }, description: "Filter by status" },
          { name: "source", in: "query", schema: { $ref: "#/components/schemas/ApplicationSource" }, description: "Filter by source" },
          {
            name: "sortBy",
            in: "query",
            schema: { type: "string", enum: ["newest", "oldest", "date-newest", "date-oldest"], default: "newest" },
            description: "Sort order",
          },
        ],
        responses: {
          "200": {
            description: "Paginated list of applications",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        applications: { type: "array", items: { $ref: "#/components/schemas/Application" } },
                        total: { type: "integer", example: 24 },
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 10 },
                        totalPages: { type: "integer", example: 3 },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Applications"],
        summary: "Create application",
        description: "Creates a new job application for the authenticated user.",
        operationId: "createApplication",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["companyName", "jobTitle", "source", "applicationDate"],
                properties: {
                  companyName: { type: "string", example: "Stripe" },
                  jobTitle: { type: "string", example: "Senior Frontend Engineer" },
                  jobUrl: { type: "string", format: "uri", example: "https://stripe.com/jobs/123" },
                  source: { $ref: "#/components/schemas/ApplicationSource" },
                  applicationDate: { type: "string", format: "date", example: "2026-07-15" },
                  status: { $ref: "#/components/schemas/ApplicationStatus" },
                  notes: { type: "string", example: "Referred by John from the team." },
                  jobDescription: { type: "string", example: "We are looking for a senior engineer..." },
                  resumeLink: { type: "string", format: "uri", example: "https://resume.example.com/alex.pdf" },
                  interviewDate: { type: "string", format: "date", nullable: true, example: "2026-07-25" },
                  salaryMin: { type: "integer", example: 150000 },
                  salaryMax: { type: "integer", example: 200000 },
                  salaryCurrency: { type: "string", default: "USD", example: "USD" },
                  location: { type: "string", example: "San Francisco, CA" },
                  employmentType: { type: "string", enum: ["Full-time", "Part-time", "Contract", "Internship"], example: "Full-time" },
                  remoteStatus: { type: "string", enum: ["Remote", "Hybrid", "On-site"], example: "Remote" },
                  companyLogo: { type: "string", format: "uri", example: "https://logo.clearbit.com/stripe.com" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Application created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Application" },
                  },
                },
              },
            },
          },
          "400": { description: "Validation error" },
          "401": { description: "Unauthorized" },
        },
      },
    },

    // ── Applications: Get by ID ──
    "/api/applications/{id}": {
      get: {
        tags: ["Applications"],
        summary: "Get application by ID",
        description: "Returns a single job application by its ID.",
        operationId: "getApplicationById",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "Application ID" },
        ],
        responses: {
          "200": {
            description: "Application details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Application" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden — not the owner" },
          "404": { description: "Application not found" },
        },
      },
      patch: {
        tags: ["Applications"],
        summary: "Update application",
        description: "Updates an existing job application. All fields are optional — only provided fields will be updated.",
        operationId: "updateApplication",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "Application ID" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  companyName: { type: "string", example: "Stripe" },
                  jobTitle: { type: "string", example: "Senior Frontend Engineer" },
                  jobUrl: { type: "string", format: "uri" },
                  source: { $ref: "#/components/schemas/ApplicationSource" },
                  applicationDate: { type: "string", format: "date" },
                  status: { $ref: "#/components/schemas/ApplicationStatus" },
                  notes: { type: "string" },
                  jobDescription: { type: "string" },
                  resumeLink: { type: "string", format: "uri" },
                  interviewDate: { type: "string", format: "date", nullable: true },
                  salaryMin: { type: "integer", nullable: true },
                  salaryMax: { type: "integer", nullable: true },
                  salaryCurrency: { type: "string" },
                  location: { type: "string", nullable: true },
                  employmentType: { type: "string", nullable: true },
                  remoteStatus: { type: "string", nullable: true },
                  companyLogo: { type: "string", format: "uri", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Application updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Application" },
                  },
                },
              },
            },
          },
          "400": { description: "Validation error" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden — not the owner" },
          "404": { description: "Application not found" },
        },
      },
      delete: {
        tags: ["Applications"],
        summary: "Delete application",
        description: "Permanently deletes a job application.",
        operationId: "deleteApplication",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "Application ID" },
        ],
        responses: {
          "200": {
            description: "Application deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        message: { type: "string", example: "Application deleted successfully" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden — not the owner" },
          "404": { description: "Application not found" },
        },
      },
    },

    // ── Dashboard: Stats ──
    "/api/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard statistics",
        description: "Returns summary metrics for the user's job search pipeline including counts by status, rates, source breakdown, and recent activity.",
        operationId: "getDashboardStats",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Dashboard statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/DashboardStats" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },

    // ── Analytics: Stats ──
    "/api/analytics/stats": {
      get: {
        tags: ["Analytics"],
        summary: "Get analytics data",
        description: "Returns advanced analytics including monthly trends, pipeline funnel, source effectiveness, status distribution, and summary metrics with conversion rates.",
        operationId: "getAnalyticsStats",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Analytics data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/AnalyticsStats" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from /api/auth/login or /api/auth/register",
      },
    },
    schemas: {
      // ── Enums ──
      ApplicationStatus: {
        type: "string",
        enum: ["Saved", "Applied", "Assessment", "Interview", "Rejected", "Offer"],
        description: "Current stage of the application in the pipeline",
      },
      ApplicationSource: {
        type: "string",
        enum: ["LinkedIn", "Bdjobs", "Indeed", "Wellfound", "Facebook", "Referral", "Other"],
        description: "Where the job was found",
      },


      // ── Models ──
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "9fcbc900-2a80-448b-bad8-d6d46a829b15" },
          name: { type: "string", example: "Alex Morgan" },
          email: { type: "string", format: "email", example: "alex@example.com" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
              user: { $ref: "#/components/schemas/User" },
            },
          },
        },
      },
      Application: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          companyName: { type: "string", example: "Stripe" },
          jobTitle: { type: "string", example: "Senior Frontend Engineer" },
          jobUrl: { type: "string", format: "uri", nullable: true },
          source: { $ref: "#/components/schemas/ApplicationSource" },
          applicationDate: { type: "string", format: "date" },
          status: { $ref: "#/components/schemas/ApplicationStatus" },
          notes: { type: "string", nullable: true },
          jobDescription: { type: "string", nullable: true },
          resumeLink: { type: "string", format: "uri", nullable: true },
          interviewDate: { type: "string", format: "date", nullable: true },
          salaryMin: { type: "integer", nullable: true, example: 150000 },
          salaryMax: { type: "integer", nullable: true, example: 200000 },
          salaryCurrency: { type: "string", example: "USD" },
          location: { type: "string", nullable: true, example: "San Francisco, CA" },
          employmentType: { type: "string", nullable: true, enum: ["Full-time", "Part-time", "Contract", "Internship"], example: "Full-time" },
          remoteStatus: { type: "string", nullable: true, enum: ["Remote", "Hybrid", "On-site"], example: "Remote" },
          companyLogo: { type: "string", format: "uri", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      DashboardStats: {
        type: "object",
        properties: {
          total: { type: "integer", example: 24 },
          saved: { type: "integer", example: 3 },
          applied: { type: "integer", example: 6 },
          assessment: { type: "integer", example: 3 },
          interview: { type: "integer", example: 6 },
          rejected: { type: "integer", example: 4 },
          offer: { type: "integer", example: 2 },
          responseRate: { type: "integer", example: 33 },
          offerRate: { type: "integer", example: 8 },
          interviewRate: { type: "integer", example: 25 },
          rejectionRate: { type: "integer", example: 17 },
          avgTimeToInterview: { type: "integer", nullable: true, example: 25 },
          sourceBreakdown: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source: { type: "string" },
                count: { type: "integer" },
                percentage: { type: "integer" },
              },
            },
          },
          recentApplications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                companyName: { type: "string" },
                jobTitle: { type: "string" },
                status: { $ref: "#/components/schemas/ApplicationStatus" },
                applicationDate: { type: "string", format: "date" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      AnalyticsStats: {
        type: "object",
        properties: {
          monthlyTrends: {
            type: "array",
            description: "Application counts per month for the last 12 months",
            items: {
              type: "object",
              properties: {
                month: { type: "string", example: "2026-01" },
                count: { type: "integer", example: 5 },
              },
            },
          },
          funnel: {
            type: "array",
            description: "Count of applications at each pipeline stage",
            items: {
              type: "object",
              properties: {
                stage: { $ref: "#/components/schemas/ApplicationStatus" },
                count: { type: "integer", example: 6 },
              },
            },
          },
          sourceEffectiveness: {
            type: "array",
            description: "Conversion rates by application source",
            items: {
              type: "object",
              properties: {
                source: { type: "string" },
                total: { type: "integer" },
                interview: { type: "integer" },
                offer: { type: "integer" },
                conversionRate: { type: "integer", description: "Percentage of apps that reached interview", example: 33 },
              },
            },
          },
          summary: {
            type: "object",
            properties: {
              totalApplications: { type: "integer", example: 24 },
              totalInterviews: { type: "integer", example: 6 },
              totalOffers: { type: "integer", example: 2 },
              totalRejected: { type: "integer", example: 4 },
              responseRate: { type: "integer", example: 33 },
              interviewRate: { type: "integer", example: 25 },
              offerRate: { type: "integer", example: 8 },
              rejectionRate: { type: "integer", example: 17 },
              avgTimeToInterview: { type: "integer", nullable: true, example: 25 },
              activeApplications: { type: "integer", example: 18 },
            },
          },
          statusDistribution: {
            type: "array",
            items: {
              type: "object",
              properties: {
                status: { $ref: "#/components/schemas/ApplicationStatus" },
                count: { type: "integer" },
              },
            },
          },
        },
      },

      // ── Common ──
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid credentials" },
        },
      },
    },
  },
};
