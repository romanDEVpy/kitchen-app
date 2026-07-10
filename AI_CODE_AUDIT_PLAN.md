# AI Code Audit Plan

## Архитектура
- Next.js 16 App Router в `src/app`.
- Публичный сайт: `/`, `/catalog`, `/privacy`, `/sitemap.xml`.
- Закрытые панели: `/admin`, `/manager`, логины `/admin/login`, `/manager/login`.
- API: `/api/auth/*`, `/api/leads`, `/api/products`, `/api/promos`, `/api/reviews`, `/api/upload`, `/api/logs`.
- Данные: SQLite `dev.db`, Prisma schema в `prisma/schema.prisma`, сгенерированный client в `src/generated/prisma`.
- Auth: HMAC token в cookie `admin_token`, optimistic access control в `src/proxy.js`, повторные проверки в части route handlers.

## Главные модули
- `src/app/layout.js`: общий shell, навигация, footer, глобальная форма заявки.
- `src/components/ContactForm.jsx`: публичный квиз и отправка лидов.
- `src/app/admin/page.js`: крупная CEO/admin панель для продуктов, промо, отзывов, лидов и логов.
- `src/app/manager/page.js`: CRM менеджера для лидов, статусов и заметок.
- `src/app/api/leads/route.js`: создание, чтение, обновление и удаление лидов.
- `src/lib/auth.js`, `src/proxy.js`, `src/lib/leadStatus.js`: auth/session и общие CRM-статусы.

## Подозрительные области
- Крупные компоненты: `admin/page.js`, `ContactForm.jsx`, `Catalog.jsx`, `3DHeroSection.jsx`, `ScrollModel.jsx`.
- Два Prisma клиента: `src/lib/db.js` и `src/lib/prisma.js`.
- Сгенерированный Prisma client хранится внутри `src`, что смешивает application code и generated artifacts.
- README содержит заявления о безопасности и готовности, которые до аудита не совпадали с middleware/API.
- React Compiler warnings показывают derived state/effect debt и impure render в 3D.

## Порядок проверки
1. Зафиксировать исходные `lint`, `build`, `typecheck`, `test`.
2. Проверить Next 16 local docs: structure, route handlers, proxy, errors, mutations.
3. Проверить auth boundaries и публичные сценарии заявки/upload.
4. Проверить CRUD API на runtime validation и права.
5. Проверить frontend на fake UI, setTimeout, local-only state, dead links.
6. Исправлять P0/P1 малыми группами, после группы повторять проверки.

## Критерии качества
- Public lead submission работает без admin cookie и валидируется на сервере.
- Manager не может удалять лиды.
- CRM status принимает только разрешённый набор значений.
- Build не зависит от внешнего Google Fonts fetch.
- Next 16 conventions соблюдены: `proxy.js` вместо deprecated `middleware.js`.
- Lint/typecheck/build/test имеют воспроизводимые команды.

## План безопасного рефакторинга
- DONE: снять build-blockers и deprecated middleware.
- DONE: исправить P0 auth gap в `/api/leads`.
- DONE: добавить минимальные behavior tests для auth/status.
- TODO: разделить `admin/page.js` и `ContactForm.jsx` на feature components.
- TODO: объединить Prisma client, убрать workaround-комментарии после проверки Turbopack.
- TODO: заменить derived filter state в `Catalog.jsx` на memoized derived data.
- TODO: сделать единый API response/error contract.
