import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { getCookie, setCookie } from '../utils/cookies'

const KEY = 'novashop_cart'

function load() {
  const data = getCookie(KEY)
  if (!Array.isArray(data)) return []

  return data
    .map((item) => ({
      id: Number(item.id),
      qty: Math.max(1, Number(item.qty) || 1),
    }))
    .filter((item) => item.id)
}

// main reactive variable that stores all cart products
const cartItems = ref(load())

function save() {
  // Whenever the cart changes, this function saves the latest cart data into the cookie.
  setCookie(KEY, cartItems.value)
}

export function useCart() {
  //reusable composable function .can use in any component
  const cartCount = computed(() => cartItems.value.length) //calculates the number of unique products in your cart

  function getQty(id) {
    return cartItems.value.find((item) => item.id === Number(id))?.qty || 0
  }

  function add(id, qty = 1) {
    const numId = Number(id)
    const amount = Math.max(1, Number(qty) || 1)
    if (!numId) return

    const existing = cartItems.value.find((item) => item.id === numId)

    if (existing) {
      // Same product → increase qty only (Header count stays the same)
      cartItems.value = cartItems.value.map((item) =>
        item.id === numId ? { ...item, qty: item.qty + amount } : item,
      )
    } else {
      // New product → new row (Header count +1)
      cartItems.value = [...cartItems.value, { id: numId, qty: amount }]
    }

    save()
    toast.success('Added to cart')
  }

  function setQty(id, qty) {
    const numId = Number(id)
    const next = Math.max(0, Number(qty) || 0)
    if (!numId) return

    if (next === 0) {
      remove(numId)
      return
    }

    cartItems.value = cartItems.value.map((item) =>
      item.id === numId ? { ...item, qty: next } : item,
    )
    save()
  }

  function remove(id) {
    cartItems.value = cartItems.value.filter((item) => item.id !== Number(id))
    save()
  }

  function clear() {
    cartItems.value = []
    save()
  }

  return {
    cartItems,
    cartCount,
    getQty,
    add,
    setQty,
    remove,
    clear,
  }
}
