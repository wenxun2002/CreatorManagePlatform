import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { defaultHomeForRole } from '@/constants/nav'
import type { UserRole } from '@/types/auth'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    titleKey?: string
    roles?: UserRole[]
  }
}

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
          redirect: () => {
            const auth = useAuthStore()
            return defaultHomeForRole(auth.role)
          },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { titleKey: 'routes.dashboard', roles: ['creator'] },
        },
        {
          path: 'campaigns',
          name: 'campaigns',
          component: () => import('@/views/CampaignsView.vue'),
          meta: { titleKey: 'routes.campaigns', roles: ['creator', 'manager'] },
        },
        {
          path: 'content',
          name: 'content',
          component: () => import('@/views/ContentView.vue'),
          meta: { titleKey: 'routes.content', roles: ['creator'] },
        },
        {
          path: 'wallet',
          name: 'wallet',
          component: () => import('@/views/WalletView.vue'),
          meta: { titleKey: 'routes.wallet', roles: ['creator'] },
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
    return defaultHomeForRole(auth.role)
  }

  const allowedRoles = to.meta.roles
  if (allowedRoles?.length && auth.role && !allowedRoles.includes(auth.role)) {
    return defaultHomeForRole(auth.role)
  }

  return true
})

export default router
