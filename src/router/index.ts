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
          meta: { requiresAuth: true },
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
      ],
    },
  ],
})

export default router
