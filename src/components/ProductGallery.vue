<script setup>
import { ref, watch } from 'vue'
import ProductImage from './ProductImage.vue'

const props = defineProps({
  images: { type: Array, default: () => [] },
  image: { type: String, default: '' },
  alt: { type: String, default: '' },
  wishlisted: { type: Boolean, default: false },
})

defineEmits(['toggle-wish'])

const activeImage = ref(props.image || props.images[0] || '')

watch(
  () => props.image,
  (src) => {
    if (src) activeImage.value = src
  },
)

watch(
  () => props.images,
  (list) => {
    if (!activeImage.value && list?.length) activeImage.value = list[0]
  },
)

function selectImage(src) {
  if (src) activeImage.value = src
}
</script>

<template>
  <div class="detail__gallery">
    <div class="detail__main-image">
      <ProductImage :src="activeImage" :alt="alt" />
      <button
        type="button"
        class="detail__wish"
        :class="{ 'detail__wish--active': wishlisted }"
        :aria-label="wishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
        :aria-pressed="wishlisted"
        @click="$emit('toggle-wish')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
          />
        </svg>
      </button>
    </div>

    <div v-if="images.length > 1" class="detail__thumbs">
      <button
        v-for="(src, index) in images"
        :key="`${src}-${index}`"
        type="button"
        class="detail__thumb"
        :class="{ 'detail__thumb--active': src === activeImage }"
        :aria-label="`View image ${index + 1}`"
        @click="selectImage(src)"
      >
        <ProductImage :src="src" :alt="`${alt} thumbnail ${index + 1}`" />
      </button>
    </div>
  </div>
</template>
