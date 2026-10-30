<script setup>
import PriceRange from './PriceRange.vue'
import '../assets/filter.css'

const props = defineProps({
  categories: { type: Array, default: () => [] }, // get categories from API
  brands: { type: Array, default: () => [] }, // get brands from API
  selectedCategory: { type: String, default: '' }, // get selected category from URL
  selectedBrands: { type: Array, default: () => [] }, // get selected brands from URL
  selectedRating: { type: Number, default: null }, // get selected rating from URL
  minPrice: { type: Number, default: 0 },
  maxPrice: { type: Number, default: 2500 },
})

const emit = defineEmits(['update:category', 'update:brands', 'update:rating', 'update:price'])

const ratingOptions = [
  { value: 5, label: '★★★★★' },
  { value: 4, label: '★★★★☆' },
  { value: 3, label: '★★★☆☆' },
  { value: 2, label: '★★☆☆☆' },
]

function onCategoryChange(category) {
  emit('update:category', category || '')
}

function toggleBrand(brand, checked) {
  const next = checked
    ? [...props.selectedBrands, brand]
    : props.selectedBrands.filter((b) => b !== brand)
  emit('update:brands', next)
}

function onRatingChange(value) {
  emit('update:rating', value)
}
</script>

<template>
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

        <PriceRange
          :min-price="minPrice"
          :max-price="maxPrice"
          @update:price="emit('update:price', $event)"
        />

        <section class="filter-group">
          <h3 class="filter-group__title">Category</h3>
          <label class="check">
            <input
              type="radio"
              name="category"
              value=""
              :checked="!selectedCategory"
              @change="onCategoryChange('')"
            />
            All
          </label>
          <label v-for="category in categories" :key="category" class="check">
            <input
              type="radio"
              name="category"
              :value="category"
              :checked="selectedCategory === category"
              @change="onCategoryChange(category)"
            />
            {{ category }}
          </label>
        </section>

        <section class="filter-group">
          <h3 class="filter-group__title">Brands</h3>
          <p v-if="brands.length === 0" class="filter-group__empty">No brands available</p>
          <label v-for="brand in brands" :key="brand" class="check">
            <input
              type="checkbox"
              :value="brand"
              :checked="selectedBrands.includes(brand)"
              @change="toggleBrand(brand, $event.target.checked)"
            />
            {{ brand }}
          </label>
        </section>

        <section class="filter-group">
          <h3 class="filter-group__title">Rating</h3>
          <label v-for="option in ratingOptions" :key="option.value" class="check">
            <input
              type="radio"
              name="rating"
              :value="option.value"
              :checked="selectedRating === option.value"
              @change="onRatingChange(option.value)"
            />
            <span class="stars" aria-hidden="true">{{ option.label }}</span> & up
          </label>
          <label class="check">
            <input
              type="radio"
              name="rating"
              value=""
              :checked="!selectedRating"
              @change="onRatingChange(null)"
            />
            Any rating
          </label>
        </section>
      </div>
    </div>
  </aside>
</template>
