<script setup lang="ts">
import '../assets/productsort.css'

withDefaults(
  defineProps<{
    sort?: string
    heading?: string
    count?: number
    loading?: boolean
  }>(),
  {
    sort: 'featured',
    heading: 'All products',
    count: 0,
    loading: false,
  },
)

const emit = defineEmits<{
  'update:sort': [value: string]
}>()

function onSortChange(event: Event) {
  // on sort change, emit the new sort value
  emit('update:sort', (event.target as HTMLSelectElement).value) // emit the new sort value to parent
}
</script>

<template>
  <div class="listing__toolbar">
    <h2 class="listing__heading">{{ heading }}</h2>
    <div class="listing__toolbar-right">
      <p class="listing__count">{{ loading ? '…' : count }} products</p>
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
