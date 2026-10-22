<script setup>
import '../assets/productsort.css'

const sortBy = defineModel('sortBy', {
  type: String,
  default: 'price-asc',
})
</script>
<template>
  <div class="listing__toolbar">
    <label class="sort">
      Sort by
      <select v-model="sortBy">
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name">Name</option>
      </select>
    </label>
  </div>
</template>
