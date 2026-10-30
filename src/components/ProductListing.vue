<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Filter from './Filter.vue'
import ProductCard from './ProductCard.vue'
import ProductSort from './ProductSort.vue'
import { getProducts, getCategories } from '../services/productService'
import '../assets/productlisting.css'

const route = useRoute()
const router = useRouter()

const products = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)

// Read filter values from the URL
const searchQuery = computed(() => route.query.q || '') // get search query from URL
const selectedCategory = computed(() => (route.query.category ? String(route.query.category) : ''))
const categoryHeading = computed(() => {
  if (!selectedCategory.value) return 'All products'
  return selectedCategory.value
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})
const selectedBrands = computed(
  () =>
    // get brands from URL
    route.query.brand ? String(route.query.brand).split(',').filter(Boolean) : [], // if brands are in the URL, split them by comma and filter out empty brands
)
const selectedRating = computed(() => (route.query.rating ? Number(route.query.rating) : null)) // get rating from URL
const inStockOnly = computed(() => route.query.inStock === '1' || route.query.inStock === 'true')
const selectedSort = computed(() => route.query.sort || 'price-asc') // get sort from URL
const minPrice = computed(() =>
  route.query.minPrice != null && route.query.minPrice !== '' ? Number(route.query.minPrice) : 0,
)
const maxPrice = computed(() =>
  route.query.maxPrice != null && route.query.maxPrice !== '' ? Number(route.query.maxPrice) : 2500,
)

const sortMap = {
  'price-asc': { sortBy: 'price', order: 'asc' },
  'price-desc': { sortBy: 'price', order: 'desc' },
  name: { sortBy: 'title', order: 'asc' },
  'best-selling': { sortBy: 'rating', order: 'desc' },
}

const availableBrands = computed(() => {
  // get available brands from products
  const brands = products.value.map((p) => p.brand).filter(Boolean) // map products to brands and filter out empty brands
  return [...new Set(brands)].sort().slice(0, 7) // return unique brands and sort them
})

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchBrand =
      selectedBrands.value.length === 0 || selectedBrands.value.includes(product.brand)
    const matchRating = !selectedRating.value || product.rating >= selectedRating.value // if rating is not selected, or product rating is greater than or equal to selected rating
    const matchPrice = product.price >= minPrice.value && product.price <= maxPrice.value
    const matchStock = !inStockOnly.value || Number(product.stock) > 0
    return matchBrand && matchRating && matchPrice && matchStock
  })
})

const activeFilters = computed(() => {
  const chips = [] // create a new array to store the active filters

  if (searchQuery.value) {
    chips.push({ key: 'q', label: `“${searchQuery.value}”`, type: 'q' }) // add the search query filter to the array
  }
  if (selectedCategory.value) {
    chips.push({
      // add the category filter to the array
      key: 'category',
      label: selectedCategory.value,
      type: 'category',
    })
  }
  selectedBrands.value.forEach((brand) => {
    chips.push({ key: `brand-${brand}`, label: brand, type: 'brand', value: brand })
  })
  if (selectedRating.value) {
    chips.push({
      // add the rating filter to the array
      key: 'rating',
      label: `${selectedRating.value}★ & up`,
      type: 'rating',
    })
  }
  if (inStockOnly.value) {
    chips.push({ key: 'inStock', label: 'In stock only', type: 'inStock' })
  }
  if (minPrice.value > 0 || maxPrice.value < 2500) {
    chips.push({
      // add the price filter to the array
      key: 'price',
      label: `$${minPrice.value} – $${maxPrice.value}`,
      type: 'price',
    })
  }

  return chips // return the array of active filters to display
})

const PAGE_SIZE = 12
const page = ref(1)

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / PAGE_SIZE) || 1) // calculate the total number of pages

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredProducts.value.slice(start, start + PAGE_SIZE)
})

watch(filteredProducts, () => {
  page.value = 1
})

// Keep a local copy so rapid filter updates don't overwrite each other
// (route.query can lag behind router.replace)
const queryDraft = ref({ ...route.query })

watch(
  () => route.query,
  (query) => {
    queryDraft.value = { ...query }
  },
)

function updateQuery(updates) {
  // update the query string in the URL after a filter is applied or removed
  const query = { ...queryDraft.value, ...updates }

  Object.keys(query).forEach((key) => {
    if (query[key] === '' || query[key] == null || query[key] === false) {
      delete query[key]
    }
  })

  queryDraft.value = query
  router.replace({ query })
}

// function setCategory(category) {
//   updateQuery({ category: category || '' })
// }

