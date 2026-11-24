import type { Product } from '../types/product'

export function primaryProductImage(product: Product | null | undefined): string {
  return product?.thumbnail || product?.images?.[0] || ''
}

export function hoverProductImage(product: Product | null | undefined): string {
  return product?.images?.[1] || ''
}
