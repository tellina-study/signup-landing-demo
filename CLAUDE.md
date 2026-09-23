# CLAUDE.md

`signup-landing` — одна статическая страница с формой заявки на демо-урок (имя + email), без
своего бэкенда. «Готово» описано в `spec.md`.

## Safety / scope boundaries

- Никогда не запускать деплой на прод без явного запроса.

## Build, test, verify

- Build: `npm run build`
- Test: `npx playwright test`
- Run locally: `npm run dev`
- Проверить, что правка правда работает (а не просто собирается): открыть `dist/index.html`
  после сборки и отправить форму руками — с заполненными и с пустыми полями.

Один раз после клонирования, **до** первого `npx playwright test`: `npm ci`, затем
`npx playwright install chromium`. Без второй команды падают сразу все 4 теста, мгновенно
и не по делу: `browserType.launch: Executable doesn't exist at .../chrome-headless-shell`.

## Repository etiquette

- Ветка `case-…` / `issue-NNN-…`, создаётся до первой правки. Прямо в `main` не коммитим.
- Коммитить часто: падение процесса не должно терять работу.
- `git switch … && git commit …` одной командой хук отклонит — он читает ветку до запуска
  всей строки. Переключение ветки делать отдельной командой.

## Ворота

`.claude/settings.json` — `PreToolUse`-хук, отклоняющий коммит прямо в `main`/`master`.
Лежит в git, поэтому живёт в любом свежем клоне сам, без шага установки.
`.claude/hooks/selftest-branch-guard.sh` проверяет, что он правда срабатывает, и печатает
случаи, где он молчит. Правка `settings.json` — перезапуск самотеста.
