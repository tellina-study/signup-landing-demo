const MESSAGES = {
  valueMissing: 'Заполните это поле',
  typeMismatch: 'Проверьте адрес почты',
  patternMismatch: 'Проверьте адрес почты',
}

/**
 * @param {HTMLFormElement} form
 * @returns {{ field: HTMLInputElement, message: string }[]} empty when the form may be sent
 */
export function validateForm(form) {
  const errors = []
  for (const field of form.querySelectorAll('input')) {
    if (field.checkValidity()) continue
    const reason = Object.keys(MESSAGES).find((key) => field.validity[key])
    errors.push({ field, message: MESSAGES[reason] ?? 'Проверьте это поле' })
  }
  return errors
}
