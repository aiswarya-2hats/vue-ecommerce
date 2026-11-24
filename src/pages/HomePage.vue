<script setup lang="ts">
import Banner from '@/components/HomeBanner.vue'
import CategorySlider from '@/components/CategorySlider.vue'
import ProductSlider from '@/components/ProductSlider.vue'

const FeaturedProducts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
</script>

<template>
  <Banner />
  <ProductSlider :productIds="FeaturedProducts" />
  <CategorySlider category="home-decoration" title="Home decor" :limit="5" />
  <CategorySlider category="furniture" title="Furniture" :limit="5" />
</template>
