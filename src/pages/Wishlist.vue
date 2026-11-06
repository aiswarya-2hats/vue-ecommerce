<script setup>
import { ref, watch, computed } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import { useWishlist } from '../composables/useWishlist'
import { getProduct, getVariantsForProduct } from '../services/productService'
import '../assets/wishlist.css'

const { wishlistIds, wishlistCount, clear } = useWishlist()
const productsById = ref({})
const loading = ref(wishlistIds.value.length > 0)

const products = computed(() =>
  wishlistIds.value.map((id) => productsById.value[id]).filter(Boolean),
)

async function loadProducts() {
  const ids = wishlistIds.value // get the wishlistIds
  const missing = ids.filter((id) => !productsById.value[id]) // filter the ids that are not in the productsById

  if (!missing.length) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const results = await Promise.all(missing.map((id) => getProduct(id)))
    const next = { ...productsById.value }
    results.forEach((product, i) => {
      if (product) next[missing[i]] = product
    })
    productsById.value = next
  } finally {
    loading.value = false
  }
}

watch(wishlistIds, loadProducts, { immediate: true, deep: true }) // watch for changes in the wishlistIds and load the products
</script>

<template>
  <section class="wishlist-page">
    <div class="wishlist-page__head">
      <div>
        <h1>Wishlist</h1>
        <p v-if="wishlistCount" class="wishlist-page__count">
          {{ wishlistCount }} {{ wishlistCount === 1 ? 'item' : 'items' }}
        </p>
      </div>

      <button v-if="wishlistCount" type="button" class="wishlist-page__clear" @click="clear">
        Clear wishlist
      </button>
    </div>

    <div v-if="loading" class="wishlist-page__grid">
      <div v-for="id in wishlistIds" :key="id" class="skeleton-card">
        <div class="skeleton-card__image"></div>
        <div class="skeleton-card__line"></div>
        <div class="skeleton-card__line short"></div>
      </div>
    </div>
    <template v-else-if="!wishlistCount">
      <p class="wishlist-page__empty">Your wishlist is empty.</p>
      <router-link to="/products" class="btn btn--primary">Continue shopping</router-link>
    </template>

    <template v-else>
      <div class="wishlist-page__grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :id="product.id"
          :image="product.thumbnail"
          :title="product.title"
          :stock="product.stock"
          :rating="product.rating"
          :price="product.price"
          :discount="product.discountPercentage"
          :brand="product.brand"
          :variants="getVariantsForProduct(product.id)"
        />
      </div>

      <div class="wishlist-page__actions">
        <router-link to="/products" class="btn btn--secondary">Continue shopping</router-link>
      </div>
    </template>
  </section>
</template>
