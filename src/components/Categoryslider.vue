<script setup>
import { ref, nextTick, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import ProductCard from './ProductCard.vue'
import RequestError from './RequestError.vue'
import { getProducts, getVariantsForProduct } from '../services/productService'
import { primaryProductImage } from '../utils/productImage'
import '../assets/productslider.css'

const props = defineProps({
  category: {
    type: String,
    required: true,
  },
  limit: {
    type: Number,
    default: 10,
  },
  title: {
    type: String,
    default: '',
  },
})

const prevEl = ref(null)
const nextEl = ref(null)

const modules = [Navigation]
const products = ref([])
const loading = ref(true)
const error = ref(null)

async function bindNavigation(swiper) {
  await nextTick()
  if (!prevEl.value || !nextEl.value) return
  swiper.params.navigation.prevEl = prevEl.value
  swiper.params.navigation.nextEl = nextEl.value
  swiper.navigation.destroy()
  swiper.navigation.init()
  swiper.navigation.update()
}

async function fetchProducts() {
  loading.value = true
  error.value = null

  try {
    products.value = await getProducts({
      category: props.category,
      limit: props.limit,
    })
  } catch (err) {
    error.value = 'We couldn’t load these products. Check your connection and try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.category, props.limit],
  () => {
    fetchProducts()
  },
  { immediate: true },
)
</script>

<template>
  <div class="product-slider section-gap">
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

    <template v-else>
      <button ref="prevEl" type="button" class="product-slider__prev" aria-label="Previous"></button>
      <button ref="nextEl" type="button" class="product-slider__next" aria-label="Next"></button>
      <Swiper
        :modules="modules"
        :slides-per-view="4"
        :space-between="16"
        :navigation="true"
        :breakpoints="{
          0: { slidesPerView: 1.2 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }"
        @swiper="bindNavigation"
      >
        <SwiperSlide v-for="product in products" :key="product.id">
          <ProductCard
            :id="product.id"
            :image="primaryProductImage(product)"
            :title="product.title"
            :stock="product.stock"
            :rating="product.rating"
            :price="product.price"
            :discount="product.discountPercentage"
            :brand="product.brand"
            :variants="getVariantsForProduct(product.id)"
          />
        </SwiperSlide>
      </Swiper>
    </template>
  </div>
</template>
