const BASE_URL = 'https://dummyjson.com'
import variantsData from '../data/productVariants.json'

export async function getProduct(id) {
  const response = await fetch(`${BASE_URL}/products/${id}`)
  if (!response.ok) return null
  return response.json()
}

export async function getCategories() {
  // get categories from API
  const response = await fetch(`${BASE_URL}/products/category-list`)
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

  const response = await fetch(url) // fetch products from URL
  const data = await response.json()
  return data.products || [] // return products
}

//get variants for a product
export function getVariantsForProduct(id) {
  return variantsData.find((p) => p.productId === Number(id))?.variants || []
}
