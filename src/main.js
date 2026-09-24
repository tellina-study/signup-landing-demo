import { validateForm } from './validate.js'

const form = document.querySelector('#signup-form')
const status = document.querySelector('#status')

const DEFAULT_SEND_TIMEOUT_MS = 8000

// Одна отправка + один повтор. Число живёт ровно здесь: два места, кодирующих «два»,
// разъезжаются молча, и тест на повтор перестаёт что-либо проверять.
const MAX_ATTEMPTS = 2

/**
 * Отправляет заявку на внешний сервис приёма форм.
 *
 * ПОВТОР ПРИ ТАЙМАУТЕ: если ответа нет за `timeoutMs`, отправка повторяется РОВНО
 * ОДИН раз. Первый запрос при этом не отменяется на стороне сервиса — прерывается
 * только наше ожидание, — поэтому мы не знаем и не можем узнать, дошёл он или нет.
 * Следствие, которое нельзя потерять при правке: обработчик на стороне сервиса
 * ОБЯЗАН быть идемпотентным по (email, дата), иначе одна заявка с медленной сети
 * превращается в две.
 *
 * Меняете число повторов или таймаут — это решение про сервис приёма, а не про
 * страницу: см. doc/adr/0003-otpravka-formy-s-povtorom.md.
 *
 * @returns {Promise<{ok: boolean, attempts: number}>}
 */
export async function submitForm(formEl, { timeoutMs } = {}) {
  const limit = Number(timeoutMs ?? formEl.dataset.sendTimeoutMs ?? DEFAULT_SEND_TIMEOUT_MS)
  // URLSearchParams, а не FormData: тело остаётся x-www-form-urlencoded — ровно тем,
  // чем его отправлял браузер до этой правки. Смена кодировки тела была бы отдельным
  // решением про контракт с сервисом, и здесь она не нужна.
  const body = new URLSearchParams(new FormData(formEl))

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), limit)
    try {
      const response = await fetch(formEl.action, {
        method: 'POST',
        body,
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      return { ok: response.ok, attempts: attempt }
    } catch (error) {
      // Повтор только по таймауту, и только один. Отказ сервиса повторять нельзя:
      // он ответил, и ответил отказом — второй такой же запрос ничего не изменит.
      const lastTry = attempt === MAX_ATTEMPTS
      if (error.name !== 'AbortError' || lastTry) return { ok: false, attempts: attempt }
    } finally {
      clearTimeout(timer)
    }
  }
  return { ok: false, attempts: MAX_ATTEMPTS }
}

function clearErrors() {
  for (const field of form.querySelectorAll('input')) field.removeAttribute('aria-invalid')
  for (const box of form.querySelectorAll('.error')) {
    box.hidden = true
    box.textContent = ''
  }
  status.hidden = true
  status.textContent = ''
}

function showErrors(errors) {
  for (const { field, message } of errors) {
    field.setAttribute('aria-invalid', 'true')
    const box = form.querySelector(`.error[data-error-for="${field.id}"]`)
    box.textContent = message
    box.hidden = false
  }
  errors[0].field.focus()
}

function say(message, kind) {
  status.textContent = message
  status.dataset.kind = kind
  status.hidden = false
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  clearErrors()

  const errors = validateForm(form)
  if (errors.length > 0) {
    showErrors(errors)
    return
  }

  const button = form.querySelector('button[type="submit"]')
  button.disabled = true
  say('Отправляем…', 'pending')
  try {
    const { ok } = await submitForm(form)
    if (ok) {
      say('Заявка отправлена. Мы вернёмся с датой и временем.', 'ok')
      form.reset()
    } else {
      say('Не удалось отправить. Попробуйте ещё раз или напишите нам письмом.', 'fail')
    }
  } finally {
    button.disabled = false
  }
})
