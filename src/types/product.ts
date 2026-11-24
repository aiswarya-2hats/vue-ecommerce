export interface ProductReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail?: string
}

export interface ProductMeta {
  createdAt?: string
  updatedAt?: string
  barcode?: string
  qrCode?: string
}

export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand?: string
  sku?: string
  warrantyInformation?: string
  shippingInformation?: string
  thumbnail: string
  images: string[]
  reviews?: ProductReview[]
  meta?: ProductMeta
  tags?: string[]
}

export type VariantOptions = Record<string, string>

export interface ProductVariant {
  id: string
  sku: string
  options: VariantOptions
  /** Hex colors for option keys that should render as swatches, e.g. `{ color: "#1b2a4a" }` */
  swatches?: Record<string, string>
  price: number
  stock: number
  image?: string
}

export interface ProductVariantsEntry {
  productId: number
  title: string
  variants: ProductVariant[]
}

export interface CartItem {
  id: number
  qty: number
  variantId: string | null
  options: VariantOptions | null
  image: string | null
  price: number | null
}

export interface WishlistItem {
  id: number
  variantId: string | null
  options: VariantOptions | null
  image: string | null
  price: number | null
}

export interface VariantSelection {
  id?: string | number | null
  options?: VariantOptions | null
  image?: string | null
  price?: number | null
  stock?: number | null
}

export interface GetProductsParams {
  q?: string
  category?: string
  sortBy?: string
  order?: 'asc' | 'desc' | string
  limit?: number
}
