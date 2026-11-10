import { computed, toValue } from 'vue'
import placeholderImage from '../assets/images/placeholder-image.png'

export const PRODUCT_IMAGE_FALLBACK = placeholderImage

export function primaryProductImage(product) {
  const primary = product?.images?.[0] || product?.thumbnail || ''
  return primary || PRODUCT_IMAGE_FALLBACK
}

export function onProductImageError(event) {
  const img = event?.target
  if (!img || !(img instanceof HTMLImageElement)) return
  if (img.dataset.fallbackApplied === '1') return
  img.dataset.fallbackApplied = '1'
  img.removeAttribute('srcset')
  img.src = PRODUCT_IMAGE_FALLBACK
}

export function useProductImage(srcSource) {
  const src = computed(() => toValue(srcSource) || PRODUCT_IMAGE_FALLBACK)
  return { src, onError: onProductImageError }
}
