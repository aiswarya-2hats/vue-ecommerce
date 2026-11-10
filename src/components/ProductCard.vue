<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlist } from '../composables/useWishlist'
import { useCart } from '../composables/useCart'
import { useProductVariants } from '../composables/useProductVariants'
import VariantPicker from './VariantPicker.vue'
import ProductImage from './ProductImage.vue'
import '../assets/productcard.css'

const router = useRouter()

const props = defineProps({
  id: { type: [Number, String], required: true },
  image: { type: String, required: true },
  title: { type: String, required: true },
  stock: { type: [Number, String], required: true },
  rating: { type: [Number, String], required: true },
  price: { type: [Number, String], required: true },
  discount: { type: [Number, String], required: true },
  brand: { type: String, required: true },
  variants: { type: Array, default: () => [] },
  preferredVariantId: { type: [String, Number], default: null },
  removable: { type: Boolean, default: false },
})

const { isWishlisted, toggle: toggleWishlist, remove: removeWishlist } = useWishlist()
const { add: addToCart } = useCart()

const qty = ref(1)
const variantsOpen = ref(false)

const {
  selectedOptions,
  hasVariants,
  optionKeys,
  selectedVariant,
  displayPrice,
  displayImage,
  stockLeft,
  canAdd,
  optionValues,
  selectOption,
} = useProductVariants({
  variants: () => props.variants,
  productId: () => props.id,
  basePrice: () => props.price,
  baseStock: () => props.stock,
  baseImage: () => props.image,
  qty,
  preferredVariantId: () => props.preferredVariantId,
})

const wishlisted = computed(() => isWishlisted(props.id, selectedVariant.value?.id))

const detailLink = computed(() => {
  if (!selectedVariant.value?.id) return `/products/${props.id}`
  return { path: `/products/${props.id}`, query: { variant: selectedVariant.value.id } }
})

function navigateToDetail() {
  router.push(detailLink.value)
}

function toggleVariants(e) {
  e.preventDefault()
  e.stopPropagation()
  variantsOpen.value = !variantsOpen.value
}

function closeVariants() {
  variantsOpen.value = false
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
    removeWishlist(props.id, selectedVariant.value?.id ?? props.preferredVariantId)
    return
  }
  toggleWishlist(props.id, selectedVariant.value)
}

function decreaseQty() {
  if (qty.value > 1) qty.value -= 1
}

function increaseQty() {
  if (qty.value < stockLeft.value) qty.value += 1
}

function onAddToCart() {
  if (!canAdd.value) return
  addToCart(props.id, qty.value, selectedVariant.value)
}
</script>

<template>
  <article class="product">
    <div class="product__media">
      <router-link :to="detailLink" class="product__link">
        <ProductImage :src="displayImage" :alt="title" img-class="product__image" />
      </router-link>

      <template v-if="hasVariants">
        <div
          class="product__overlay"
          :class="{ 'product__overlay--open': variantsOpen }"
          @click="closeVariants"
        >
          <div class="product__variants" @click.stop>
            <VariantPicker
              tone="overlay"
              :option-keys="optionKeys"
              :selected-options="selectedOptions"
              :option-values="optionValues"
              @select="selectOption"
            />
          </div>
        </div>

        <button
          type="button"
          class="product__variants-toggle"
          :class="{ 'product__variants-toggle--active': variantsOpen }"
          :aria-label="variantsOpen ? 'Hide variants' : 'Show variants'"
          :aria-expanded="variantsOpen"
          @click="toggleVariants"
        >
          🎨
        </button>
      </template>

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

      <p class="product__price">
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
        <button type="button" class="btn btn--primary" @click="navigateToDetail">Buy Now</button>
        <button type="button" class="btn btn--secondary" :disabled="!canAdd" @click="onAddToCart">
          Add to Cart
        </button>
      </div>
    </div>
  </article>
</template>
