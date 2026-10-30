<script setup>
import '../assets/productsort.css'

defineProps({
  sort: { type: String, default: 'price-asc' },
  heading: { type: String, default: 'All products' },
})

const emit = defineEmits(['update:sort'])

function onSortChange(event) {
  // on sort change, emit the new sort value
  emit('update:sort', event.target.value) // emit the new sort value to parent
}
</script>

<template>
  <div class="listing__toolbar">
    <h1 class="listing__heading">{{ heading }}</h1>
    <label class="sort">
      Sort by
      <select :value="sort" @change="onSortChange">
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name">Name</option>
        <option value="best-selling">Best Selling</option>
      </select>
    </label>
  </div>
</template>
