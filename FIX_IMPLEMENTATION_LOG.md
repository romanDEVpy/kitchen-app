# Fix Implementation Log

## Baseline

Initial commands before code changes:

- `git status --short`: project is inside a much larger Git worktree; output includes unrelated files outside this app. No git reset/checkout was used.
- `npm install`: passed. Warning: `@prisma/streams-local@0.1.2` declares Node `>=22`, current runtime is Node `v20.19.5`.
- `npm run lint`: passed with warnings only. Main warnings were legacy React Compiler warnings (`setState` in effects, `Math.random` during render, camera mutation) and `<img>` usage.
- `npm run typecheck`: passed (`next typegen`).
- `npm test`: initially 5 tests passed after escalated run. Existing tests covered only auth token round-trip/expiry/tamper and lead status allow-list. They did not touch API handlers, DB, roles, production config, uploads or e2e persistence.
- `npm run build`: passed after escalated run.

Existing tests were green because they used pure unit checks and no real API/DB behavior. They did not detect fallback credentials, missing server-side authorization, inconsistent API contracts, mass assignment, upload validation or dev DB risk.

## Confirmed Audit Issues

- Insecure fallback/default auth configuration risk.
- Server-side role checks were not consistently centralized.
- API responses used mixed shapes.
- Two Prisma client modules existed.
- Lead mutation allowed unsafe shape unless explicitly filtered.
- Tests did not cover direct API authorization or persistence.
- Upload validation was too shallow.
- README and production docs did not describe actual runtime constraints.

## Implemented Changes

- Added required auth env validation and known-default rejection in `src/lib/serverConfig.js`.
- Removed default JWT secret behavior from `src/lib/auth.js`.
- Added centralized auth guards in `src/lib/serverAuth.js`.
- Added standard API helpers in `src/lib/apiResponse.js` and frontend parser in `src/lib/clientApi.js`.
- Converted auth, leads, products, promos, reviews, logs and upload APIs to `{ ok, data/error }` contract.
- Enforced handler-level role checks: manager cannot perform admin mutations by direct API request.
- Consolidated Prisma access into `src/lib/prisma.js` and removed `src/lib/db.js`.
- Added runtime validators in `src/lib/validators.js`.
- Hardened lead PATCH to allow only `status` and `notes`; unknown fields are rejected.
- Added audit logging helper and audit events for login/content/lead mutations.
- Added optional Telegram adapter with timeout and non-blocking failure behavior.
- Hardened uploads with extension, MIME, size, random filename and basic signature checks.
- Adjusted proxy to protect pages only; API authorization is enforced by handlers.
- Added `.env.example`, `README.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md`, `OPERATIONS.md`, `SECURITY_NOTES.md`.
- Added unit tests for API contract and runtime auth config.
- Added `npm run e2e` production smoke using a copied SQLite DB in `scratch/e2e-smoke.db`.

## Verification After Changes

- `npm test`: 12 tests passing.
- `npm run build`: passing.
- `npm run e2e`: passing; verifies public lead creation, validation error, manager lead read/update, manager denial for delete/products/promos/reviews/logs, invalid token rejection, admin delete, audit log visibility and spoofed upload rejection.

Final full regression commands are run at the end of the implementation pass.

## Remaining Limitations

- `src/app/admin/page.js`, `src/components/ContactForm.jsx` and some 3D/catalog UI remain large and still produce lint warnings.
- Mobile viewport verification was not completed with browser screenshots in this run.
- SQLite/local uploads remain documented production constraints, not fully replaced with PostgreSQL/object storage.
- Some historical mojibake remains in legacy UI/schema comments outside security-critical touched paths.
