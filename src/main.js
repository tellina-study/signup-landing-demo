import { validateForm } from './validate.js'

const form = document.querySelector('#signup-form')

form.addEventListener('submit', (event) => {
  for (const field of form.querySelectorAll('input')) field.removeAttribute('aria-invalid')
  for (const box of form.querySelectorAll('.error')) {
    box.hidden = true
    box.textContent = ''
  }

  const errors = validateForm(form)
  // No errors: do nothing and let the browser POST to the external form service.
  if (errors.length === 0) return

  event.preventDefault()
  for (const { field, message } of errors) {
    field.setAttribute('aria-invalid', 'true')
    const box = form.querySelector(`.error[data-error-for="${field.id}"]`)
    box.textContent = message
    box.hidden = false
  }
  errors[0].field.focus()
})
