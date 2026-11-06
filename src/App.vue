<script setup>
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import Footer from './components/layout/Footer.vue'
import Header from './components/layout/Header.vue'
import Breadcrumbs from './components/Breadcrumbs.vue'
</script>

<template>
  <div class="shop">
    <Header />
    <Breadcrumbs />
    <main class="main">
      <RouterView />
    </main>
    <Footer />
    <Toaster position="top-right" richColors closeButton />
  </div>
</template>
