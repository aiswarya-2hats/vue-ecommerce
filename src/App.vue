<script setup>
import { ref, watch } from 'vue'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'

const searchQuery = ref('')
const cartCount = ref(Number(localStorage.getItem('cartCount')) || 0)
const wishlistCount = ref(Number(localStorage.getItem('wishlistCount')) || 0)

watch(cartCount, (newVal) => {
  localStorage.setItem('cartCount', newVal)
})
watch(wishlistCount, (newVal) => {
  localStorage.setItem('wishlistCount', newVal)
})

function addToCart(quantity) {
  cartCount.value += quantity
}

function toggleWishlist(delta) {
  wishlistCount.value += delta
}
</script>
<template>
  <div class="shop">
    <Header
      v-model:search-query="searchQuery"
      :cart-count="cartCount"
      :wishlist-count="wishlistCount"
    />
    <main class="main">
      <RouterView
        :search-query="searchQuery"
        @add-to-cart="addToCart"
        @toggle-wishlist="toggleWishlist"
      />
    </main>
    <Footer />
  </div>
</template>
