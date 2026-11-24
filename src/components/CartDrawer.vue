<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import { useCartDrawer } from '../composables/useCartDrawer'
import { useWishlist } from '../composables/useWishlist'
import { getProduct, getVariantsForProduct } from '../services/productService'
import { primaryProductImage } from '../utils/productImage'
import type { CartItem, Product } from '../types/product'
import '../assets/cartdrawer.css'

const router = useRouter()
const { isOpen, close } = useCartDrawer()
const { cartItems, setQty, remove } = useCart()
const { isWishlisted, toggle: toggleWishlist } = useWishlist()

const products = ref<Record<number, Product>>({})

const lines = computed(() =>
  cartItems.value.map((item) => {
    const product = products.value[item.id] || null
    const variant = item.variantId
      ? getVariantsForProduct(item.id).find((v) => String(v.id) === String(item.variantId))
      : null
    const unitPrice = Number(item.price ?? variant?.price ?? product?.price) || 0

    return {
      ...item,
      product,
      variant,
      sku: variant?.sku || product?.sku || '',
      delivery: product?.shippingInformation || '',
      unitPrice,
      lineTotal: unitPrice * item.qty,
      optionEntries: item.options
        ? Object.entries(item.options).map(([key, value]) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value,
          }))
        : [],
    }
  }),
)

const total = computed(() => lines.value.reduce((sum, line) => sum + line.lineTotal, 0))

const itemCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.qty, 0))

function lineHasSpecs(line: (typeof lines.value)[number]) {
  return Boolean(line.sku || line.delivery || line.optionEntries.length)
}

async function loadProducts() {
  const missing = cartItems.value.map((i) => i.id).filter((id) => !products.value[id])
  if (!missing.length) return

  const results = await Promise.all(missing.map((id) => getProduct(id).catch(() => null)))
  const next = { ...products.value }
  results.forEach((product, i) => {
    if (product) next[missing[i]] = product
  })
  products.value = next
}

function onKeydown(event: KeyboardEvent) {
  // if the user presses the escape key, close the cart drawer
  if (event.key === 'Escape') close()
}

watch(isOpen, (open) => {
  // if the cart drawer is open, prevent the body from scrolling
  document.body.style.overflow = open ? 'hidden' : ''
  // if the cart drawer is open, load the products
  if (open) {
    loadProducts()
    window.addEventListener('keydown', onKeydown)
  } else {
    window.removeEventListener('keydown', onKeydown)
  }
})

watch(
  cartItems,
  () => {
    if (isOpen.value) loadProducts() // if the cart drawer is open, load the products
  },
  { deep: true },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})

function lineKey(item: CartItem) {
  return `${item.id}-${item.variantId || 'default'}`
}

function lineImage(line: (typeof lines.value)[number]) {
  return line.image || primaryProductImage(line.product) || ''
}

function productLink(line: (typeof lines.value)[number]) {
  if (!line.variantId) return `/products/${line.id}`
  return { path: `/products/${line.id}`, query: { variant: line.variantId } }
}

function lineWishlisted(line: (typeof lines.value)[number]) {
  return isWishlisted(line.id, line.variantId)
}

function onToggleWish(line: (typeof lines.value)[number]) {
  toggleWishlist(line.id, {
    id: line.variantId,
    options: line.options,
    image: line.image || line.variant?.image || null,
    price: line.unitPrice || null,
  })
}

function goToCart() {
  close()
  router.push('/cart')
}

function shopProducts() {
  close()
  router.push('/products')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="cart-drawer">
      <div v-if="isOpen" class="cart-drawer" role="dialog" aria-modal="true" aria-label="Cart">
        <button
          type="button"
          class="cart-drawer__backdrop"
          aria-label="Close cart"
          @click="close"
        />

        <aside class="cart-drawer__panel">
          <header class="cart-drawer__head">
            <h2 class="cart-drawer__title">
              Cart
              <span v-if="itemCount" class="cart-drawer__count">({{ itemCount }})</span>
            </h2>
            <button type="button" class="cart-drawer__close" aria-label="Close" @click="close">
              ×
            </button>
          </header>

          <div class="cart-drawer__body">
            <div v-if="!cartItems.length" class="cart-drawer__empty">
              <p>Your cart is empty.</p>
              <button type="button" class="btn btn--primary" @click="shopProducts">
                Continue shopping
              </button>
            </div>

            <ul v-else class="cart-drawer__list">
              <li v-for="line in lines" :key="lineKey(line)" class="cart-drawer__line">
                <router-link :to="productLink(line)" class="cart-drawer__thumb" @click="close">
                  <img
                    v-if="lineImage(line)"
                    :src="lineImage(line)"
                    :alt="line.product?.title || `Product #${line.id}`"
                  />
                </router-link>

                <div class="cart-drawer__info">
                  <div class="cart-drawer__top">
                    <router-link :to="productLink(line)" class="cart-drawer__name" @click="close">
                      {{ line.product?.title || `Product #${line.id}` }}
                    </router-link>
                    <button
                      type="button"
                      class="cart-drawer__remove"
                      aria-label="Remove from cart"
                      @click="remove(line.id, line.variantId)"
                    >
                      ×
                    </button>
                  </div>

                  <ul v-if="lineHasSpecs(line)" class="cart-drawer__specs">
                    <li v-if="line.sku"><span>Product number:</span> {{ line.sku }}</li>
                    <li v-if="line.delivery"><span>Delivery period:</span> {{ line.delivery }}</li>
                    <li v-for="opt in line.optionEntries" :key="opt.label">
                      <span>{{ opt.label }}:</span> {{ opt.value }}
                    </li>
                  </ul>

                  <div class="cart-drawer__bottom">
                    <p class="cart-drawer__price">${{ line.lineTotal.toFixed(2) }}</p>

                    <div class="cart-drawer__controls">
                      <button
                        type="button"
                        class="cart-drawer__wish"
                        :class="{ 'cart-drawer__wish--active': lineWishlisted(line) }"
                        :aria-pressed="lineWishlisted(line)"
                        @click="onToggleWish(line)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                          />
                        </svg>
                        <span>
                          {{ lineWishlisted(line) ? 'In wishlist' : 'Add to wishlist' }}
                        </span>
                      </button>

                      <div class="cart-drawer__qty">
                        <button
                          type="button"
                          class="qty__btn"
                          aria-label="Decrease quantity"
                          :disabled="line.qty <= 1"
                          @click="setQty(line.id, line.qty - 1, line.variantId)"
                        >
                          −
                        </button>
                        <span class="qty__value">{{ line.qty }}</span>
                        <button
                          type="button"
                          class="qty__btn"
                          aria-label="Increase quantity"
                          @click="setQty(line.id, line.qty + 1, line.variantId)"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <footer v-if="cartItems.length" class="cart-drawer__footer">
            <p class="cart-drawer__total">
              <span>Total</span>
              <strong>${{ total.toFixed(2) }}</strong>
            </p>
            <button type="button" class="btn btn--primary cart-drawer__cta" @click="goToCart">
              Go to cart
            </button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
