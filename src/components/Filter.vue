<script setup>
import PriceRange from './PriceRange.vue'
import '../assets/filter.css'

const selectedCategories = defineModel('selectedCategories', {
  type: Array,
  default: () => [],
})

const selectedBrands = defineModel('selectedBrands', {
  type: Array,
  default: () => [],
})

const minPrice = defineModel('minPrice', {
  type: Number,
  default: 0,
})

const maxPrice = defineModel('maxPrice', {
  type: Number,
  default: 2500,
})

const minRating = defineModel('minRating', {
  type: Number,
  default: 0,
})

const categories = ['beauty', 'fragrances', 'furniture', 'groceries']
const brands = ['Calvin Klein', 'Gucci', 'Knoll', 'Dior', 'Essence']
const ratings = [
  { value: 5, stars: '★★★★★' },
  { value: 4, stars: '★★★★☆' },
  { value: 3, stars: '★★★☆☆' },
  { value: 2, stars: '★★☆☆☆' },
]
</script>

<template>
  <!-- Filters -->
  <aside class="filters" aria-label="Product filters">
    <input type="checkbox" id="filter-toggle" class="filter-toggle" hidden />
    <label for="filter-toggle" class="filters__toggle">
      <span class="filters__toggle-text">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M4 6h16M7 12h10M10 18h4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Filters
      </span>
      <span class="filters__chevron" aria-hidden="true"></span>
    </label>

    <div class="filters__panel">
      <div class="filters__panel-inner">
        <h2 class="filters__title">Filters</h2>

        <PriceRange v-model:min-price="minPrice" v-model:max-price="maxPrice" />

        <section class="filter-group">
          <h3 class="filter-group__title">Category</h3>
          <label v-for="cat in categories" :key="cat" class="check">
            <input type="checkbox" :value="cat" v-model="selectedCategories" />
            {{ cat }}
          </label>
        </section>

        <section class="filter-group">
          <h3 class="filter-group__title">Brands</h3>
          <label v-for="brand in brands" :key="brand" class="check">
            <input type="checkbox" :value="brand" v-model="selectedBrands" />
            {{ brand }}
          </label>
        </section>

        <section class="filter-group">
          <h3 class="filter-group__title">Rating</h3>
          <label v-for="rating in ratings" :key="rating.value" class="check">
            <input type="radio" name="rating" :value="rating.value" v-model="minRating" />
            <template v-if="rating.value === 0">{{ rating.stars }}</template>
            <template v-else>
              <span class="stars" aria-hidden="true">{{ rating.stars }}</span> & up
            </template>
          </label>
        </section>
      </div>
    </div>
  </aside>
</template>
