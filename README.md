# signup-landing

Лендинг с формой заявки на демо-урок. Одна страница, без бэкенда.

Репозиторий заведён из шаблона `base-project-template` (вариант `with-git`) —
`workain/agent-harness-registry`, `templates/base-project-template/`.

- Что делаем и что считается «готово» — `spec.md`.
- Правила для кодинг-агента — `CLAUDE.md` (`AGENTS.md` — симлинк на него).
- Почему принято решение — `DECISIONS.md`, структурно — `doc/adr/`.

## Запуск

```
npm ci
npx playwright install chromium   # один раз на машину
npm run dev                       # http://localhost:5173
npm run build
npx playwright test
```
