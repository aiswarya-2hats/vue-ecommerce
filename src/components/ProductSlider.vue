<script setup lang="ts">
import { ref, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperInstance } from 'swiper'
import 'swiper/css'
import ProductCard from './ProductCard.vue'
import RequestError from './RequestError.vue'
import { getProduct } from '../services/productService'
import { primaryProductImage, hoverProductImage } from '../utils/productImage'
import type { Product } from '../types/product'
import '../assets/productslider.css'

const props = withDefaults(
  defineProps<{
    productIds?: (number | string)[]
  }>(),
  {
    productIds: () => [],
  },
)

const swiperRef = ref<SwiperInstance | null>(null)
const isBeginning = ref(true)
const isEnd = ref(false)
const showNav = ref(false)
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

function onSwiper(swiper: SwiperInstance) {
  swiperRef.value = swiper
  syncNav(swiper)
  swiper.on('slideChange', () => syncNav(swiper))
  swiper.on('resize', () => syncNav(swiper))
  swiper.on('update', () => syncNav(swiper))
  swiper.on('lock', () => syncNav(swiper))
  swiper.on('unlock', () => syncNav(swiper))
}

function syncNav(swiper: SwiperInstance) {
  isBeginning.value = swiper.isBeginning
  isEnd.value = swiper.isEnd
  // Hide arrows when all slides fit (e.g. ≤4 on desktop)
  showNav.value = !swiper.isLocked
}

function slidePrev() {
  swiperRef.value?.slidePrev()
}

function slideNext() {
  swiperRef.value?.slideNext()
}

async function fetchProducts() {
  loading.value = true
  error.value = null

  try {
    if (!props.productIds.length) {
      products.value = []
      return
    }
    const results = await Promise.all(props.productIds.map((id) => getProduct(id)))
    products.value = results.filter((p): p is Product => Boolean(p))
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
  <div class="product-slider container">
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

    <div v-else class="product-slider__body" :class="{ 'product-slider__body--no-nav': !showNav }">
      <button
        v-if="showNav"
        type="button"
        class="swiper-button-prev"
        aria-label="Previous"
        :disabled="isBeginning"
        :class="{ 'swiper-button-disabled': isBeginning }"
        @click="slidePrev"
      >
        <svg
          class="swiper-navigation-icon"
          width="11"
          height="20"
          viewBox="0 0 11 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0.383 20.076c-.271-.271-.271-.711 0-.982L9.198 10.28.383 1.465c-.271-.271-.271-.711 0-.982.271-.271.711-.271.982 0l9.069 9.069c.402.402.402 1.053 0 1.455L1.365 20.076c-.271.271-.711.271-.982 0Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <button
        v-if="showNav"
        type="button"
        class="swiper-button-next"
        aria-label="Next"
        :disabled="isEnd"
        :class="{ 'swiper-button-disabled': isEnd }"
        @click="slideNext"
      >
        <svg
          class="swiper-navigation-icon"
          width="11"
          height="20"
          viewBox="0 0 11 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0.383 20.076c-.271-.271-.271-.711 0-.982L9.198 10.28.383 1.465c-.271-.271-.271-.711 0-.982.271-.271.711-.271.982 0l9.069 9.069c.402.402.402 1.053 0 1.455L1.365 20.076c-.271.271-.711.271-.982 0Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Swiper
        :slides-per-view="4"
        :space-between="16"
        :breakpoints="{
          0: { slidesPerView: 1.2 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
          1600: { slidesPerView: 4 },
        }"
        @swiper="onSwiper"
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
  </div>
</template>
