<script setup>
import '../assets/variant-picker.css'

defineProps({
  optionKeys: { type: Array, required: true },
  selectedOptions: { type: Object, required: true },
  optionValues: { type: Function, required: true },
})

const emit = defineEmits(['select'])
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
          :class="{ 'variant-picker__btn--active': selectedOptions[key] === value }"
          @click="emit('select', key, value)"
        >
          {{ value }}
        </button>
      </div>
    </div>
  </div>
</template>
