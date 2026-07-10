# AI Code Audit

## Состояние до изменений
- `npm run lint`: падал с 37 errors и 11 warnings.
- `npm run build`: падал из-за `next/font/google` fetch к Google Fonts при restricted network; также Next неверно определял workspace root из-за lockfile выше проекта.
- `typecheck` и `test` скриптов не было.
- `npm run dev` в sandbox падал с `spawn EPERM`; `next start` после build проверен вне sandbox на `http://localhost:3002`, главная страница вернула `200`.

## Признаки AI-generated code
- Крупные god components: `src/app/admin/page.js`, `src/components/ContactForm.jsx`, `src/components/ui/Catalog.jsx`.
- Дублирующие Prisma clients: `src/lib/db.js` и `src/lib/prisma.js`.
- Комментарии, оправдывающие workaround и future production storage вместо короткого контракта.
- README обещал security behavior, которое код не выполнял для `DELETE /api/leads`.
- UI/3D код содержит `Math.random` в render/memo и много state sync effects.

## Фиктивная или вводящая в заблуждение функциональность
- P0 `src/proxy.js`/старый `src/middleware.js`: публичная форма заявки обещала отправку, но `POST /api/leads` был закрыт auth middleware. Статус: DONE.
- P0 `src/app/api/leads/route.js`: README обещал удаление лидов только admin, но manager проходил middleware. Статус: DONE.
- P1 `src/app/api/upload/route.js`: форма принимала PDF, API отвергал PDF. Статус: DONE.
- P1 `src/components/ui/Catalog.jsx`: фильтры хранили derived state отдельно от products. Статус: TODO.

## Архитектурные проблемы
- Route handlers смешивают HTTP, validation, persistence, logging и внешние Telegram side effects.
- Нет единого формата API ошибок: часть `{ error }`, часть raw models, часть `{ success }`.
- Сгенерированный Prisma client находится в `src/generated/prisma`.
- `admin/page.js` совмещает products, promos, reviews, leads, logs, forms и upload UI.

## Дублирование и мёртвый код
- Дублирование Prisma client: `db.js` и `prisma.js`.
- Документы `AUDIT_RESULT.md`, `CHANGELOG_IMPROVEMENTS.md`, `site_and_crm_audit*.md` выглядят как предыдущие AI-отчёты и не являются runtime-документацией.
- Генераторы `generate_*.py` не участвуют в build scripts; удалить можно только после подтверждения владельца ассетов.

## Типизация и runtime validation
- Проект в JavaScript, TypeScript типов приложению почти не даёт.
- Добавлен runtime allow-list `src/lib/leadStatus.js` для CRM-статусов.
- `PATCH /api/leads` теперь отклоняет неизвестный status и пустые update body.

## Обработка ошибок
- До изменений часть critical auth проверок была только в middleware.
- Добавлена повторная server-side проверка admin role в `DELETE /api/leads`.
- Осталось унифицировать error model и убрать технические `console.error`/`alert` из UI flows.

## Проблемы тестов
- До изменений тестов не было.
- Добавлены behavior tests для auth token и lead status allow-list.

## Выполненные изменения
- Убран `next/font/google`, build больше не зависит от сети.
- Добавлен `turbopack.root` в `next.config.mjs`.
- `src/middleware.js` заменён на Next 16 `src/proxy.js`.
- Public `POST /api/leads` открыт, protected read/update/delete сохранены.
- `DELETE /api/leads` требует admin в proxy и route handler.
- `PATCH /api/leads` валидирует CRM status.
- Upload API поддерживает PDF и проверяет file signature для jpg/png/webp/pdf.
- Добавлены `npm test` и `npm run typecheck`.

## Оставшиеся ограничения
- Lint проходит, но содержит 29 warnings по React Compiler и `<img>`.
- Большие компоненты пока не разделены.
- Единый API response/error contract не внедрён.
- README всё ещё требует отдельной редакции из-за устаревших/повреждённых текстов.
