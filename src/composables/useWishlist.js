import { ref, computed } from 'vue'
import { getCookie, setCookie } from '../utils/cookies'

const KEY = 'novashop_wishlist'

function sameProduct(item, id) {
  return item.id === Number(id)
}

function sameEntry(item, id, variantId = null) {
  const itemVariant = item.variantId != null ? String(item.variantId) : null
  const checkVariant = variantId != null ? String(variantId) : null
  return sameProduct(item, id) && itemVariant === checkVariant
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

  // Product-level: true if any entry for this product exists (card + quick view stay in sync)
  function isWishlisted(id) {
    return wishlistItems.value.some((item) => sameProduct(item, id))
  }

  function toggle(id, variant = null) {
    const numId = Number(id)
    if (!numId) return

    const already = wishlistItems.value.some((item) => sameProduct(item, numId))

    if (already) {
      // Second click removes every entry for this product
      wishlistItems.value = wishlistItems.value.filter((item) => !sameProduct(item, numId))
    } else {
      wishlistItems.value = [
        ...wishlistItems.value,
        {
          id: numId,
          variantId: variant?.id || null,
          options: variant?.options || null,
          image: variant?.image || null,
          price: variant?.price ?? null,
        },
      ]
    }

    save()
  }

  function remove(id, variantId = null) {
    if (variantId == null) {
      wishlistItems.value = wishlistItems.value.filter((item) => !sameProduct(item, id))
    } else {
      wishlistItems.value = wishlistItems.value.filter((item) => !sameEntry(item, id, variantId))
    }
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
