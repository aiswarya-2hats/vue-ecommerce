import { ref, computed } from 'vue'
import { getCookie, setCookie } from '../utils/cookies'
import type { VariantSelection, WishlistItem } from '../types/product'

const KEY = 'novashop_wishlist'

function sameProduct(item: WishlistItem, id: number | string) {
  return item.id === Number(id)
}

function sameEntry(item: WishlistItem, id: number | string, variantId: string | number | null = null) {
  const itemVariant = item.variantId != null ? String(item.variantId) : null
  const checkVariant = variantId != null ? String(variantId) : null
  return sameProduct(item, id) && itemVariant === checkVariant
}

function load(): WishlistItem[] {
  const data = getCookie(KEY)
  if (!Array.isArray(data)) return []

  return data
    .map((item: unknown) => {
      if (typeof item === 'number' || typeof item === 'string') {
        return {
          id: Number(item),
          variantId: null,
          options: null,
          image: null,
          price: null,
        }
      }

      const entry = item as Partial<WishlistItem>
      return {
        id: Number(entry.id),
        variantId: entry.variantId || null,
        options: entry.options || null,
        image: entry.image || null,
        price: entry.price ?? null,
      }
    })
    .filter((item) => item.id)
}

const wishlistItems = ref<WishlistItem[]>(load())

function save() {
  setCookie(KEY, wishlistItems.value)
}

export function useWishlist() {
  const wishlistCount = computed(() => wishlistItems.value.length)

  function isWishlisted(id: number | string, variantId: string | number | null = null) {
    return wishlistItems.value.some((item) => sameEntry(item, id, variantId))
  }

  function toggle(id: number | string, variant: VariantSelection | null = null) {
    const numId = Number(id)
    if (!numId) return

    const variantId = variant?.id != null ? String(variant.id) : null
    const already = wishlistItems.value.some((item) => sameEntry(item, numId, variantId))

    if (already) {
      wishlistItems.value = wishlistItems.value.filter(
        (item) => !sameEntry(item, numId, variantId),
      )
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

  function remove(id: number | string, variantId: string | number | null = null) {
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
