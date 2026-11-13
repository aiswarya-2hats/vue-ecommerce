<script setup>
import Banner from '@/components/HomeBanner.vue'
import Categoryslider from '@/components/Categoryslider.vue'
import ProductSlider from '@/components/ProductSlider.vue'

const FeaturedProducts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
</script>

<template>
  <Banner />
  <ProductSlider :productIds="FeaturedProducts" />
  <Categoryslider category="home-decoration" title="Home decor" :limit="5" />
  <Categoryslider category="furniture" title="Furniture" :limit="5" />
</template>
