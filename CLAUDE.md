# CLAUDE.md

signup-landing: статический лендинг с формой заявки на демо-урок.
Готово = `npm run build` код 0, `npx playwright test` зелёный, форма
отправлена руками из собранного `dist/` — и заполненная, и пустая.

## Safety / scope boundaries
- Никогда не запускать деплой на прод без явного запроса.

## Build, test, verify
- To verify: открыть `dist/index.html` после сборки и отправить форму
  руками — с заполненными и с пустыми полями.
- Один раз на машину, до первого `npx playwright test`: `npm ci`, затем
  `npx playwright install chromium`. Без второй команды падают все тесты
  сразу и не по делу.
