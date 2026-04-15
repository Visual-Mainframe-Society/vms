import { createRouter, createWebHashHistory } from 'vue-router'
import { until } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { storeToRefs } from 'pinia'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    // ── Main app ───────────────────────────────────────────────────────────────
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/HomeView.vue') },
        { path: '/explore', name: 'explore', component: () => import('@/views/ExploreView.vue') },
        { path: '/cart', name: 'cart', component: () => import('@/views/CartView.vue') },
        {
          path: '/notifications',
          name: 'notifications',
          meta: { requiresAuth: true },
          component: () => import('@/views/NotificationsView.vue'),
        },
        {
          path: '/studio',
          name: 'studio',
          meta: { requiresAuth: true },
          component: () => import('@/views/StudioView.vue'),
        },
        {
          path: '/account',
          name: 'account',
          meta: { requiresAuth: true },
          component: () => import('@/views/AccountView.vue'),
        },
      ],
    },
    {
      path: '/studio/add-artwork',
      name: 'add-artwork',
      component: () => import('@/views/ArtworkAddView.vue'),
    },
    {
      path: '/studio/edit/:id',
      name: 'edit-artwork',
      component: () => import('@/views/ArtworkEditView.vue'),
    },
    // ── Admin ──────────────────────────────────────────────────────────────────
    {
      path: '/admin',
      meta: { requiresAdmin: true },
      component: () => import('@/layouts/AdminLayout.vue'),
      children: [
        {
          path: '',
          name: 'admin-queue',
          component: () => import('@/views/admin/ReviewQueueView.vue'),
        },
      ],
    },
  ],
})

// ── Guards ─────────────────────────────────────────────────────────────────────

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const profileStore = useProfileStore()

  const { ready: authReady } = storeToRefs(authStore)
  const { ready: profileReady } = storeToRefs(profileStore)

  if (!authReady.value) {
    await until(authReady).toBe(true)
  }

  if (!profileReady.value) {
    await until(profileReady).toBe(true)
  }

  if (to.name === 'add-artwork' && !authStore.isSignedIn) {
    return { name: 'account' }
  }

  if (to.name === 'edit-artwork' && !authStore.isSignedIn) {
    return { name: 'account' }
  }
})

export default router
