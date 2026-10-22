<script setup>
import ProductListing from '../components/ProductListing.vue'

defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['add-to-cart', 'toggle-wishlist'])
</script>

<template>
  <ProductListing
    :search-query="searchQuery"
    @add-to-cart="emit('add-to-cart', $event)"
    @toggle-wishlist="emit('toggle-wishlist', $event)"
  />
</template>
