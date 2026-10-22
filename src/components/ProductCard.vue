<script setup>
import { ref } from 'vue'
import '../assets/productcard.css'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['add-to-cart', 'toggle-wishlist'])

function addToCart() {
  emit('add-to-cart', quantity.value)
}

const quantity = ref(1)
const isWishlisted = ref(false)

function decrease() {
  if (quantity.value > 1) quantity.value--
}

function increase() {
  if (quantity.value < props.product.stock) quantity.value++
}

function toggleWishlist() {
  isWishlisted.value = !isWishlisted.value
  emit('toggle-wishlist', isWishlisted.value ? 1 : -1)
}
</script>

<template>
  <article class="product">
    <div class="product__media">
      <button
        type="button"
        class="product__wish"
        :class="{ 'product__wish--active': isWishlisted }"
        :aria-label="isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
        :aria-pressed="isWishlisted"
        @click="toggleWishlist"
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
    <div class="product__body">
      <img :src="product.thumbnail" :alt="product.title" class="product__image" />
      <p class="product__brand" v-if="product.stock">Stock:{{ product.stock }}</p>
      <h3 class="product__name" v-if="product.title">{{ product.title }}</h3>
      <p class="product__rating" v-if="product.rating">
        <span class="stars">★★★★★</span> ({{ product.rating }})
      </p>
      <p class="product__price" v-if="product.price">${{ product.price }}</p>

      <div class="qty">
        <button
          type="button"
          class="qty__btn"
          aria-label="Decrease quantity"
          :disabled="quantity <= 1"
          @click="decrease"
        >
          −
        </button>
        <span class="qty__value">{{ quantity }}</span>
        <button
          type="button"
          class="qty__btn"
          aria-label="Increase quantity"
          :disabled="quantity >= product.stock"
          @click="increase"
        >
          +
        </button>
      </div>

      <div class="product__actions">
        <button type="button" class="btn btn--primary">Buy Now</button>
        <button type="button" class="btn btn--secondary" @click="addToCart">Add to Cart</button>
      </div>
    </div>
  </article>
</template>
