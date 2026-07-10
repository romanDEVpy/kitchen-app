# Kitchen App

Next.js 16 application for a kitchen furniture public site with catalog, lead capture form, manager CRM and admin content panel.

## Stack

- Next.js 16 App Router, React 19
- Prisma 7 with SQLite through `@prisma/adapter-better-sqlite3`
- Node test runner for unit/integration checks
- Local filesystem uploads under `public/images`
- Optional Telegram notification for new leads

## Required environment

Copy `.env.example` to `.env` for local development and set real values:

```env
JWT_SECRET=replace-with-at-least-32-random-characters
ADMIN_USERNAME=owner-login
ADMIN_PASSWORD=owner-password
MANAGER_USERNAME=manager-login
MANAGER_PASSWORD=manager-password
DATABASE_FILE=dev.db
NEXT_PUBLIC_SITE_URL=https://example.com
```

The app no longer falls back to `admin/admin`, `manager/manager` or a default JWT secret. If auth env is missing or uses known demo values, auth endpoints return a controlled configuration error.

## Development

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The project uses SQLite. `DATABASE_FILE` points to the runtime database file. Keep it on persistent storage in production.

## Production build

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
npm run start
```

`npm run e2e` starts a production server on a copied SQLite database in `scratch/e2e-smoke.db` and checks real HTTP behavior for public, manager and admin flows.

## Roles

- Public: view site/catalog, create leads, upload allowed files through the public form.
- Manager: read leads and update allowed lead fields/status. Cannot delete leads or mutate admin content.
- Admin: manage products, promos, reviews, delete leads and read audit logs.

Every critical API handler performs server-side authorization. UI visibility is not treated as security.

## Working features

- Public catalog and landing pages.
- Public lead creation persisted to SQLite.
- Manager CRM lead list/status/notes update.
- Admin product, promo, review and lead management.
- Audit log for login, lead changes and admin content mutations.
- Local upload validation by size, extension, MIME and basic file signature.
- Optional Telegram notification after lead persistence.

## Known production limits

- SQLite is acceptable for a small CRM deployment on one persistent server. It is not suitable for serverless ephemeral filesystems or high write concurrency. Plan PostgreSQL before scaling.
- Uploads are local files. Production must mount `public/images` or another configured upload directory on persistent storage and include it in backups.
- Telegram failures do not block lead creation.
- Some legacy UI strings and large components remain from the original project; core security/API behavior is now covered by tests.
