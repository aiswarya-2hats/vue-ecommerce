import { ref, computed } from 'vue'
import { getCookie, setCookie } from './cookies'

const KEY = 'novashop_wishlist'

function load() {
  const data = getCookie(KEY)
  if (!Array.isArray(data)) return []
  return data.map(Number).filter(Boolean)
}

export const wishlistIds = ref(load())
export const wishlistCount = computed(() => wishlistIds.value.length)

function save() {
  setCookie(KEY, wishlistIds.value)
}

export function isWishlisted(id) {
  return wishlistIds.value.includes(Number(id))
}

export function toggleWishlist(id) {
  const numId = Number(id)
  if (!numId) return

  const index = wishlistIds.value.indexOf(numId)
  if (index >= 0) wishlistIds.value.splice(index, 1)
  else wishlistIds.value.push(numId)

  save()
}

export function clearWishlist() {
  wishlistIds.value = []
  save()
}
