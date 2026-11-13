<script setup>
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import Footer from './components/layout/AppFooter.vue'
import Header from './components/layout/AppHeader.vue'
import Breadcrumbs from './components/AppBreadcrumbs.vue'
import QuickViewModal from './components/QuickViewModal.vue'
</script>

<template>
  <div class="shop">
    <Header />
    <Breadcrumbs />
    <main class="main">
      <RouterView />
    </main>
    <Footer />
    <QuickViewModal />
    <Toaster position="top-right" richColors closeButton />
  </div>
</template>
