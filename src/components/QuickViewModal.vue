<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useQuickView } from '../composables/useQuickView'
import ProductDetail from './ProductDetail.vue'
import '../assets/quickview.css'

const { productId, close } = useQuickView()

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

watch(productId, (id) => {
  document.body.style.overflow = id ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKeydown))
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
          <ProductDetail :product-id="productId" />
          <router-link class="quickview__full-link" :to="`/products/${productId}`" @click="close">
            View full details →
          </router-link>
        </div>
      </div>
    </div>
  </Teleport>
</template>
