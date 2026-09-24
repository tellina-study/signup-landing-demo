import { type Locator, type Page, type Route } from '@playwright/test'

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

  constructor(readonly page: Page) {
    this.name = page.getByLabel('Имя')
    this.email = page.getByLabel('Email')
    this.submit = page.getByRole('button', { name: 'Отправить заявку' })
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

  /**
   * Перехватывает внешний сервис приёма форм: ни один тест не ходит в интернет.
   * Возвращает массив запросов — по одному на каждую реально ушедшую отправку.
   */
  async stubEndpoint(): Promise<{ method: string; body: string | null }[]> {
    const requests: { method: string; body: string | null }[] = []
    await this.page.route(FORM_ENDPOINT, async (route: Route) => {
      requests.push({ method: route.request().method(), body: route.request().postData() })
      await route.fulfill({ status: 200, contentType: 'text/html', body: 'ok' })
    })
    return requests
  }
}
