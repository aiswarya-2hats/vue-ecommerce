import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { getCookie, setCookie } from '../utils/cookies'

const KEY = 'novashop_cart'

function sameLine(item, id, variantId = null) {
  return item.id === Number(id) && (item.variantId || null) === (variantId || null)
}

function load() {
  const data = getCookie(KEY)
  if (!Array.isArray(data)) return []

  return data
    .map((item) => ({
      id: Number(item.id),
      qty: Math.max(1, Number(item.qty) || 1),
      variantId: item.variantId || null,
      options: item.options || null,
      image: item.image || null,
      price: item.price ?? null,
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

  function getQty(id, variantId = null) {
    const numId = Number(id)
    if (variantId) {
      return cartItems.value.find((item) => sameLine(item, numId, variantId))?.qty || 0
    }
    // no variant → sum all lines for this product
    return cartItems.value
      .filter((item) => item.id === numId)
      .reduce((sum, item) => sum + item.qty, 0)
  }

  function add(id, qty = 1, variant = null) {
    const numId = Number(id)
    const amount = Math.max(1, Number(qty) || 1)
    const variantId = variant?.id || null
    if (!numId) return

    const existing = cartItems.value.find((item) => sameLine(item, numId, variantId))

    if (existing) {
      // Same product + variant → increase qty only
      cartItems.value = cartItems.value.map((item) =>
        sameLine(item, numId, variantId) ? { ...item, qty: item.qty + amount } : item,
      )
    } else {
      // New product/variant → new row
      cartItems.value = [
        ...cartItems.value,
        {
          id: numId,
          qty: amount,
          variantId,
          options: variant?.options || null,
          image: variant?.image || null,
          price: variant?.price ?? null,
        },
      ]
    }

    save()
    toast.success('Added to cart')
  }

  function setQty(id, qty, variantId = null) {
    const numId = Number(id)
    const next = Math.max(0, Number(qty) || 0)
    if (!numId) return

    if (next === 0) {
      remove(numId, variantId)
      return
    }

    cartItems.value = cartItems.value.map((item) =>
      sameLine(item, numId, variantId) ? { ...item, qty: next } : item,
    )
    save()
  }

  function remove(id, variantId = null) {
    cartItems.value = cartItems.value.filter((item) => !sameLine(item, id, variantId))
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
