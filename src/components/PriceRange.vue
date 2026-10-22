<script setup>
import '../assets/pricerange.css'

const minValue = defineModel('minPrice', {
  type: Number,
  default: 0,
})

const maxValue = defineModel('maxPrice', {
  type: Number,
  default: 2500,
})
const limitMin = 0
const limitMax = 2500
</script>
<template>
  <section class="filter-group">
    <h3 class="filter-group__title">Price Range</h3>
    <div class="price-inputs">
      <label>
        Min
        <input type="number" v-model="minValue" :min="limitMin" :max="limitMax" />
      </label>
      <span class="price-dash">–</span>
      <label>
        Max
        <input type="number" v-model="maxValue" :min="limitMin" :max="limitMax" />
      </label>
    </div>
    <input type="range" class="price-range" v-model="maxValue" :min="limitMin" :max="limitMax" />
    <p class="price-hint">${{ minValue }} – ${{ maxValue }}</p>
  </section>
</template>
