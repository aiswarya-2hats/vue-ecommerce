<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWishlist } from '../../composables/useWishlist'
import { useCart } from '../../composables/useCart'
import { getProducts } from '../../services/productService'
import ProductImage from '../ProductImage.vue'
import { primaryProductImage } from '../../utils/productImage'
import '../../assets/header.css'

const route = useRoute() //get information about the current page
const router = useRouter()
const { wishlistCount } = useWishlist()
const { cartCount } = useCart()
const searchText = ref(route.query.q || '')
const suggestions = ref([]) //list of products that match the search query
const isFocused = ref(false)
const hasSearched = ref(false)
const searchOpen = ref(false)
const searchInput = ref(null)

let searchTimer = null
let searchRequestId = 0

// Keep the search box in sync when the URL changes (e.g. browser back/forward)
watch(
  () => route.query.q,
  (q) => {
    searchText.value = q || ''
  },
)

// Live suggestions once the query has at least 3 characters
watch(searchText, (value) => {
  clearTimeout(searchTimer) //clear the timeout if it exists
  const q = value.trim()
  hasSearched.value = false

  if (q.length < 3) {
    //if the query is less than 3 characters, clear the suggestions.no api call
    searchRequestId++ // invalidate any in-flight request
    suggestions.value = []
    return
  }

  searchTimer = setTimeout(async () => {
    const requestId = ++searchRequestId
    const results = await getProducts({ q, limit: 0 })

    // ignore older responses so they cannot overwrite newer results
    if (requestId !== searchRequestId) return

    suggestions.value = results
    hasSearched.value = true
  }, 500)
})

function closeDropdown() {
  isFocused.value = false
}

function closeMobileSearch() {
  searchOpen.value = false
  closeDropdown()
}

async function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (!searchOpen.value) {
    closeDropdown()
    return
  }
  await nextTick()
  searchInput.value?.focus()
}

function onSearch(event) {
  event.preventDefault()
  closeMobileSearch()

  clearTimeout(searchTimer) // stop the pending suggestions call
  suggestions.value = []

  const q = searchText.value.trim()

  if (q) {
    router.push({ path: '/products', query: { q } })
  } else {
    const query = { ...route.query }
    delete query.q
    router.push({ path: '/products', query })
  }
}

function goToProduct(id) {
  closeMobileSearch()
  searchText.value = ''
  suggestions.value = []
  router.push(`/products/${id}`)
}

function onBlur() {
  // slight delay so a click on a suggestion can register first
  setTimeout(closeDropdown, 150)
}

function clearSearch() {
  searchText.value = ''
  suggestions.value = []
  hasSearched.value = false
  isFocused.value = true

  if (route.query.q) {
    const query = { ...route.query } // keep other query parameters
    delete query.q // remove the search query only
    router.push({ path: route.path, query }) // push the updated query to the current path
  }
}
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <input type="checkbox" id="menu-toggle" class="menu-toggle" hidden />
      <label for="menu-toggle" class="burger" aria-label="Open menu">
        <span></span>
        <span></span>
        <span></span>
      </label>

      <a href="/" class="logo">Nova<span>Shop</span></a>

      <div class="search-panel" :class="{ 'search-panel--open': searchOpen }">
        <div class="search-panel__inner">
          <form class="search" @submit="onSearch">
            <input
              ref="searchInput"
              v-model="searchText"
              type="text"
              class="search__input"
              placeholder="Search products..."
              aria-label="Search products"
              autocomplete="off"
              role="combobox"
              aria-autocomplete="list"
              :aria-expanded="isFocused && suggestions.length > 0"
              @focus="isFocused = true"
              @blur="onBlur"
            />
            <button
              v-if="searchText.trim()"
              type="button"
              class="search__btn"
              aria-label="Clear search"
              @click="clearSearch"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <button v-else type="submit" class="search__btn" aria-label="Search">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
                <path
                  d="M20 20l-3.5-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            <ul
              v-if="isFocused && (suggestions.length || hasSearched)"
              class="search__dropdown"
              role="listbox"
            >
              <li v-if="!suggestions.length" class="search__empty">No products found</li>
              <li
                v-for="product in suggestions"
                :key="product.id"
                class="search__option"
                role="option"
                @mousedown.prevent="goToProduct(product.id)"
              >
                <ProductImage
                  :src="primaryProductImage(product)"
                  :alt="product.title"
                  img-class="search__thumb"
                />
                <span class="search__meta">
                  <span class="search__title">{{ product.title }}</span>
                </span>
              </li>
              <li v-if="suggestions.length" class="search__view-all">
                <button type="button" @mousedown.prevent="onSearch($event)">
                  View all products →
                </button>
              </li>
            </ul>
          </form>
        </div>
      </div>

      <div class="header__actions">
        <button
          type="button"
          class="icon-btn search-toggle"
          :aria-label="searchOpen ? 'Close search' : 'Open search'"
          :aria-expanded="searchOpen"
          @click="toggleSearch"
        >
          <svg v-if="!searchOpen" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8" />
            <path
              d="M20 20l-3.5-3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <a href="#" class="icon-btn" aria-label="Account">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8" />
            <path
              d="M5.5 19.5c0-3.2 2.9-5.5 6.5-5.5s6.5 2.3 6.5 5.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </a>
        <router-link to="/wishlist" class="icon-btn" aria-label="Wishlist">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
            />
          </svg>
          <span v-if="wishlistCount" class="badge">{{ wishlistCount }}</span>
        </router-link>
        <router-link to="/cart" class="icon-btn" aria-label="Cart">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M6 6h15l-1.5 9H8L6 6zm0 0L5 3H2"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="9" cy="20" r="1.4" fill="currentColor" />
            <circle cx="18" cy="20" r="1.4" fill="currentColor" />
          </svg>
          <span v-if="cartCount" class="badge">{{ cartCount }}</span>
        </router-link>
      </div>

      <nav class="nav-desktop" aria-label="Categories">
        <router-link to="/">Home</router-link>
        <router-link to="/products">All Products</router-link>
      </nav>

      <label for="menu-toggle" class="nav-overlay" aria-hidden="true"></label>

      <aside class="nav-drawer" aria-label="Mobile categories">
        <div class="nav-drawer__head">
          <span class="logo">Nova<span>Shop</span></span>
          <label for="menu-toggle" class="nav-close" aria-label="Close menu">&times;</label>
        </div>
        <nav class="nav-drawer__links">
          <router-link to="/">Home</router-link>
          <router-link to="/products">All Products</router-link>
        </nav>
      </aside>
    </div>
  </header>
</template>
