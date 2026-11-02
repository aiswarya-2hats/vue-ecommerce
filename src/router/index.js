import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import ProductListingPage from '../pages/ProductListingPage.vue'
import DetailPage from '../pages/DetailPage.vue'
import CartPage from '../pages/CartPage.vue'

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
    {
      path: '/products/:id',
      name: 'product-detail',
      component: DetailPage,
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartPage,
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: DetailPage,
    },
  ],
})

export default router
