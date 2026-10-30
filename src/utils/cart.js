import { ref, computed } from 'vue'
import { getCookie, setCookie } from './cookies'

const KEY = 'novashop_cart'

function load() {
  // load the cart items from the cookie
  const data = getCookie(KEY)
  if (!Array.isArray(data)) return []

  return data
    .map((item) => ({
      id: Number(item.id),
      qty: Math.max(1, Number(item.qty) || 1),
    }))
    .filter((item) => item.id)
}

export const cartItems = ref(load())
export const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.qty, 0))

function save() {
  setCookie(KEY, cartItems.value)
}

export function getQty(id) {
  // get the quantity of an item in the cart
  return cartItems.value.find((item) => item.id === Number(id))?.qty || 0
}

export function addToCart(id, qty = 1) {
  // add an item to the cart
  const numId = Number(id)
  const amount = Math.max(1, Number(qty) || 1)
  if (!numId) return

  const item = cartItems.value.find((entry) => entry.id === numId)
  if (item) item.qty += amount
  else cartItems.value.push({ id: numId, qty: amount })

  save()
}

export function removeFromCart(id) {
  // remove an item from the cart
  cartItems.value = cartItems.value.filter((item) => item.id !== Number(id))
  save()
}

export function clearCart() {
  cartItems.value = []
  save()
}
