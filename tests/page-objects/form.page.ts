import { expect, type Locator, type Page, type Route } from '@playwright/test'

/**
 * Объект страницы формы заявки.
 *
 * Конвенция папки `tests/`: тест НЕ ходит по селекторам напрямую — только через этот
 * объект. Селектор живёт в одном месте, и правка разметки чинится в одном файле, а не
 * в каждом тесте. Новый тест, которому нужен новый элемент, добавляет геттер сюда.
 */
export const FORM_ENDPOINT = 'https://formspree.io/f/**'

export class FormPage {
  readonly name: Locator
  readonly email: Locator
  readonly submit: Locator
  readonly status: Locator

  constructor(readonly page: Page) {
    this.name = page.getByLabel('Имя')
    this.email = page.getByLabel('Email')
    this.submit = page.getByRole('button', { name: 'Отправить заявку' })
    this.status = page.locator('#status')
  }

  async open() {
    await this.page.goto('/')
  }

  error(field: 'name' | 'email'): Locator {
    return this.page.locator(`.error[data-error-for="${field}"]`)
  }

  async fill(name: string, email: string) {
    await this.name.fill(name)
    await this.email.fill(email)
  }

  async send() {
    await this.submit.click()
  }

  /** Сократить таймаут отправки, чтобы тест на повтор не ждал восемь секунд. */
  async setSendTimeout(ms: number) {
    await this.page.locator('#signup-form').evaluate((el, value) => {
      ;(el as HTMLFormElement).dataset.sendTimeoutMs = String(value)
    }, ms)
  }

  /**
   * Перехватывает внешний сервис приёма форм: ни один тест не ходит в интернет.
   * `handler` получает номер попытки (1, 2, …) и решает, что ответить.
   * Возвращает массив попыток — по одному элементу на каждый реально ушедший запрос.
   */
  async stubEndpoint(
    handler: (attempt: number, route: Route) => Promise<void> | void = (_a, route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  ): Promise<{ method: string; body: string | null }[]> {
    const requests: { method: string; body: string | null }[] = []
    await this.page.route(FORM_ENDPOINT, async (route) => {
      requests.push({ method: route.request().method(), body: route.request().postData() })
      await handler(requests.length, route)
    })
    return requests
  }

  async expectSent() {
    await expect(this.status).toHaveAttribute('data-kind', 'ok')
  }

  async expectFailed() {
    await expect(this.status).toHaveAttribute('data-kind', 'fail')
  }
}
