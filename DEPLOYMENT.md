# Deployment

## Build

```bash
npm install
npx prisma generate
npx prisma db push
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
npm run start
```

## Environment

Required: `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `MANAGER_USERNAME`, `MANAGER_PASSWORD`, `DATABASE_FILE`.

Optional: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NEXT_PUBLIC_SITE_URL`.

Use a random `JWT_SECRET` with at least 32 characters. Rotate it if any old default or real secret was committed or shared.

## Database

Current production path is SQLite. Store `DATABASE_FILE` on persistent disk. Include the DB file and SQLite WAL/SHM files in backups when WAL mode is enabled. For multiple app instances or higher write concurrency, migrate to PostgreSQL.

## Uploads

Local uploads are stored in `public/images`. Mount this directory on persistent storage and include it in backups. Do not deploy to an ephemeral filesystem unless uploads are disabled or moved to object storage.

## Reverse Proxy

Serve over HTTPS. Forward `Host`, `X-Forwarded-For` and `X-Forwarded-Proto`. Keep cookies secure in production.

## Seed

Do not seed demo credentials automatically. Create admin/manager credentials through environment variables or an explicit operational procedure.
