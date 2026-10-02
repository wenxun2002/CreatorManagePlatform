import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true, titleKey: 'routes.login' },
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { titleKey: 'routes.dashboard' },
        },
        {
          path: 'campaigns',
          name: 'campaigns',
          component: () => import('@/views/CampaignsView.vue'),
          meta: { titleKey: 'routes.campaigns' },
        },
        {
          path: 'content',
          name: 'content',
          component: () => import('@/views/ContentView.vue'),
          meta: { titleKey: 'routes.content' },
        },
        {
          path: 'wallet',
          name: 'wallet',
          component: () => import('@/views/WalletView.vue'),
          meta: { titleKey: 'routes.wallet' },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const isPublic = to.meta.public === true

  if (!isPublic && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
