<script setup>
import { ref } from 'vue'
import '../assets/header.css'

const isMenuOpen = ref(false)
const searchQuery = defineModel('searchQuery')

defineProps({
  cartCount: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <button
        type="button"
        class="burger"
        :class="{ 'burger--open': isMenuOpen }"
        aria-label="Open menu"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <a href="/" class="logo">Nova<span>Shop</span></a>

      <form class="search" action="#" method="get" @submit.prevent>
        <input
          type="search"
          class="search__input"
          placeholder="Search products..."
          aria-label="Search products"
          v-model="searchQuery"
        />
        <button type="submit" class="search__btn" aria-label="Search">
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
      </form>

      <div class="header__actions">
        <a href="#" class="icon-btn" aria-label="Wishlist">
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
          <span class="badge">3</span>
        </a>
        <a href="#" class="icon-btn" aria-label="Cart">
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
          <span class="badge">{{ cartCount }}</span>
        </a>
      </div>

      <nav class="nav-desktop" aria-label="Categories">
        <router-link to="/">Home</router-link>
        <router-link to="/products">All Products</router-link>
      </nav>

      <div
        v-if="isMenuOpen"
        class="nav-overlay"
        aria-hidden="true"
        @click="isMenuOpen = false"
      ></div>

      <aside v-if="isMenuOpen" class="nav-drawer" aria-label="Mobile categories">
        <div class="nav-drawer__head">
          <span class="logo">Nova<span>Shop</span></span>
          <button
            type="button"
            class="nav-close"
            aria-label="Close menu"
            @click="isMenuOpen = false"
          >
            &times;
          </button>
        </div>
        <nav class="nav-drawer__links">
          <router-link to="/" @click="isMenuOpen = false">Home</router-link>
          <router-link to="/products" @click="isMenuOpen = false">All Products</router-link>
        </nav>
      </aside>
    </div>
  </header>
</template>
