# Operations

## Health Checks

- `GET /` should return 200.
- `GET /catalog` should return 200.
- Auth endpoints should return `SERVER_CONFIGURATION_ERROR` if required env is missing.

## Logs

Application logs are written to stdout/stderr. Audit events are stored in the `AuditLog` table and visible to admin users through `/api/logs`.

## Backup

Back up the SQLite DB file and `public/images`. Test restore by copying both into a staging instance and running `npm run e2e` against the restored data copy.

## Restore

Stop the app, replace the database/upload files from backup, then start the app and verify `/`, `/catalog`, login, lead creation and manager/admin workflows.

## Credential Rotation

Change `JWT_SECRET` to invalidate active sessions. Update `ADMIN_PASSWORD` and `MANAGER_PASSWORD` in the runtime environment and restart the app.

## Telegram Diagnostics

If leads are saved but Telegram is silent, verify `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, network access to Telegram and logs containing `[telegram] notification failed`. Tokens are not logged.
