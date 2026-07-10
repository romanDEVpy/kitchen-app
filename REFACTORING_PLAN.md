# Refactoring Plan

| Priority | Status | Task |
|---|---|---|
| P0 | DONE | Открыть публичный `POST /api/leads` без auth-блокировки и сохранить server validation. |
| P0 | DONE | Запретить manager удалять лиды через `DELETE /api/leads`. |
| P0 | DONE | Убрать network-dependent Google Fonts build blocker. |
| P1 | DONE | Перейти с deprecated `middleware.js` на Next 16 `proxy.js`. |
| P1 | DONE | Добавить `typecheck` и behavior tests. |
| P1 | DONE | Вынести CRM status allow-list в общий модуль и валидировать runtime. |
| P1 | TODO | Разделить `src/app/admin/page.js` на feature sections: products, promos, reviews, leads, logs. |
| P1 | TODO | Объединить `src/lib/db.js` и `src/lib/prisma.js` в один Prisma client. |
| P1 | TODO | Внедрить единый API error/success response contract. |
| P2 | TODO | Исправить React Compiler warnings без отключения на warning level. |
| P2 | TODO | Заменить `<img>` на `next/image` в ключевых карточках. |
| P2 | TODO | Обновить README под фактический запуск и реальные ограничения. |
| P3 | TODO | Разобрать старые audit/generator files и удалить только подтверждённо неиспользуемые. |
