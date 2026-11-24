<script setup lang="ts">
import '../assets/variant-picker.css'
import type { VariantOptions } from '../types/product'

defineProps<{
  optionKeys: string[]
  selectedOptions: VariantOptions
  optionValues: (key: string) => string[]
  swatchFor: (key: string, value: string) => string
}>()

const emit = defineEmits<{
  select: [key: string, value: string]
}>()
</script>

<template>
  <div class="variant-picker">
    <div v-for="key in optionKeys" :key="key" class="variant-picker__option">
      <span class="variant-picker__label">{{ key }}</span>
      <div class="variant-picker__values">
        <button
          v-for="value in optionValues(key)"
          :key="value"
          type="button"
          class="variant-picker__btn"
          :class="{
            'variant-picker__btn--active': selectedOptions[key] === value,
            'variant-picker__btn--swatch': Boolean(swatchFor(key, value)),
          }"
          :style="
            swatchFor(key, value) ? { backgroundColor: swatchFor(key, value) } : undefined
          "
          :aria-label="`${key} ${value}`"
          :title="value"
          @click="emit('select', key, value)"
        >
          <span v-if="!swatchFor(key, value)">{{ value }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
