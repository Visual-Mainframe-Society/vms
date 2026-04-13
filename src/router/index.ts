import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      meta: { requiresAuth: true },
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: '/explore',
          name: 'explore',
          component: () => import('@/views/ExploreView.vue'),
        },
        {
          path: '/cart',
          name: 'cart',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: '/notifications',
          name: 'notifications',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: '/studio',
          name: 'studio',
          component: () => import('@/views/StudioView.vue'),
        },
        {
          path: '/account',
          name: 'account',
          component: () => import('@/views/AccountView.vue'),
        },
      ],
    },
    {
      path: '/studio/add-artwork',
      name: 'add-artwork',
      component: () => import('@/views/ArtworkAddView.vue'),
    },
  ],
})

export default router
