<script setup>
import '../assets/productsort.css'

defineProps({
  sort: { type: String, default: 'price-asc' },
  heading: { type: String, default: 'All products' },
  count: { type: Number, default: 0 },
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
    <div class="listing__toolbar-right">
      <p class="listing__count">{{ count }} products</p>
      <label class="sort">
        <select :value="sort" @change="onSortChange">
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name</option>
          <option value="best-selling">Best Selling</option>
        </select>
      </label>
    </div>
  </div>
</template>
