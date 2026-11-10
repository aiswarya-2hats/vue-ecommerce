<script setup>
import { ref, watch, computed } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import RequestError from '../components/RequestError.vue'
import { useWishlist } from '../composables/useWishlist'
import { getProduct, getVariantsForProduct } from '../services/productService'
import { primaryProductImage } from '../utils/productImage'
import '../assets/wishlist.css'

const { wishlistItems, wishlistCount, clear } = useWishlist()
const productsById = ref({})
const loading = ref(wishlistItems.value.length > 0)
const error = ref(null)

function lineKey(item) {
  return `${item.id}-${item.variantId || 'default'}`
}

const items = computed(() =>
  wishlistItems.value
    .map((entry) => {
      const product = productsById.value[entry.id]
      if (!product) return null

      const variants = getVariantsForProduct(product.id)
      const variant = entry.variantId
        ? variants.find((v) => String(v.id) === String(entry.variantId))
        : null

      return {
        key: lineKey(entry),
        product,
        variants,
        preferredVariantId: entry.variantId,
        image: entry.image || variant?.image || primaryProductImage(product),
        price: entry.price ?? variant?.price ?? product.price,
        stock: variant?.stock ?? product.stock,
      }
    })
    .filter(Boolean),
)

async function fetchProducts() {
  const ids = [...new Set(wishlistItems.value.map((item) => item.id))]
  const missing = ids.filter((id) => !productsById.value[id])

  if (!missing.length) {
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const results = await Promise.all(missing.map((id) => getProduct(id)))
    const next = { ...productsById.value }
    results.forEach((product, i) => {
      if (product) next[missing[i]] = product
    })
    productsById.value = next
  } catch (err) {
    error.value = 'We couldn’t load your wishlist. Check your connection and try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(wishlistItems, fetchProducts, { immediate: true, deep: true })
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
      <div v-for="item in wishlistItems" :key="lineKey(item)" class="skeleton-card">
        <div class="skeleton-card__image"></div>
        <div class="skeleton-card__line"></div>
        <div class="skeleton-card__line short"></div>
      </div>
    </div>
    <template v-else-if="!wishlistCount">
      <p class="wishlist-page__empty">Your wishlist is empty.</p>
      <router-link to="/products" class="btn btn--primary">Continue shopping</router-link>
    </template>
    <RequestError v-else-if="error" :message="error" @retry="fetchProducts" />

    <template v-else>
      <div class="wishlist-page__grid">
        <ProductCard
          v-for="item in items"
          :key="item.key"
          :id="item.product.id"
          :image="item.image"
          :title="item.product.title"
          :stock="item.stock"
          :rating="item.product.rating"
          :price="item.price"
          :discount="item.product.discountPercentage"
          :brand="item.product.brand"
          :variants="item.variants"
          :preferred-variant-id="item.preferredVariantId"
          removable
        />
      </div>

      <div class="wishlist-page__actions">
        <router-link to="/products" class="btn btn--secondary">Continue shopping</router-link>
      </div>
    </template>
  </section>
</template>
