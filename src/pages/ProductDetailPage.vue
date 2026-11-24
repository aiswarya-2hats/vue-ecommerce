<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ProductDetail from '../components/ProductDetail.vue'

const route = useRoute()
const productId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : id
})
</script>

<template>
  <ProductDetail :product-id="productId" show-back sync-variant-to-route />
</template>
