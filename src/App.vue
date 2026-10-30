<script setup>
import Footer from './components/layout/Footer.vue'
import Header from './components/layout/Header.vue'
</script>

<template>
  <div class="shop">
    <Header />
    <main class="main">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>
