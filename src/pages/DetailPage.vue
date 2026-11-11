<script setup>
import { useRoute } from 'vue-router'
import ProductDetail from '../components/ProductDetail.vue'

const route = useRoute()
</script>

<template>
  <ProductDetail :product-id="route.params.id" show-back sync-variant-to-route />
</template>
