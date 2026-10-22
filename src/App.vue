<script setup>
import { ref } from 'vue'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'

const searchQuery = ref('')
const cartCount = ref(0)

function addToCart(quantity) {
  cartCount.value += quantity
}
</script>
<template>
  <div class="shop">
    <Header v-model:search-query="searchQuery" :cart-count="cartCount" />
    <main class="main">
      <RouterView :search-query="searchQuery" @add-to-cart="addToCart" />
    </main>
    <Footer />
  </div>
</template>
