<script setup>
import { ref, watch, computed } from 'vue'
import { useCart } from '../composables/useCart'
import { getProduct } from '../services/productService'
import '../assets/cart.css'

const { cartItems, setQty, remove, clear } = useCart()
const products = ref({})
const loading = ref(false)

const lines = computed(() =>
  cartItems.value.map((item) => ({
    ...item,
    product: products.value[item.id] || null,
  })),
)

const total = computed(() =>
  lines.value.reduce((sum, line) => {
    const price = Number(line.product?.price) || 0
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

function decrease(id, qty) {
  setQty(id, qty - 1)
}

function increase(id, qty) {
  setQty(id, qty + 1)
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

    <p v-if="loading && !lines.length" class="cart-page__empty">Loading…</p>
    <p v-else-if="!cartItems.length" class="cart-page__empty">Your cart is empty.</p>

    <ul v-else class="cart-list">
      <li v-for="line in lines" :key="line.id" class="cart-line">
        <img
          v-if="line.product"
          class="cart-line__image"
          :src="line.product.thumbnail || line.product.images?.[0]"
          :alt="line.product.title"
        />
        <div class="cart-line__body">
          <h2 class="cart-line__title">{{ line.product?.title || `Product #${line.id}` }}</h2>
          <p v-if="line.product" class="cart-line__price">${{ line.product.price }}</p>

          <div class="cart-line__qty">
            <button
              type="button"
              class="qty__btn"
              aria-label="Decrease quantity"
              @click="decrease(line.id, line.qty)"
            >
              −
            </button>
            <span class="qty__value">{{ line.qty }}</span>
            <button
              type="button"
              class="qty__btn"
              aria-label="Increase quantity"
              @click="increase(line.id, line.qty)"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          class="cart-line__remove"
          aria-label="Remove from cart"
          @click="remove(line.id)"
        >
          Remove
        </button>
      </li>
    </ul>

    <p v-if="cartItems.length" class="cart-page__total">Total: ${{ total.toFixed(2) }}</p>
  </section>
</template>
