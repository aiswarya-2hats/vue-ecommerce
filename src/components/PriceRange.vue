<script setup>
import '../assets/pricerange.css'

const props = defineProps({
  minPrice: { type: Number, default: 0 },
  maxPrice: { type: Number, default: 2500 },
})

const emit = defineEmits(['update:price'])

function onMinChange(event) {
  const min = Number(event.target.value)
  emit('update:price', { min, max: props.maxPrice })
}

function onMaxChange(event) {
  const max = Number(event.target.value)
  emit('update:price', { min: props.minPrice, max })
}
</script>

<template>
  <section class="filter-group">
    <h3 class="filter-group__title">Price Range</h3>
    <div class="price-inputs">
      <label>
        Min
        <input
          type="number"
          :value="minPrice"
          min="0"
          max="2500"
          @change="onMinChange"
        />
      </label>
      <span class="price-dash">–</span>
      <label>
        Max
        <input
          type="number"
          :value="maxPrice"
          min="0"
          max="2500"
          @change="onMaxChange"
        />
      </label>
    </div>
    <input
      type="range"
      class="price-range"
      :value="maxPrice"
      min="0"
      max="2500"
      @change="onMaxChange"
    />
    <p class="price-hint">${{ minPrice }} – ${{ maxPrice }}</p>
  </section>
</template>
