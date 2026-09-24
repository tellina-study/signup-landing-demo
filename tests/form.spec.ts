import { test, expect } from '@playwright/test'
import { FormPage } from './page-objects/form.page'

test('the page shows a name field, an email field and a submit button', async ({ page }) => {
  const form = new FormPage(page)
  await form.open()
  await expect(form.name).toBeVisible()
  await expect(form.email).toBeVisible()
  await expect(form.submit).toBeVisible()
})

test('an empty form is not submitted, and says which fields are missing', async ({ page }) => {
  const form = new FormPage(page)
  const requests = await form.stubEndpoint()
  await form.open()

  await form.send()

  // The point of the whole test file: nothing left the page.
  await expect(form.error('name')).toHaveText('Заполните это поле')
  await expect(form.error('email')).toHaveText('Заполните это поле')
  await expect(form.name).toBeFocused()
  expect(requests).toEqual([])
})

test('a malformed email is not submitted either', async ({ page }) => {
  const form = new FormPage(page)
  const requests = await form.stubEndpoint()
  await form.open()

  await form.fill('Анна', 'anna-at-example')
  await form.send()

  await expect(form.error('email')).toHaveText('Проверьте адрес почты')
  expect(requests).toEqual([])
})

test('a filled-in form is sent to the external form service', async ({ page }) => {
  const form = new FormPage(page)
  const requests = await form.stubEndpoint()
  await form.open()

  await form.fill('Анна', 'anna@example.com')
  await form.send()

  // Without this case, a validate.js that rejected everything would still look green.
  await form.expectSent()
  expect(requests.map((r) => r.method)).toEqual(['POST'])
})