function setCategory(category) {
  updateQuery({
    category: category || '',
    brand: '', // remove old brands
  })
}

function setBrands(list) {
  // set brands in URL
  updateQuery({ brand: list.length ? list.join(',') : '' }) // if list is not empty, join the brands with a comma
}

function setRating(value) {
  // set rating in URL
  updateQuery({ rating: value || '' }) // if value is not empty, set the rating in the URL
}

function setInStock(value) {
  updateQuery({ inStock: value ? '1' : '' })
}

function setPrice({ min, max }) {
  // set price in URL
  updateQuery({
    minPrice: min === 0 ? '' : min,
    maxPrice: max === 2500 ? '' : max,
  })
}

function setSort(value) {
  updateQuery({ sort: value })
}

function removeFilter(chip) {
  //remove individual filter by resetting the query string in the URL
  if (chip.type === 'q') updateQuery({ q: '' })
  else if (chip.type === 'category') setCategory('')
  else if (chip.type === 'brand') setBrands(selectedBrands.value.filter((b) => b !== chip.value))
  else if (chip.type === 'rating') setRating(null)
  else if (chip.type === 'inStock') setInStock(false)
  else if (chip.type === 'price') setPrice({ min: 0, max: 2500 })
}

function clearAllFilters() {
  // clear all filters by resetting the query string in the URL
  updateQuery({
    q: '',
    category: '',
    brand: '',
    rating: '',
    inStock: '',
    minPrice: '',
    maxPrice: '',
  })
}

async function fetchCategories() {
  try {
    const data = await getCategories()
    categories.value = data.slice(0, 7)
  } catch (err) {
    console.error(err)
  }
}

async function fetchProducts() {
  loading.value = true
  error.value = null

  try {
    const { sortBy, order } = sortMap[selectedSort.value] || sortMap['price-asc']

    let list = await getProducts({
      q: searchQuery.value,
      // API category endpoint can't combine with search — apply category after search
      category: searchQuery.value ? '' : selectedCategory.value,
      sortBy,
      order,
      limit: 0,
    })

    if (searchQuery.value && selectedCategory.value) {
      list = list.filter((p) => p.category === selectedCategory.value)
    }

    products.value = list
  } catch (err) {
    error.value = 'Failed to load products'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(
  () => [route.query.q, route.query.category, route.query.sort],
  () => {
    fetchProducts()
  },
  { immediate: true },
)

fetchCategories()
</script>

<template>
  <div class="layout">
    <Filter
      :categories="categories"
      :brands="availableBrands"
      :selected-category="selectedCategory"
      :selected-brands="selectedBrands"
      :selected-rating="selectedRating"
      :in-stock-only="inStockOnly"
      :min-price="minPrice"
      :max-price="maxPrice"
      @update:category="setCategory"
      @update:brands="setBrands"
      @update:rating="setRating"
      @update:inStock="setInStock"
      @update:price="setPrice"
    />
    <section class="listing">
      <ProductSort :sort="selectedSort" :heading="categoryHeading" @update:sort="setSort" />

      <div v-if="activeFilters.length" class="filter-chips" aria-label="Active filters">
        <span v-for="chip in activeFilters" :key="chip.key" class="filter-chip">
          {{ chip.label }}
          <button
            type="button"
            class="filter-chip__close"
            :aria-label="`Remove ${chip.label} filter`"
            @click="removeFilter(chip)"
          >
            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </span>
        <button type="button" class="filter-chips__clear" @click="clearAllFilters">
          Clear all
        </button>
      </div>

      <div v-if="loading" class="products">
        <div v-for="n in 8" :key="n" class="skeleton-card">
          <div class="skeleton-card__image"></div>
          <div class="skeleton-card__line"></div>
          <div class="skeleton-card__line short"></div>
        </div>
      </div>
      <p v-else-if="error">{{ error }}</p>
      <p v-else-if="filteredProducts.length === 0">No products found.</p>

      <template v-else>
        <div class="products">
          <ProductCard
            v-for="product in paginatedProducts"
            :key="product.id"
            :id="product.id"
            :image="product.thumbnail"
            :title="product.title"
            :stock="product.stock"
            :rating="product.rating"
            :price="product.price"
          />
        </div>
        <div v-if="totalPages > 1" class="pagination">
          <button type="button" :disabled="page === 1" @click="page--">Prev</button>
          <span>{{ page }} / {{ totalPages }}</span>
          <button type="button" :disabled="page === totalPages" @click="page++">Next</button>
        </div>
      </template>
    </section>
  </div>
</template>
