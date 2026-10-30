<script setup>
import { ref, computed } from 'vue'
import { isWishlisted, toggleWishlist } from '../utils/wishlist'
import { addToCart, getQty } from '../utils/cart'
import '../assets/productcard.css'

const props = defineProps({
  id: { type: [Number, String], required: true },
  image: { type: String, required: true },
  title: { type: String, required: true },
  stock: { type: [Number, String], required: true },
  rating: { type: [Number, String], required: true },
  price: { type: [Number, String], required: true },
})

const wishlisted = computed(() => isWishlisted(props.id))
const qty = ref(1)

// How many more can still be added (stock minus what's already in cart)
const stockLeft = computed(() => Math.max(0, Number(props.stock) - getQty(props.id)))
const canAdd = computed(() => stockLeft.value > 0 && qty.value <= stockLeft.value)

const filledStars = computed(() => {
  // compute the filled stars
  const count = Math.round(Number(props.rating)) || 0 // round the rating to the nearest integer
  const filled = Math.min(5, Math.max(0, count)) // limit the number of filled stars to 5
  return '★'.repeat(filled) + '☆'.repeat(5 - filled) // return the filled stars and empty stars
})

function onToggleWish() {
  toggleWishlist(props.id)
}

function decreaseQty() {
  if (qty.value > 1) qty.value -= 1
}

function increaseQty() {
  if (qty.value < stockLeft.value) qty.value += 1
}

function onAddToCart() {
  if (!canAdd.value) return
  addToCart(props.id, qty.value)
}
</script>

<template>
  <article class="product">
    <div class="product__media">
      <img :src="image" :alt="title" class="product__image" />
      <button
        type="button"
        class="product__wish"
        :class="{ 'product__wish--active': wishlisted }"
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
    <div class="product__body">
      <p class="product__brand">Stock:{{ stock }}</p>
      <h3 class="product__name">{{ title }}</h3>
      <p class="product__rating">
        <span class="stars">{{ filledStars }}</span> ({{ rating }})
      </p>
      <p class="product__price">${{ price }}</p>

      <div class="qty">
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

      <div class="product__actions">
        <button type="button" class="btn btn--primary" :disabled="!canAdd" @click="onAddToCart">
          Buy Now
        </button>
        <button type="button" class="btn btn--secondary" :disabled="!canAdd" @click="onAddToCart">
          Add to Cart
        </button>
      </div>
    </div>
  </article>
</template>
