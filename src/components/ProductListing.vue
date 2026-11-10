<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Filter from './Filter.vue'
import ProductCard from './ProductCard.vue'
import ProductSort from './ProductSort.vue'
import RequestError from './RequestError.vue'
import { getProducts, getCategories, getVariantsForProduct } from '../services/productService'
import { primaryProductImage } from '../utils/productImage'
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
const selectedSort = computed(() => route.query.sort || 'featured') // get sort from URL
const minPrice = computed(() =>
  route.query.minPrice != null && route.query.minPrice !== '' ? Number(route.query.minPrice) : 0,
)
const maxPrice = computed(() =>
  route.query.maxPrice != null && route.query.maxPrice !== '' ? Number(route.query.maxPrice) : 2500,
)

// Predictable Featured order (lower index = higher priority)
const FEATURED_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const featuredRank = new Map(FEATURED_IDS.map((id, index) => [id, index]))

// Unrated / invalid → -1 (sort last; fail "X★ & up" filters)
function ratingOf(product) {
  const n = Number(product.rating)
  return product.rating == null || Number.isNaN(n) ? -1 : n
}

const availableBrands = computed(() => {
  // get available brands from products
  const brands = products.value.map((p) => p.brand).filter(Boolean) // map products to brands and filter out empty brands
  return [...new Set(brands)].sort().slice(0, 7) // return unique brands and sort them
})

// Search (from fetch) → Filter → Sort → Paginate
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchBrand =
      selectedBrands.value.length === 0 || selectedBrands.value.includes(product.brand) // check if brands are not selected, or product brand is included in selected brands
    // Unrated products are excluded when a minimum rating filter is active
    const matchRating = !selectedRating.value || ratingOf(product) >= selectedRating.value
    const matchPrice = product.price >= minPrice.value && product.price <= maxPrice.value
    const matchStock = !inStockOnly.value || Number(product.stock) > 0
    return matchBrand && matchRating && matchPrice && matchStock
  })
})

const sortedProducts = computed(() => {
  const list = [...filteredProducts.value]
  const sort = selectedSort.value

  if (sort === 'featured') {
    return list.sort((a, b) => {
      const ra = featuredRank.get(a.id) ?? Infinity
      const rb = featuredRank.get(b.id) ?? Infinity
      return ra - rb || a.id - b.id
    })
  }
  if (sort === 'price-asc') return list.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') return list.sort((a, b) => b.price - a.price)
  if (sort === 'name') return list.sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'rating-desc') {
    return list.sort((a, b) => ratingOf(b) - ratingOf(a) || a.id - b.id)
  }
  if (sort === 'best-selling') {
    return list.sort((a, b) => ratingOf(b) - ratingOf(a) || a.id - b.id)
  }
  if (sort === 'discount-desc') {
    return list.sort(
      (a, b) =>
        (Number(b.discountPercentage) || 0) - (Number(a.discountPercentage) || 0) || a.id - b.id,
    )
  }
  if (sort === 'newest') {
    return list.sort((a, b) => {
      const da = Date.parse(a.meta?.createdAt) || 0
      const db = Date.parse(b.meta?.createdAt) || 0
      return db - da || a.id - b.id // newest first; missing dates last
    })
  }

  return list
})

const activeFilters = computed(() => {
  const chips = [] // create a new array to store the active filters

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

const totalPages = computed(() => Math.ceil(sortedProducts.value.length / PAGE_SIZE) || 1) // calculate the total number of pages

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return sortedProducts.value.slice(start, start + PAGE_SIZE)
})

// Build: 1 2 3 4 5 … 12  (or 1 … 4 5 6 … 12)
const pageItems = computed(() => {
  const total = totalPages.value
  const current = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const set = new Set([1, total, current, current - 1, current + 1])
  if (current <= 3) [2, 3, 4, 5].forEach((n) => set.add(n))
  if (current >= total - 2) [total - 1, total - 2, total - 3, total - 4].forEach((n) => set.add(n))

  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const items = []
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) items.push('…')
    items.push(nums[i])
  }
  return items
})

function goToPage(n) {
  if (n >= 1 && n <= totalPages.value) page.value = n
}

