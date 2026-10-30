<script setup>
import { computed, ref, watch } from 'vue'
import '../assets/pricerange.css'

const PRICE_MIN = 0
const PRICE_MAX = 2500
const STEP = 10

const props = defineProps({
  minPrice: { type: Number, default: PRICE_MIN },
  maxPrice: { type: Number, default: PRICE_MAX },
})

const emit = defineEmits(['update:price'])

// Local values so the UI stays correct while dragging (props update only after URL changes)
const localMin = ref(props.minPrice)
const localMax = ref(props.maxPrice)
const activeThumb = ref(null)

watch(
  () => [props.minPrice, props.maxPrice],
  ([min, max]) => {
    localMin.value = min
    localMax.value = max
  },
)

function emitPrice() {
  emit('update:price', { min: localMin.value, max: localMax.value })
}

function onMinInput(event) {
  const value = Number(event.target.value)
  localMin.value = Math.min(Math.max(PRICE_MIN, value), localMax.value)
}

function onMaxInput(event) {
  const value = Number(event.target.value)
  localMax.value = Math.max(Math.min(PRICE_MAX, value), localMin.value)
}

function onMinCommit(event) {
  onMinInput(event)
  emitPrice()
}

function onMaxCommit(event) {
  onMaxInput(event)
  emitPrice()
}

const rangeStyle = computed(() => {
  const span = PRICE_MAX - PRICE_MIN || 1
  const left = ((localMin.value - PRICE_MIN) / span) * 100
  const right = ((localMax.value - PRICE_MIN) / span) * 100
  return {
    '--range-left': `${left}%`,
    '--range-right': `${right}%`,
  }
})
</script>

<template>
  <section class="filter-group">
    <h3 class="filter-group__title">Price Range</h3>

    <div class="price-range-wrap" :style="rangeStyle">
      <div class="price-range-track" aria-hidden="true"></div>
      <div class="price-range-fill" aria-hidden="true"></div>

      <input
        type="range"
        class="price-range"
        :class="{ 'is-active': activeThumb === 'min' }"
        :value="localMin"
        :min="PRICE_MIN"
        :max="PRICE_MAX"
        :step="STEP"
        aria-label="Minimum price"
        @pointerdown="activeThumb = 'min'"
        @pointerup="activeThumb = null"
        @blur="activeThumb = null"
        @input="onMinInput"
        @change="onMinCommit"
      />
      <input
        type="range"
        class="price-range"
        :class="{ 'is-active': activeThumb === 'max' }"
        :value="localMax"
        :min="PRICE_MIN"
        :max="PRICE_MAX"
        :step="STEP"
        aria-label="Maximum price"
        @pointerdown="activeThumb = 'max'"
        @pointerup="activeThumb = null"
        @blur="activeThumb = null"
        @input="onMaxInput"
        @change="onMaxCommit"
      />
    </div>

    <div class="price-inputs">
      <label class="price-field">
        <span class="price-field__label">Min</span>
        <span class="price-field__control">
          <span class="price-field__prefix" aria-hidden="true">$</span>
          <input
            type="number"
            :value="localMin"
            :min="PRICE_MIN"
            :max="localMax"
            :step="STEP"
            @change="onMinCommit"
          />
        </span>
      </label>
      <span class="price-dash" aria-hidden="true">–</span>
      <label class="price-field">
        <span class="price-field__label">Max</span>
        <span class="price-field__control">
          <span class="price-field__prefix" aria-hidden="true">$</span>
          <input
            type="number"
            :value="localMax"
            :min="localMin"
            :max="PRICE_MAX"
            :step="STEP"
            @change="onMaxCommit"
          />
        </span>
      </label>
    </div>
  </section>
</template>
