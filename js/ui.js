// ui.js
import { nls } from './i18n.js'

export function setAddressField (id, text) {
  const el = document.getElementById(id)
  if (el) el.value = text || ''
}

export function updateDistance (text) {
  const el = document.getElementById('distance')
  if (el) el.textContent = nls().DISTANCE + (text ? `: ${text}` : '')
}

export function updatePrice (text) {
  const el = document.getElementById('price')
  if (el) el.textContent = nls().ESTIMATED_PRICE + (text ? `: ${text}` : '')
}

export function showMessage (t) {
  const el = document.getElementById('msg')
  if (el) el.textContent = t || ''
}
