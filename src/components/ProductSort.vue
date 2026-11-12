<script setup>
import '../assets/productsort.css'

defineProps({
  sort: { type: String, default: 'featured' },
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
    <h2 class="listing__heading">{{ heading }}</h2>
    <div class="listing__toolbar-right">
      <p class="listing__count">{{ count }} products</p>
      <label class="sort" for="product-sort">
        <select id="product-sort" aria-label="Sort by" :value="sort" @change="onSortChange">
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name</option>
          <option value="rating-desc">Customer Rating (High to Low)</option>
          <option value="best-selling">Best Selling</option>
          <option value="discount-desc">Biggest Discount</option>
          <option value="newest">Newest</option>
        </select>
      </label>
    </div>
  </div>
</template>