watch(sortedProducts, () => {
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
  if (chip.type === 'category') setCategory('')
  else if (chip.type === 'brand') setBrands(selectedBrands.value.filter((b) => b !== chip.value))
  else if (chip.type === 'rating') setRating(null)
  else if (chip.type === 'inStock') setInStock(false)
  else if (chip.type === 'price') setPrice({ min: 0, max: 2500 })
}

function clearAllFilters() {
  // clear filter chips only — search stays in the header / URL
  updateQuery({
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
    categories.value = await getCategories()
  } catch (err) {
    console.error(err)
  }
}

async function fetchProducts() {
  loading.value = true
  error.value = null

  try {
    // Fetch only — sort is applied client-side after filters
    let list = await getProducts({
      q: searchQuery.value,
      // API category endpoint can't combine with search — apply category after search
      category: searchQuery.value ? '' : selectedCategory.value,
      limit: 0,
    })

    if (searchQuery.value && selectedCategory.value) {
      list = list.filter((p) => p.category === selectedCategory.value)
    }

    products.value = list
  } catch (err) {
    error.value = 'We couldn’t load products. Check your connection and try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(
  () => [route.query.q, route.query.category],
  () => {
    fetchProducts()
  },
  { immediate: true },
)

fetchCategories()
</script>

<template>
  <div class="listing-header">
    <h1 class="listing-header__title">{{ categoryHeading }}</h1>
    <p class="listing-header__description">
      Discover a wide range of quality products at NovaShop. Explore our latest collections across
      beauty, fragrances, furniture, and groceries. Find the perfect products with easy search,
      smart filters, and sorting options, all in one place.
    </p>
  </div>
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
      <div class="listing__controls">
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

        <ProductSort
          :sort="selectedSort"
          :heading="categoryHeading"
          :count="filteredProducts.length"
          @update:sort="setSort"
        />
      </div>

      <div v-if="loading" class="products" aria-busy="true" aria-label="Loading products">
        <div v-for="n in 8" :key="n" class="skeleton-card">
          <div class="skeleton-card__image"></div>
          <div class="skeleton-card__body">
            <div class="skeleton-card__line short"></div>
            <div class="skeleton-card__line title"></div>
            <div class="skeleton-card__line short"></div>
            <div class="skeleton-card__line price"></div>
            <div class="skeleton-card__actions">
              <div class="skeleton-card__btn"></div>
              <div class="skeleton-card__btn"></div>
              <div class="skeleton-card__btn"></div>
            </div>
          </div>
        </div>
      </div>
      <RequestError v-else-if="error" :message="error" @retry="fetchProducts" />
      <p v-else-if="filteredProducts.length === 0">No products found.</p>

      <template v-else>
        <div class="products">
          <ProductCard
            v-for="product in paginatedProducts"
            :key="product.id"
            :id="product.id"
            :image="primaryProductImage(product)"
            :title="product.title"
            :stock="product.stock"
            :rating="product.rating"
            :price="product.price"
            :discount="product.discountPercentage"
            :brand="product.brand"
            :variants="getVariantsForProduct(product.id)"
          />
        </div>
        <nav v-if="totalPages > 1" class="pagination" aria-label="Pagination">
          <button
            type="button"
            class="pagination__nav"
            :disabled="page === 1"
            aria-label="Previous page"
            @click="goToPage(page - 1)"
          >
            Prev
          </button>
          <template v-for="(item, i) in pageItems" :key="`${item}-${i}`">
            <span v-if="item === '…'" class="pagination__ellipsis" aria-hidden="true">…</span>
            <button
              v-else
              type="button"
              class="pagination__page"
              :class="{ 'is-active': item === page }"
              :aria-current="item === page ? 'page' : undefined"
              :aria-label="`Page ${item}`"
              @click="goToPage(item)"
            >
              {{ item }}
            </button>
          </template>
          <button
            type="button"
            class="pagination__nav"
            :disabled="page === totalPages"
            aria-label="Next page"
            @click="goToPage(page + 1)"
          >
            Next
          </button>
        </nav>
      </template>
    </section>
  </div>
</template>
