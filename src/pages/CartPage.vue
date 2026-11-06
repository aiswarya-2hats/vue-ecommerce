<script setup>
import { ref, watch, computed } from 'vue'
import { useCart } from '../composables/useCart'
import { getProduct } from '../services/productService'
import '../assets/cart.css'

const { cartItems, setQty, remove, clear } = useCart()
const products = ref({})
const loading = ref(cartItems.value.length > 0)

const lines = computed(() =>
  cartItems.value.map((item) => ({
    ...item,
    product: products.value[item.id] || null,
  })),
)

const total = computed(() =>
  lines.value.reduce((sum, line) => {
    const price = Number(line.price ?? line.product?.price) || 0
    return sum + price * line.qty
  }, 0),
)

async function loadProducts() {
  const ids = cartItems.value.map((item) => item.id)
  const missing = ids.filter((id) => !products.value[id])
  if (!missing.length) return

  loading.value = true
  try {
    const results = await Promise.all(missing.map((id) => getProduct(id)))
    const next = { ...products.value }
    results.forEach((product, i) => {
      if (product) next[missing[i]] = product
    })
    products.value = next
  } finally {
    loading.value = false
  }
}

watch(cartItems, loadProducts, { immediate: true, deep: true })

function decrease(id, qty, variantId) {
  setQty(id, qty - 1, variantId)
}

function increase(id, qty, variantId) {
  setQty(id, qty + 1, variantId)
}

function lineKey(line) {
  return `${line.id}-${line.variantId || 'default'}`
}
</script>

<template>
  <section class="cart-page">
    <div class="cart-page__head">
      <h1>Cart</h1>

      <button v-if="cartItems.length" type="button" class="cart-page__clear" @click="clear">
        Clear cart
      </button>
    </div>

    <ul v-if="loading" class="cart-list">
      <li v-for="item in cartItems" :key="lineKey(item)" class="cart-line cart-line--skeleton">
        <div class="cart-line__image cart-line__image--skeleton"></div>
        <div class="cart-line__body">
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line--short"></div>
        </div>
      </li>
    </ul>
    <p v-else-if="!cartItems.length" class="cart-page__empty">Your cart is empty.</p>

    <ul v-else class="cart-list">
      <li v-for="line in lines" :key="lineKey(line)" class="cart-line">
        <img
          v-if="line.product || line.image"
          class="cart-line__image"
          :src="line.image || line.product?.thumbnail || line.product?.images?.[0]"
          :alt="line.product?.title || `Product #${line.id}`"
        />
        <div class="cart-line__body">
          <h2 class="cart-line__title">{{ line.product?.title || `Product #${line.id}` }}</h2>
          <p v-if="line.options" class="cart-line__variant">
            {{ Object.values(line.options).join(' · ') }}
          </p>
          <p v-if="line.price != null || line.product" class="cart-line__price">
            ${{ line.price ?? line.product?.price }}
          </p>

          <div class="cart-line__qty">
            <button
              type="button"
              class="qty__btn"
              aria-label="Decrease quantity"
              @click="decrease(line.id, line.qty, line.variantId)"
            >
              −
            </button>
            <span class="qty__value">{{ line.qty }}</span>
            <button
              type="button"
              class="qty__btn"
              aria-label="Increase quantity"
              @click="increase(line.id, line.qty, line.variantId)"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          class="cart-line__remove"
          aria-label="Remove from cart"
          @click="remove(line.id, line.variantId)"
        >
          ×
        </button>
      </li>
    </ul>
    <br />

    <router-link to="/products" class="btn btn--secondary"> Continue shopping </router-link>

    <p v-if="cartItems.length" class="cart-page__total">Total: ${{ total.toFixed(2) }}</p>
  </section>
</template>
