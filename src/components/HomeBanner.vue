<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import '../assets/banner.css'

import fragrances from '../assets/images/fragrance..webp'
import Groceries from '../assets/images/Groceries.png'
import Electrical from '../assets/images/Electrical.png'
import furniture from '../assets/images/furniture.png'

const modules = [Autoplay, Pagination, Navigation]

const banners = [
  {
    image: fragrances,
    alt: 'Fragrance edit',
    heading: 'Fragrance edit',
    text: 'Signature scents that linger — light, warm, and bold.',
    buttonLabel: 'Shop fragrance',
    buttonTo: '/products?category=fragrances',
  },
  {
    image: Groceries,
    alt: 'Groceries',
    heading: 'Groceries',
    text: 'Fresh pantry staples and everyday essentials for your kitchen.',
    buttonLabel: 'Shop groceries',
    buttonTo: '/products?category=groceries',
  },
  {
    image: Electrical,
    alt: 'Electronics',
    heading: 'Electronics',
    text: 'Electronics for your home and office.',
    buttonLabel: 'Shop electronics',
    buttonTo: '/products?category=smartphones',
  },
  {
    image: furniture,
    alt: 'Furniture',
    heading: 'Furniture',
    text: 'Soft textures and clean forms for rooms that feel lived-in.',
    buttonLabel: 'Shop furniture',
    buttonTo: '/products?category=furniture',
  },
]
</script>

<template>
  <div class="home-banner section-gap">
    <Swiper
      class="home__banner"
      :modules="modules"
      :loop="true"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
      navigation
    >
      <SwiperSlide v-for="(banner, index) in banners" :key="index">
        <div class="home__banner-slide">
          <img :src="banner.image" :alt="banner.alt" />
          <div class="home__banner-overlay">
            <h2>{{ banner.heading }}</h2>
            <p>{{ banner.text }}</p>
            <router-link :to="banner.buttonTo" class="home__cta">
              {{ banner.buttonLabel }}
            </router-link>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>
