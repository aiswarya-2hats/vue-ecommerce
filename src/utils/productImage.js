export function primaryProductImage(product) {
  return product?.images?.[0] || product?.thumbnail || ''
}

export function hoverProductImage(product) {
  return product?.images?.[1] || ''
}
