<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string
    retryable?: boolean
    retryLabel?: string
  }>(),
  {
    retryable: true,
    retryLabel: 'Retry',
  },
)

defineEmits<{
  retry: []
}>()
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
