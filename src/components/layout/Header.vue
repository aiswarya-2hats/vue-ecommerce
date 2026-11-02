<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWishlist } from '../../composables/useWishlist'
import { useCart } from '../../composables/useCart'
import { getProducts } from '../../services/productService'
import '../../assets/header.css'

const route = useRoute()
const router = useRouter()
const { wishlistCount } = useWishlist()
const { cartCount } = useCart()
const searchText = ref(route.query.q || '')
const suggestions = ref([])
const isFocused = ref(false)
const activeIndex = ref(-1)
const hasSearched = ref(false)

let searchTimer = null

// Keep the search box in sync when the URL changes (e.g. browser back/forward)
watch(
  () => route.query.q,
  (q) => {
    searchText.value = q || ''
  },
)

// Live suggestions once the query has at least 3 characters
watch(searchText, (value) => {
  clearTimeout(searchTimer)
  const q = value.trim()
  activeIndex.value = -1
  hasSearched.value = false

  if (q.length < 3) {
    suggestions.value = []
    return
  }

  searchTimer = setTimeout(async () => {
    suggestions.value = await getProducts({ q, limit: 6 })
    activeIndex.value = -1
    hasSearched.value = true
  }, 250)
})

function closeDropdown() {
  isFocused.value = false
  activeIndex.value = -1
}

function onSearch(event) {
  event.preventDefault() //prevent page fully reloading when search is submitted

  // Enter with a highlighted suggestion → open that product
  if (activeIndex.value >= 0 && suggestions.value[activeIndex.value]) {
    goToProduct(suggestions.value[activeIndex.value].id)
    return
  }

  closeDropdown()
  const q = searchText.value.trim() // remove spaces at strat/end
  const query = { ...route.query } //keep other url params

  if (q) {
    query.q = q // if we type something , put in in URL as q
  } else {
    delete query.q //if empty remove search from URL
  }

  router.push({ path: '/products', query }) // goto /products with that search query
}

function goToProduct(id) {
  closeDropdown()
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
  activeIndex.value = -1
  hasSearched.value = false
  isFocused.value = true
}

function onSearchKeydown(event) {
  if (!suggestions.value.length) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    isFocused.value = true
    activeIndex.value = (activeIndex.value + 1) % suggestions.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    isFocused.value = true
    activeIndex.value =
      activeIndex.value <= 0 ? suggestions.value.length - 1 : activeIndex.value - 1
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closeDropdown()
    suggestions.value = []
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

      <form class="search" @submit="onSearch">
        <input
          v-model="searchText"
          type="text"
          class="search__input"
          placeholder="Search products..."
          aria-label="Search products"
          autocomplete="off"
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="isFocused && suggestions.length > 0"
          :aria-activedescendant="
            activeIndex >= 0 ? `search-option-${suggestions[activeIndex]?.id}` : undefined
          "
          @focus="isFocused = true"
          @blur="onBlur"
          @keydown="onSearchKeydown"
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
            v-for="(product, index) in suggestions"
            :id="`search-option-${product.id}`"
            :key="product.id"
            class="search__option"
            :class="{ 'search__option--active': index === activeIndex }"
            role="option"
            :aria-selected="index === activeIndex"
            @mousedown.prevent="goToProduct(product.id)"
            @mouseenter="activeIndex = index"
          >
            <img :src="product.thumbnail" :alt="product.title" class="search__thumb" />
            <span class="search__meta">
              <span class="search__title">{{ product.title }}</span>
              <span class="search__price">${{ product.price }}</span>
            </span>
          </li>
        </ul>
      </form>

      <div class="header__actions">
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
        <span class="icon-btn" aria-label="Wishlist">
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
        </span>
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
