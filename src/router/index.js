import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/plots',
      name: 'plots',
      component: () => import('../views/PlotsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/batches',
      name: 'batches',
      component: () => import('../views/BatchesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/batches/:id',
      name: 'batchDetail',
      component: () => import('../views/BatchDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/care',
      name: 'care',
      component: () => import('../views/CareLogsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/harvest',
      name: 'harvest',
      component: () => import('../views/HarvestView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/financial',
      name: 'financial',
      component: () => import('../views/FinancialView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/pest',
      name: 'pest',
      component: () => import('../views/PestView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('../views/TasksView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/sensors',
      name: 'sensors',
      component: () => import('../views/SensorsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('userRole') || 'user'

  if (to.meta.requiresAuth && !token) return next('/login')
  if (to.meta.guestOnly && token) return next('/dashboard')
  if (to.meta.adminOnly && role !== 'admin') return next('/dashboard')
  next()
})

export default router
