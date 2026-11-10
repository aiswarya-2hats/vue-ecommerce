<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
  retryable: {
    type: Boolean,
    default: true,
  },
  retryLabel: {
    type: String,
    default: 'Retry',
  },
})

defineEmits(['retry'])
</script>

<template>
  <div class="request-error" role="alert">
    <p class="request-error__message">{{ message }}</p>
    <button
      v-if="retryable"
      type="button"
      class="btn btn--primary request-error__retry"
      @click="$emit('retry')"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>
