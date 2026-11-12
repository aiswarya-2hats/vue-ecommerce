import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
      meta: { breadcrumb: 'Home' },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../pages/ProductListingPage.vue'),
      meta: { breadcrumb: 'Products' },
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('../pages/ProductDetailPage.vue'),
      meta: {
        breadcrumb: (route) => `Product ${route.params.id}`,
        parent: { label: 'Products', path: '/products' },
      },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../pages/CartPage.vue'),
      meta: { breadcrumb: 'Cart' },
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: () => import('../pages/Wishlist.vue'),
      meta: { breadcrumb: 'Wishlist' },
    },
  ],
})

export default router
