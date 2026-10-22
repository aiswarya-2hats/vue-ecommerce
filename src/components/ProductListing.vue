<script setup>
import { computed, ref } from 'vue'
import Filter from './Filter.vue'
import ProductCard from './ProductCard.vue'
import ProductSort from './ProductSort.vue'
import '../assets/productlisting.css'
import productsData from '../products.json'

const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['add-to-cart'])
const selectedCategories = ref([])
const selectedBrands = ref([])
const minPrice = ref(0)
const maxPrice = ref(2500)
const sortBy = ref('price-asc')

const products = productsData.products

const filteredProducts = computed(() => {
  const q = props.searchQuery.toLowerCase().trim()

  let result = products.filter((p) => {
    const matchesSearch = !q || p.title.toLowerCase().includes(q)

    const matchesCategory =
      selectedCategories.value.length === 0 || selectedCategories.value.includes(p.category)

    const matchesBrand = selectedBrands.value.length === 0 || selectedBrands.value.includes(p.brand)

    const matchesPrice = p.price >= minPrice.value && p.price <= maxPrice.value

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice
  })

  result = [...result] // copy before sort

  if (sortBy.value === 'price-asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    result.sort((a, b) => b.price - a.price)
  } else if (sortBy.value === 'name') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  }

  return result
})
</script>

<template>
  <div class="layout">
    <Filter
      v-model:selected-categories="selectedCategories"
      v-model:selected-brands="selectedBrands"
      v-model:min-price="minPrice"
      v-model:max-price="maxPrice"
    />
    <section class="listing">
      <ProductSort v-model:sort-by="sortBy" />
      <div class="products">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="emit('add-to-cart', $event)"
        />
      </div>
    </section>
  </div>
</template>
