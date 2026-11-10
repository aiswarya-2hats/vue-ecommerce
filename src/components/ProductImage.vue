<script setup>
import { toRef } from 'vue'
import { useProductImage } from '../utils/productImage'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  imgClass: { type: String, default: '' },
})

const { src: resolvedSrc, onError } = useProductImage(toRef(props, 'src'))
</script>

<template>
  <img :src="resolvedSrc" :alt="alt" :class="imgClass" @error="onError" />
</template>
