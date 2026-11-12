const BASE_URL = import.meta.env.VITE_BASE_URL
import variantsData from '../data/productVariants.json'

export async function getProduct(id) {
  const response = await fetch(`${BASE_URL}/products/${id}`)
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`Failed to load product (${response.status})`)
  }
  return response.json()
}

export async function getCategories() {
  // get categories from API
  const response = await fetch(`${BASE_URL}/products/category-list`)
  if (!response.ok) {
    throw new Error(`Failed to load categories (${response.status})`)
  }
  return response.json()
}

export async function getProducts({
  // get products from API
  q = '',
  category = '',
  sortBy = 'price',
  order = 'asc',
  limit = 0,
}) {
  const params = new URLSearchParams({
    // create URL search params
    limit: String(limit),
    sortBy,
    order,
  })

  let url // create URL

  if (q) {
    params.set('q', q) // if search query, add to URL
    url = `${BASE_URL}/products/search?${params}`
  } else if (category) {
    url = `${BASE_URL}/products/category/${category}?${params}` // if category, add to URL
  } else {
    url = `${BASE_URL}/products?${params}` // if no search or category, add to URL
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load products (${response.status})`)
  }
  const data = await response.json()
  const products = data.products || []

  if (q) {
    const needle = q.toLowerCase() // convert search query to lowercase
    return products.filter((p) => p.title?.toLowerCase().includes(needle)) // filter products by title
  }

  return products
}

//get variants for a product
export function getVariantsForProduct(id) {
  return variantsData.find((p) => p.productId === Number(id))?.variants || []
}
