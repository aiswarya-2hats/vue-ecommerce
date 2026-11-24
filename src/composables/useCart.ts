import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { getCookie, setCookie } from '../utils/cookies'
import type { CartItem, VariantSelection } from '../types/product'

const KEY = 'novashop_cart'

function sameLine(item: CartItem, id: number | string, variantId: string | number | null = null) {
  return item.id === Number(id) && (item.variantId || null) === (variantId || null)
}

function load(): CartItem[] {
  const data = getCookie(KEY)
  if (!Array.isArray(data)) return []

  return data
    .map((item: Record<string, unknown> | CartItem) => ({
      id: Number((item as CartItem).id),
      qty: Math.max(1, Number((item as CartItem).qty) || 1),
      variantId: ((item as CartItem).variantId as string | null) || null,
      options: ((item as CartItem).options as CartItem['options']) || null,
      image: ((item as CartItem).image as string | null) || null,
      price: (item as CartItem).price ?? null,
    }))
    .filter((item) => item.id)
}

const cartItems = ref<CartItem[]>(load())

function save() {
  setCookie(KEY, cartItems.value)
}

export function useCart() {
  const cartCount = computed(() => cartItems.value.length)

  function getQty(id: number | string, variantId: string | number | null = null) {
    const numId = Number(id)
    if (variantId) {
      return cartItems.value.find((item) => sameLine(item, numId, variantId))?.qty || 0
    }
    return cartItems.value
      .filter((item) => item.id === numId)
      .reduce((sum, item) => sum + item.qty, 0)
  }

  function add(id: number | string, qty = 1, variant: VariantSelection | null = null) {
    const numId = Number(id)
    const amount = Math.max(1, Number(qty) || 1)
    const variantId = variant?.id != null ? String(variant.id) : null
    if (!numId) return

    const existing = cartItems.value.find((item) => sameLine(item, numId, variantId))

    if (existing) {
      cartItems.value = cartItems.value.map((item) =>
        sameLine(item, numId, variantId) ? { ...item, qty: item.qty + amount } : item,
      )
    } else {
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

  function setQty(id: number | string, qty: number, variantId: string | number | null = null) {
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

  function remove(id: number | string, variantId: string | number | null = null) {
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
