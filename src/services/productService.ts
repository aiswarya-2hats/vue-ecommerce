import variantsData from '../data/productVariants.json'
import type { GetProductsParams, Product, ProductVariant, ProductVariantsEntry } from '../types/product'

const BASE_URL = import.meta.env.VITE_BASE_URL
const variants = variantsData as ProductVariantsEntry[]

export async function getProduct(id: number | string): Promise<Product | null> {
  const response = await fetch(`${BASE_URL}/products/${id}`)
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`Failed to load product (${response.status})`)
  }
  return response.json() as Promise<Product>
}

export async function getCategories(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/products/category-list`)
  if (!response.ok) {
    throw new Error(`Failed to load categories (${response.status})`)
  }
  return response.json() as Promise<string[]>
}

export async function getProducts({
  q = '',
  category = '',
  sortBy = 'price',
  order = 'asc',
  limit = 0,
}: GetProductsParams = {}): Promise<Product[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    sortBy,
    order,
  })

  let url: string

  if (q) {
    params.set('q', q)
    url = `${BASE_URL}/products/search?${params}`
  } else if (category) {
    url = `${BASE_URL}/products/category/${category}?${params}`
  } else {
    url = `${BASE_URL}/products?${params}`
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load products (${response.status})`)
  }
  const data = (await response.json()) as { products?: Product[] }
  const products = data.products || []

  if (q) {
    const needle = q.toLowerCase()
    return products.filter((p) => p.title?.toLowerCase().includes(needle))
  }

  return products
}

export function getVariantsForProduct(id: number | string): ProductVariant[] {
  return variants.find((p) => p.productId === Number(id))?.variants || []
}
