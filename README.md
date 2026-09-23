# signup-landing — демо-репозиторий семинара

Лендинг с формой заявки на демо-урок: одна статическая страница, без бэкенда.

Это **учебный репозиторий**. Ценность здесь не в коде — в истории коммитов: каждый шаг
семинара сделан по-настоящему, и на каждом значимом коммите реально прогнаны сборка,
тесты и самотест ворот. Ничего не реконструировано задним числом.

## Как читать

```
git log --graph --oneline
```

| Коммит | Кейс семинара | Что в нём настоящего |
|---|---|---|
| `День 0` | день 0 | `CLAUDE.md` с ОДНОЙ строкой гейта, `spec.md` до первой строки кода, `DECISIONS.md` без записей |
| `Лендинг` | — | первый работающий инкремент: `npm run build` собирает `dist/`, `npx playwright test` → `4 passed` |
| `Кейс 1.2` | 1.2, хуки | ворота защиты ветки, решение принято по факту прогона самотеста: `RESULT: PASS — 9/9 checks` плюс 5 напечатанных пределов |

**Доведено до кейса 1.2.** Кейсы 1.3 (правило трёх адресов), 2.1, 2.2 и 2.3 здесь ещё не
сыграны — сказано прямо, чтобы никто не принял отсутствие за сделанное.

## Шаблон, из которого это выросло

День 0 собран из шаблона, а не придуман:

- [`coding-agent-starter`](https://github.com/workain/agent-harness-registry/tree/main/templates/coding-agent-starter)
  — простой шаблон репозитория для кодинг-агента. Начинать с него.
- [`base-project-template`](https://github.com/workain/agent-harness-registry/tree/main/templates/base-project-template)
  — полный: скиллы, субагенты, MCP, профили.

Ворота (`.claude/settings.json` + самотест) — файлы `base-project-template/with-git/`
как есть, не вторая реализация.

## Запуск

```
npm ci
npx playwright install chromium   # один раз на машину
npm run dev                       # http://localhost:5173
npm run build
npx playwright test
```

Без `playwright install` падают сразу все 4 теста, мгновенно и не по делу:
`browserType.launch: Executable doesn't exist at .../chrome-headless-shell`.
