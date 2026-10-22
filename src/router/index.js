import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import ProductListingPage from '../pages/ProductListingPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/products',
      name: 'products',
      component: ProductListingPage,
    },
  ],
})

export default router
