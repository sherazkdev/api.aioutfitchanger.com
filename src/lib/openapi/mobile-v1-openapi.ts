/**
 * OpenAPI 3.0 — mobile / public v1 API (Swagger UI).
 * Keep in sync with src/app/api/v1/* route handlers.
 */
export const mobileV1OpenApi = {
  openapi: "3.0.3",
  info: {
    title: "AI Outfit Changer API",
    version: "1.0.0",
    description:
      "Production API for Flutter app. All JSON responses use envelope `{ data, error }`. " +
      "Authorize with **Bearer** access token from `/auth/login` or `/auth/register`.",
  },
  servers: [
    { url: "https://appworkspro.com/api/v1", description: "Production" },
    { url: "http://localhost:3000/api/v1", description: "Local" },
  ],
  tags: [
    { name: "Auth" },
    { name: "User" },
    { name: "Content" },
    { name: "Try-On" },
    { name: "History" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "access_token from login/register",
      },
    },
    schemas: {
      ApiError: {
        type: "object",
        properties: {
          code: { type: "string", example: "VALIDATION" },
          message: { type: "string" },
        },
        required: ["code", "message"],
      },
      EnvelopeError: {
        type: "object",
        properties: {
          data: { type: "object", nullable: true, example: null },
          error: { $ref: "#/components/schemas/ApiError" },
        },
      },
      UserSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          display_name: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
        },
      },
      AuthTokens: {
        type: "object",
        properties: {
          access_token: { type: "string" },
          refresh_token: { type: "string" },
          expires_at: { type: "string", format: "date-time" },
          user: { $ref: "#/components/schemas/UserSummary" },
        },
      },
      TryOnGenerateRequest: {
        type: "object",
        required: ["source_image_base64", "style_id"],
        properties: {
          source_image_base64: {
            type: "string",
            description: "data:image/jpeg;base64,... or raw base64",
          },
          style_id: { type: "string", example: "men_hair_styles_02" },
          category_id: {
            type: "string",
            example: "hair_styles",
            description: "hair_styles | hijab_styles | wardrobe_browse | couple_duo | ...",
          },
          person_gender: { type: "string", enum: ["men", "women"] },
          gender: { type: "string", enum: ["men", "women"], description: "alias of person_gender" },
          width: { type: "integer", default: 768 },
          height: { type: "integer", default: 1024 },
          prompt: { type: "string", description: "Optional override; omit for catalog styles" },
          style_reference_image_base64: {
            type: "string",
            description: "Optional; server resolves catalog ref when omitted",
          },
        },
      },
      TryOnJobCreated: {
        type: "object",
        properties: {
          job_id: { type: "string" },
          external_job_id: { type: "string" },
          polling_url: { type: "string", example: "/api/v1/try-on/jobs/..." },
          status: { type: "string", example: "queued" },
        },
      },
      TryOnJobStatus: {
        type: "object",
        properties: {
          job_id: { type: "string" },
          status: {
            type: "string",
            enum: ["queued", "processing", "completed", "failed", "cancelled"],
          },
          result_image_url: { type: "string", nullable: true },
          result_image_absolute_url: { type: "string", nullable: true },
          error: { type: "string", nullable: true },
        },
      },
      HistoryItem: {
        type: "object",
        properties: {
          id: { type: "string" },
          image_url: { type: "string" },
          image_absolute_url: { type: "string" },
          source_image_url: { type: "string", nullable: true },
          source_image_absolute_url: { type: "string", nullable: true },
          style_id: { type: "string", nullable: true },
          category_id: { type: "string", nullable: true },
          is_favorite: { type: "boolean" },
          saved_to_wardrobe: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      HistoryList: {
        type: "object",
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/HistoryItem" } },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/app/metadata": {
      get: {
        tags: ["Content"],
        summary: "App metadata & feature flags",
        responses: {
          "200": { description: "OK" },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register (app user)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  display_name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tokens + user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/AuthTokens" },
                    error: { type: "object", nullable: true, example: null },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login (app user)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Same shape as register" } },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { refresh_token: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "New access_token + refresh_token" } },
      },
    },
    "/users/me": {
      get: {
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        summary: "Current user profile",
        responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } },
      },
    },
    "/users/me/preferences": {
      get: {
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        summary: "User preferences (incl. style_gender_preference)",
        responses: { "200": { description: "OK" } },
      },
      patch: {
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        summary: "Update preferences",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  style_gender_preference: { type: "string", enum: ["men", "women"] },
                  theme_mode: { type: "string", enum: ["system", "light", "dark"] },
                  notifications_enabled: { type: "boolean" },
                  language_id: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/home/feed": {
      get: {
        tags: ["Content"],
        summary: "Home feed sections",
        parameters: [
          {
            name: "gender",
            in: "query",
            schema: { type: "string", enum: ["men", "women"] },
          },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/catalog/{categoryId}": {
      get: {
        tags: ["Content"],
        summary: "Style catalog grid",
        parameters: [
          { name: "categoryId", in: "path", required: true, schema: { type: "string" } },
          { name: "gender", in: "query", schema: { type: "string", enum: ["men", "women"] } },
          { name: "tab", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" }, "404": { description: "Category not found" } },
      },
    },
    "/try-on/generate": {
      post: {
        tags: ["Try-On"],
        security: [{ bearerAuth: [] }],
        summary: "Start try-on job (hair, hijab, outfit, couple)",
        description:
          "Server picks prompt, reference image, and BFL engine (flux-2-pro vs vto-v2). Poll job until completed.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TryOnGenerateRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Job queued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/TryOnJobCreated" },
                    error: { nullable: true },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "422": { description: "Validation (image, gender, style)" },
          "429": { description: "Rate limit" },
        },
      },
    },
    "/try-on/jobs/{jobId}": {
      get: {
        tags: ["Try-On"],
        security: [{ bearerAuth: [] }],
        summary: "Poll job status / result",
        parameters: [{ name: "jobId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Job state",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/TryOnJobStatus" },
                    error: { nullable: true },
                  },
                },
              },
            },
          },
          "403": { description: "Not your job" },
          "404": { description: "Job not found" },
        },
      },
      delete: {
        tags: ["Try-On"],
        security: [{ bearerAuth: [] }],
        summary: "Cancel job",
        parameters: [{ name: "jobId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "cancelled" } },
      },
    },
    "/history": {
      get: {
        tags: ["History"],
        security: [{ bearerAuth: [] }],
        summary: "List saved looks (paginated)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "favorites", in: "query", schema: { type: "boolean" } },
        ],
        responses: {
          "200": {
            description: "History page",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/HistoryList" },
                    error: { nullable: true, example: null },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["History"],
        security: [{ bearerAuth: [] }],
        summary: "Save look to history",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["image_url"],
                properties: {
                  image_url: { type: "string" },
                  source_image_url: { type: "string" },
                  style_id: { type: "string" },
                  category_id: { type: "string" },
                  is_favorite: { type: "boolean" },
                  saved_to_wardrobe: { type: "boolean" },
                  try_on_job_id: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Created" } },
      },
      delete: {
        tags: ["History"],
        security: [{ bearerAuth: [] }],
        summary: "Bulk delete",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ids"],
                properties: { ids: { type: "array", items: { type: "string" } } },
              },
            },
          },
        },
        responses: { "200": { description: "deleted_count" } },
      },
    },
  },
} as const;
