import { ref, computed } from 'vue'
import { getCookie, setCookie } from '../utils/cookies'

const KEY = 'novashop_wishlist'

function load() {
  const data = getCookie(KEY)
  if (!Array.isArray(data)) return []
  return data.map(Number).filter(Boolean)
}

// Shared across every useWishlist() call
const wishlistIds = ref(load())

function save() {
  setCookie(KEY, wishlistIds.value)
}

export function useWishlist() {
  const wishlistCount = computed(() => wishlistIds.value.length)

  function isWishlisted(id) {
    return wishlistIds.value.includes(Number(id))
  }

  function toggle(id) {
    const numId = Number(id)
    if (!numId) return

    const index = wishlistIds.value.indexOf(numId)
    if (index >= 0) wishlistIds.value.splice(index, 1)
    else wishlistIds.value.push(numId)

    save()
  }

  function clear() {
    wishlistIds.value = []
    save()
  }

  return {
    wishlistIds,
    wishlistCount,
    isWishlisted,
    toggle,
    clear,
  }
}
