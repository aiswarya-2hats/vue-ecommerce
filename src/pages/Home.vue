<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import '../assets/home.css'
import ProductSort from '@/components/ProductSort.vue'
import ProductListing from '@/components/ProductListing.vue'

const modules = [Autoplay, Pagination, Navigation]

const banners = [
  { id: 1, title: 'Beauty picks', image: '/images/beauty.jpeg', link: '/products' },
  { id: 2, title: 'New fragrances', image: '/images/furniture.jpeg', link: '/products' },
  { id: 3, title: 'Home & furniture', image: '/images/perfume.jpeg', link: '/products' },
]
</script>

<template>
  <div class="home">
    <Swiper
      class="home__banner"
      :modules="modules"
      :slides-per-view="1"
      :loop="true"
      :autoplay="{ delay: 3000 }"
      :pagination="{ clickable: true }"
      navigation
    >
      <SwiperSlide v-for="banner in banners" :key="banner.id">
        <RouterLink :to="banner.link" class="home__banner-slide">
          <img :src="banner.image" :alt="banner.title" />
          <div class="home__banner-content"></div>
          <h2>{{ banner.title }}</h2>
        </RouterLink>
      </SwiperSlide>
    </Swiper>

    <!-- keep or move your existing title / CTA below -->
    <h1 class="home__title">Nova<span>Shop</span></h1>
    ...
    <ProductSort />
    <ProductListing />
  </div>
</template>
