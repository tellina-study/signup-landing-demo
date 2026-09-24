import { test, expect } from '@playwright/test'
import { FormPage } from './page-objects/form.page'

/**
 * Доставка заявки: повтор при таймауте ровно один раз.
 *
 * Эти тесты — единственное, что удерживает обещание комментария к `submitForm()` в
 * `src/main.js`: «повторяется РОВНО ОДИН раз, поэтому обработчик обязан быть
 * идемпотентным». Без второго теста ниже повтор можно молча превратить в три попытки,
 * и комментарий станет ложью, ничего не сломав.
 */

test('a request that times out is retried exactly once, and then succeeds', async ({ page }) => {
  const form = new FormPage(page)
  const requests = await form.stubEndpoint(async (attempt, route) => {
    if (attempt === 1) return // первая попытка не отвечает никогда — наше ожидание истечёт
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
  })
  await form.open()
  await form.setSendTimeout(300)

  await form.fill('Анна', 'anna@example.com')
  await form.send()

  await form.expectSent()
  expect(requests.map((r) => r.method)).toEqual(['POST', 'POST'])
})

test('a request that keeps timing out is not retried a third time', async ({ page }) => {
  const form = new FormPage(page)
  const requests = await form.stubEndpoint(() => {
    // Никогда не отвечаем: обе попытки обязаны истечь по таймауту.
  })
  await form.open()
  await form.setSendTimeout(300)

  await form.fill('Анна', 'anna@example.com')
  await form.send()

  await form.expectFailed()
  expect(requests.map((r) => r.method)).toEqual(['POST', 'POST'])
})

test('a refusal from the service is not retried at all', async ({ page }) => {
  const form = new FormPage(page)
  const requests = await form.stubEndpoint(async (_attempt, route) => {
    await route.fulfill({ status: 422, contentType: 'application/json', body: '{"ok":false}' })
  })
  await form.open()

  await form.fill('Анна', 'anna@example.com')
  await form.send()

  // Сервис ответил — и ответил отказом. Второй такой же запрос ничего не изменит.
  await form.expectFailed()
  expect(requests.map((r) => r.method)).toEqual(['POST'])
})

test('both fields reach the service, not just the ones the form validates', async ({ page }) => {
  const form = new FormPage(page)
  const requests = await form.stubEndpoint()
  await form.open()

  await form.fill('Анна', 'anna@example.com')
  await form.send()

  await form.expectSent()
  // Проверка именно тела: форма, потерявшая `name` из разметки, всё равно отправится —
  // просто без этого поля. Тело кодируется как x-www-form-urlencoded, поэтому читаем его
  // разбором, а не подстрокой: подстрока проверяла бы кодировку, не данные.
  const sent = new URLSearchParams(requests[0].body ?? '')
  expect(sent.get('name')).toBe('Анна')
  expect(sent.get('email')).toBe('anna@example.com')
})
