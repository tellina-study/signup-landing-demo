import { test, expect } from '@playwright/test'
import { FormPage } from './page-objects/form.page'

/**
 * Доставка заявки во внешний сервис приёма форм.
 *
 * Отдельный файл от `form.spec.ts` сознательно: тот про то, что форма НЕ отправляет
 * неверное, этот — про то, что верное доходит и доходит один раз. Без второго тесты
 * зелены и у валидатора, который отвергает вообще всё.
 */

test('a filled-in form is sent to the external form service', async ({ page }) => {
  const form = new FormPage(page)
  const requests = await form.stubEndpoint()
  await form.open()

  await form.fill('Анна', 'anna@example.com')
  await form.send()

  await expect.poll(() => requests.map((r) => r.method)).toEqual(['POST'])
})

test('both fields reach the service, not just the ones the form validates', async ({ page }) => {
  const form = new FormPage(page)
  const requests = await form.stubEndpoint()
  await form.open()

  await form.fill('Анна', 'anna@example.com')
  await form.send()

  await expect.poll(() => requests.length).toBe(1)
  // Проверка именно тела: форма, потерявшая `name` из разметки, всё равно отправится —
  // просто без этого поля. Тело браузер кодирует как x-www-form-urlencoded, поэтому
  // читаем его разбором, а не подстрокой: подстрока проверяла бы кодировку, не данные.
  const sent = new URLSearchParams(requests[0].body ?? '')
  expect(sent.get('name')).toBe('Анна')
  expect(sent.get('email')).toBe('anna@example.com')
})
