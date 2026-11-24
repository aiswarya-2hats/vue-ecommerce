<script setup lang="ts">
import { ref, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperInstance } from 'swiper'
import 'swiper/css'
import ProductCard from './ProductCard.vue'
import RequestError from './RequestError.vue'
import { getProducts } from '../services/productService'
import { primaryProductImage, hoverProductImage } from '../utils/productImage'
import type { Product } from '../types/product'
import '../assets/productslider.css'

const props = withDefaults(
  defineProps<{
    category: string
    limit?: number
    title?: string
    excludeId?: number | string | null
  }>(),
  {
    limit: 10,
    title: '',
    excludeId: null,
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
    const exclude = props.excludeId == null ? null : Number(props.excludeId)
    const list = await getProducts({
      category: props.category,
      limit: exclude == null ? props.limit : props.limit + 1,
    })
    products.value =
      exclude == null ? list : list.filter((p) => p.id !== exclude).slice(0, props.limit)
  } catch (err) {
    error.value = 'We couldn’t load these products. Check your connection and try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.category, props.limit, props.excludeId],
  () => {
    fetchProducts()
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="loading || error || products.length" class="product-slider container">
    <h2 v-if="title" class="product-slider__title">{{ title }}</h2>

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
