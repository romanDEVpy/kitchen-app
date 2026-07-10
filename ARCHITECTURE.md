# Architecture

## Modules

- `src/app`: Next.js App Router pages, public routes and API route handlers.
- `src/app/api/*`: HTTP boundary. Handlers parse input, authorize, validate and return the standard API contract.
- `src/lib/apiResponse.js`: shared API response/error helpers.
- `src/lib/serverAuth.js`: centralized cookie token authentication and role guards.
- `src/lib/auth.js`: HMAC token signing/verification.
- `src/lib/serverConfig.js`: required auth env validation and insecure default rejection.
- `src/lib/prisma.js`: the single Prisma client with development hot-reload caching.
- `src/lib/validators.js`: runtime validation for API input.
- `src/server/audit`: audit logging adapter.
- `src/server/notifications.js`: optional Telegram adapter.
- `src/components`: public UI components including catalog and lead forms.

## Data Flow

Public lead flow: user submits the form, `/api/leads` validates fields, creates a `Lead`, writes an audit event, then attempts Telegram notification. Telegram errors are logged and do not roll back the lead.

Auth flow: `/api/auth/login` validates required env, compares explicit runtime credentials, signs an HMAC token and stores it in the HTTP-only `admin_token` cookie. Missing or insecure env values return `SERVER_CONFIGURATION_ERROR`.

Manager CRM flow: `/api/leads` GET/PATCH requires `admin` or `manager`. PATCH accepts only `status` and `notes`; unknown fields are rejected to prevent mass assignment.

Admin content flow: product, promo and review mutations require `admin`. Lead deletion and audit log reading require `admin`.

Upload flow: `/api/upload` accepts a single file, rate limits requests, validates extension, MIME type, file size and basic signatures, then stores with a random filename under `public/images`.

## API Contract

Success:

```json
{ "ok": true, "data": {} }
```

Error:

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "Check submitted data" } }
```

Core error codes: `VALIDATION_ERROR`, `AUTHENTICATION_REQUIRED`, `INVALID_CREDENTIALS`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `SERVER_CONFIGURATION_ERROR`, `INTERNAL_ERROR`.

## Authorization Rules

- Public users cannot read or mutate CRM/admin data.
- Managers can read leads and update allowed lead fields only.
- Admins can mutate content, delete leads and read audit logs.

The proxy only protects admin/manager pages. API security is enforced in route handlers.

## Extension Points

- Replace SQLite by changing Prisma datasource/migrations and deployment docs.
- Replace local uploads by implementing a storage adapter behind `/api/upload`.
- Add stronger CSP once all inline script/style needs are identified.
