<script setup>
import { ref, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import ProductCard from './ProductCard.vue'
import RequestError from './RequestError.vue'
import { getProduct } from '../services/productService'
import { primaryProductImage, hoverProductImage } from '../utils/productImage'
import '../assets/productslider.css'

const props = defineProps({
  productIds: {
    type: Array,
    default: () => [],
  },
})

const modules = [Navigation]
const products = ref([])
const loading = ref(true)
const error = ref(null)

async function fetchProducts() {
  loading.value = true
  error.value = null

  try {
    if (!props.productIds.length) {
      products.value = []
      return
    }
    const results = await Promise.all(props.productIds.map((id) => getProduct(id)))
    products.value = results.filter(Boolean)
  } catch (err) {
    error.value = 'We couldn’t load featured products. Check your connection and try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.productIds,
  () => {
    fetchProducts()
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="product-slider section-gap">
    <template v-if="loading">
      <div class="product-slider__skeleton" aria-busy="true" aria-label="Loading products">
        <div v-for="n in 4" :key="n" class="product-slider__skeleton-card">
          <div class="product-slider__skeleton-image"></div>
          <div class="product-slider__skeleton-line"></div>
          <div class="product-slider__skeleton-line product-slider__skeleton-line--short"></div>
          <div class="product-slider__skeleton-line"></div>
        </div>
      </div>
    </template>

    <RequestError v-else-if="error" :message="error" @retry="fetchProducts" />

    <Swiper
      v-else
      :modules="modules"
      :slides-per-view="4"
      :space-between="16"
      navigation
      :breakpoints="{
        0: { slidesPerView: 1.2 },
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 4 },
      }"
    >
      <SwiperSlide v-for="product in products" :key="product.id">
        <ProductCard
          :id="product.id"
          :image="primaryProductImage(product)"
          :hover-image="hoverProductImage(product)"
          :title="product.title"
          :stock="product.stock"
          :rating="product.rating"
          :price="product.price"
          :discount="product.discountPercentage"
          :brand="product.brand"
        />
      </SwiperSlide>
    </Swiper>
  </div>
</template>
