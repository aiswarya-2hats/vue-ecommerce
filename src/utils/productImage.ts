import type { Product } from '../types/product'

export function primaryProductImage(product: Product | null | undefined): string {
  return product?.images?.[0] || product?.thumbnail || ''
}

export function hoverProductImage(product: Product | null | undefined): string {
  return product?.images?.[1] || ''
}
