import { ref, computed } from 'vue'
import { getCookie, setCookie } from '../utils/cookies'

const KEY = 'novashop_wishlist'

function sameEntry(item, id, variantId = null) {
  return item.id === Number(id) && (item.variantId || null) === (variantId || null)
}

function load() {
  const data = getCookie(KEY)
  if (!Array.isArray(data)) return []

  return data
    .map((item) => {
      // Migrate legacy format: bare product id
      if (typeof item === 'number' || typeof item === 'string') {
        return {
          id: Number(item),
          variantId: null,
          options: null,
          image: null,
          price: null,
        }
      }

      return {
        id: Number(item.id),
        variantId: item.variantId || null,
        options: item.options || null,
        image: item.image || null,
        price: item.price ?? null,
      }
    })
    .filter((item) => item.id)
}

// Shared across every useWishlist() call
const wishlistItems = ref(load())

function save() {
  setCookie(KEY, wishlistItems.value)
}

export function useWishlist() {
  const wishlistCount = computed(() => wishlistItems.value.length)

  function isWishlisted(id, variantId = null) {
    return wishlistItems.value.some((item) => sameEntry(item, id, variantId))
  }

  function toggle(id, variant = null) {
    const numId = Number(id)
    const variantId = variant?.id || null
    if (!numId) return

    const index = wishlistItems.value.findIndex((item) => sameEntry(item, numId, variantId))

    if (index >= 0) {
      wishlistItems.value = wishlistItems.value.filter((_, i) => i !== index)
    } else {
      wishlistItems.value = [
        ...wishlistItems.value,
        {
          id: numId,
          variantId,
          options: variant?.options || null,
          image: variant?.image || null,
          price: variant?.price ?? null,
        },
      ]
    }

    save()
  }

  function remove(id, variantId = null) {
    wishlistItems.value = wishlistItems.value.filter(
      (item) => !sameEntry(item, id, variantId),
    )
    save()
  }

  function clear() {
    wishlistItems.value = []
    save()
  }

  return {
    wishlistItems,
    wishlistCount,
    isWishlisted,
    toggle,
    remove,
    clear,
  }
}
