<script setup>
import '../assets/variant-picker.css'

defineProps({
  optionKeys: { type: Array, required: true },
  selectedOptions: { type: Object, required: true },
  optionValues: { type: Function, required: true },
  tone: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'overlay'].includes(value),
  },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div
    class="variant-picker"
    :class="{ 'variant-picker--overlay': tone === 'overlay' }"
  >
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
