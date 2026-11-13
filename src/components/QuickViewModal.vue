<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { useQuickView } from '../composables/useQuickView'
import ProductDetail from './ProductDetail.vue'
import '../assets/quickview.css'

const { productId, close } = useQuickView()

const dialogRef = ref(null)
const closeBtnRef = ref(null)
let lastFocused = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusable() {
  return [...(dialogRef.value?.querySelectorAll(FOCUSABLE) || [])]
}

function onKeydown(event) {
  if (!productId.value) return

  if (event.key === 'Escape') {
    close()
    return
  }

  // Keep Tab inside the popup
  if (event.key !== 'Tab') return

  const items = getFocusable()
  if (!items.length) return

  const first = items[0]
  const last = items[items.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(productId, async (id, prev) => {
  document.body.style.overflow = id ? 'hidden' : ''

  if (id) {
    lastFocused = document.activeElement
    await nextTick()
    closeBtnRef.value?.focus() // focus moves into popup
    window.addEventListener('keydown', onKeydown)
  } else if (prev) {
    window.removeEventListener('keydown', onKeydown)
    lastFocused?.focus?.() // return focus to Quick view button
    lastFocused = null
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="productId"
      class="quickview"
      role="dialog"
      aria-modal="true"
      aria-label="Product quick view"
    >
      <button
        type="button"
        class="quickview__backdrop"
        aria-label="Close quick view"
        @click="close"
      />
      <div class="quickview__panel">
        <button type="button" class="quickview__close" aria-label="Close" @click="close">×</button>
        <div class="quickview__body">
          <ProductDetail :product-id="productId" :show-related="false" />
          <router-link class="quickview__full-link" :to="`/products/${productId}`" @click="close">
            View full details →
          </router-link>
        </div>
      </div>
    </div>
  </Teleport>
</template>
