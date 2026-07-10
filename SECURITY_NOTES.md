# Security Notes

## Roles

Roles are `admin` and `manager`. They are stored inside the signed `admin_token` cookie. Frontend role changes do not grant rights because API handlers re-check the token.

## Secrets

There are no production fallback credentials. Required auth env is validated at runtime. Known insecure default values are rejected. `.env` remains ignored; `.env.example` contains placeholders only.

## Handler Protection

- Products POST/PUT/DELETE: admin only.
- Promos POST: admin only.
- Reviews POST: admin only.
- Logs GET: admin only.
- Leads GET/PATCH: admin or manager.
- Leads DELETE: admin only.

## Input Validation

Handlers validate IDs, slugs, prices, dimensions, ratings, phones, text lengths, lead statuses and upload metadata/content signatures.

## Rate Limits

Login, lead submission and upload endpoints use in-memory rate limiting. This is acceptable for a single-process deployment, but production multi-instance deployments need shared rate limiting.

## CSP

`next.config.mjs` contains the active security headers. CSP has not been aggressively tightened because the app uses Next, 3D/animation libraries and existing inline styles. Further hardening should be tested page by page.

## Remaining Risks

SQLite/local uploads require persistent storage and backups. Some UI code is still large and legacy; security-critical checks are server-side and covered by smoke tests.
