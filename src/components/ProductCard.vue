<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlist } from '../composables/useWishlist'
import { useCart } from '../composables/useCart'
import { useQuickView } from '../composables/useQuickView'
import '../assets/productcard.css'

const router = useRouter()

const props = defineProps({
  id: { type: [Number, String], required: true },
  image: { type: String, required: true },
  hoverImage: { type: String, default: '' },
  title: { type: String, required: true },
  stock: { type: [Number, String], required: true },
  rating: { type: [Number, String], required: true },
  price: { type: [Number, String], required: true },
  discount: { type: [Number, String], required: true },
  brand: { type: String, required: true },
  removable: { type: Boolean, default: false },
})

const emit = defineEmits(['remove'])

const { isWishlisted, toggle: toggleWishlist } = useWishlist()
const { add: addToCart, getQty } = useCart()
const { open: openQuickView } = useQuickView()

const qty = ref(1)

const wishlisted = computed(() => isWishlisted(props.id))
const detailLink = computed(() => `/products/${props.id}`)
const displayPrice = computed(() => Number(props.price) || 0)
const stockLeft = computed(() => Math.max(0, Number(props.stock) - getQty(props.id)))
const canAdd = computed(() => stockLeft.value > 0 && qty.value <= stockLeft.value)

function navigateToDetail() {
  router.push(detailLink.value)
}

function onQuickView(event) {
  event.preventDefault()
  event.stopPropagation()
  openQuickView(props.id)
}

const filledStars = computed(() => {
  const count = Math.round(Number(props.rating)) || 0
  const filled = Math.min(5, Math.max(0, count))
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
})

const hasDiscount = computed(() => Math.round(Number(props.discount)) >= 1)

const originalPrice = computed(() => {
  const pct = Number(props.discount)
  if (pct <= 0) return displayPrice.value
  return displayPrice.value / (1 - pct / 100)
})

function onWishAction() {
  if (props.removable) {
    emit('remove')
    return
  }
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
      <router-link :to="detailLink" class="product__link">
        <img :src="image" :alt="title" class="product__image" />
        <img
          v-if="hoverImage"
          :src="hoverImage"
          alt=""
          aria-hidden="true"
          class="product__image product__image--hover"
        />
      </router-link>

      <button type="button" class="product__quickview" aria-label="Quick view" @click="onQuickView">
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
          aria-hidden="true"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      <button
        type="button"
        class="product__wish"
        :class="{
          'product__wish--active': !removable && wishlisted,
          'product__wish--remove': removable,
        }"
        :aria-label="removable || wishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
        :aria-pressed="removable ? undefined : wishlisted"
        @click="onWishAction"
      >
        <svg
          v-if="removable"
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
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
        <svg
          v-else
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
      <span class="product__brand">{{ brand }}</span>
      <h3 class="product__name">
        <router-link :to="detailLink" class="product__link">{{ title }}</router-link>
      </h3>
      <p class="product__rating">
        <span class="stars">{{ filledStars }}</span> ({{ rating }})
      </p>

      <p class="product__price" :class="{ 'product__price--discount': hasDiscount }">
        ${{ displayPrice.toFixed(2) }}
        <template v-if="hasDiscount">
          <s class="product__original-price">${{ originalPrice.toFixed(2) }}</s>
          <span class="product__discount">{{ Number(discount).toFixed(0) }}% off</span>
        </template>
      </p>

      <p v-if="stockLeft > 0" class="product__brand">Stock: {{ stockLeft }}</p>
      <p v-else class="product__stock-msg">Out of stock</p>

      <div class="product__actions">
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
        <button type="button" class="btn btn--primary" @click="navigateToDetail">Details</button>
        <button type="button" class="btn btn--secondary" :disabled="!canAdd" @click="onAddToCart">
          Add to Cart
        </button>
      </div>
    </div>
  </article>
</template>
