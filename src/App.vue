<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import Footer from './components/layout/AppFooter.vue'
import Header from './components/layout/AppHeader.vue'
import Breadcrumbs from './components/AppBreadcrumbs.vue'
import QuickViewModal from './components/QuickViewModal.vue'
import CartDrawer from './components/CartDrawer.vue'
</script>

<template>
  <div class="shop">
    <Header />
    <Breadcrumbs />
    <main class="main">
      <RouterView />
    </main>
    <Footer />
    <CartDrawer />
    <QuickViewModal />
    <Toaster position="top-right" richColors closeButton />
  </div>
</template>
