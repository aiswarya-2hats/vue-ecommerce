<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProduct } from '../services/productService'
import { useCart } from '../composables/useCart'
import { useWishlist } from '../composables/useWishlist'
import '../assets/productdetail.css'

const route = useRoute()
const { add: addToCart, getQty } = useCart()
const { isWishlisted, toggle: toggleWishlist } = useWishlist()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const activeImage = ref('')
const qty = ref(1)

const wishlisted = computed(() => product.value && isWishlisted(product.value.id))

const stockLeft = computed(() => {
  if (!product.value) return 0
  return Math.max(0, Number(product.value.stock) - getQty(product.value.id))
})

const canAdd = computed(() => stockLeft.value > 0 && qty.value <= stockLeft.value)

const hasDiscount = computed(() => Number(product.value?.discountPercentage) > 0)

const originalPrice = computed(() => {
  if (!product.value) return 0
  const pct = Number(product.value.discountPercentage)
  if (pct <= 0) return Number(product.value.price)
  return Number(product.value.price) / (1 - pct / 100)
})

const filledStars = computed(() => {
  const count = Math.round(Number(product.value?.rating)) || 0
  const filled = Math.min(5, Math.max(0, count))
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
})

const images = computed(() => {
  if (!product.value) return []
  const list = product.value.images?.length
    ? product.value.images
    : [product.value.thumbnail].filter(Boolean)
  return [...new Set(list)]
})

async function loadProduct(id) {
  loading.value = true
  error.value = null
  product.value = null
  qty.value = 1
  activeImage.value = ''

  try {
    const data = await getProduct(id)
    if (!data) {
      error.value = 'Product not found.'
      return
    }
    product.value = data
    activeImage.value = data.thumbnail || data.images?.[0] || ''
  } catch {
    error.value = 'Could not load this product.'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (id) loadProduct(id)
  },
  { immediate: true },
)

function selectImage(src) {
  activeImage.value = src
}

function decreaseQty() {
  if (qty.value > 1) qty.value -= 1
}

function increaseQty() {
  if (qty.value < stockLeft.value) qty.value += 1
}

function onAddToCart() {
  if (!canAdd.value || !product.value) return
  addToCart(product.value.id, qty.value)
}

function onToggleWish() {
  if (!product.value) return
  toggleWishlist(product.value.id)
}
</script>

<template>
  <section class="detail-page">
    <router-link to="/products" class="detail-page__back">← Back to products</router-link>

    <p v-if="loading" class="detail-page__status">Loading…</p>
    <p v-else-if="error" class="detail-page__status detail-page__status--error">{{ error }}</p>

    <article v-else-if="product" class="detail">
      <div class="detail__gallery">
        <div class="detail__main-image">
          <img :src="activeImage" :alt="product.title" />
          <button
            type="button"
            class="detail__wish"
            :class="{ 'detail__wish--active': wishlisted }"
            :aria-label="wishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
            :aria-pressed="wishlisted"
            @click="onToggleWish"
          >
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
          </button>
        </div>

        <div v-if="images.length > 1" class="detail__thumbs" role="list">
          <button
            v-for="(src, i) in images"
            :key="src + i"
            type="button"
            class="detail__thumb"
            :class="{ 'detail__thumb--active': activeImage === src }"
            :aria-label="`View image ${i + 1}`"
            @click="selectImage(src)"
          >
            <img :src="src" :alt="`${product.title} ${i + 1}`" />
          </button>
        </div>
      </div>

      <div class="detail__info">
        <p v-if="product.brand" class="detail__brand">{{ product.brand }}</p>
        <h1 class="detail__title">{{ product.title }}</h1>

        <div class="detail__meta">
          <span class="detail__stars" aria-hidden="true">{{ filledStars }}</span>
          <span>({{ product.rating }})</span>
          <span v-if="product.category" class="detail__category">{{ product.category }}</span>
        </div>

        <div class="detail__price-row">
          <span class="detail__price">${{ Number(product.price).toFixed(2) }}</span>
          <template v-if="hasDiscount">
            <s class="detail__original">${{ originalPrice.toFixed(2) }}</s>
            <span class="detail__discount"
              >{{ Number(product.discountPercentage).toFixed(0) }}% off</span
            >
          </template>
        </div>

        <p v-if="stockLeft > 0" class="detail__stock">In stock · {{ stockLeft }} available</p>
        <p v-else class="detail__stock detail__stock--out">Out of stock</p>

        <p v-if="product.description" class="detail__desc">{{ product.description }}</p>

        <ul
          v-if="product.sku || product.warrantyInformation || product.shippingInformation"
          class="detail__specs"
        >
          <li v-if="product.sku">
            <span class="detail__spec-label">SKU</span>
            <span class="detail__spec-value">{{ product.sku }}</span>
          </li>
          <li v-if="product.warrantyInformation">
            <span class="detail__spec-label">Warranty</span>
            <span class="detail__spec-value">{{ product.warrantyInformation }}</span>
          </li>
          <li v-if="product.shippingInformation">
            <span class="detail__spec-label">Shipping</span>
            <span class="detail__spec-value">{{ product.shippingInformation }}</span>
          </li>
        </ul>

        <div class="detail__actions">
          <div class="detail__qty">
            <button
              type="button"
              class="qty__btn"
              aria-label="Decrease quantity"
              :disabled="qty <= 1"
              @click="decreaseQty"
            >
              −
            </button>
            <span class="qty__value">{{ qty }}</span>
            <button
              type="button"
              class="qty__btn"
              aria-label="Increase quantity"
              :disabled="qty >= stockLeft"
              @click="increaseQty"
            >
              +
            </button>
          </div>

          <div class="detail__btns">
            <button type="button" class="btn btn--primary" :disabled="!canAdd">Buy Now</button>
            <button
              type="button"
              class="btn btn--secondary"
              :disabled="!canAdd"
              @click="onAddToCart"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
