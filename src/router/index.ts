import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layouts/app/AppLayout.vue'
import AuthLayout from '@/layouts/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: AuthLayout,
    meta: { guest: true, title: '登录' },
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { guest: true, title: '登录' },
      },
    ],
  },
  {
    path: '/register',
    component: AuthLayout,
    meta: { guest: true, title: '注册' },
    children: [
      {
        path: '',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { guest: true, title: '注册' },
      },
    ],
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/OverviewView.vue'),
        meta: { requiresAuth: true, title: '概览' },
      },
      {
        path: 'access-keys',
        name: 'AccessKeys',
        component: () => import('@/views/access-keys/AccessKeyList.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ROLE_USER', 'ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'],
          title: 'Access Keys',
        },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/orders/OrderList.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ROLE_USER', 'ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'],
          title: '我的订单',
        },
      },
      {
        path: 'models',
        name: 'Models',
        component: () => import('@/views/models/ModelList.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ROLE_USER', 'ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'],
          title: '可用模型',
        },
      },
      {
        path: 'logs',
        name: 'UsageLogs',
        component: () => import('@/views/logs/UsageLogView.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ROLE_USER', 'ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'],
          title: '调用日志',
        },
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/chat/ChatView.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ROLE_USER', 'ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'],
          title: '智能聊天',
        },
      },
      {
        path: 'image',
        name: 'Image',
        component: () => import('@/views/image/ImageView.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ROLE_USER', 'ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'],
          title: '图像生成',
        },
      },
      {
        path: 'admin/models',
        name: 'AdminModels',
        component: () => import('@/views/admin/models/AdminModelList.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'],
          title: '模型管理',
        },
      },
      {
        path: 'admin/providers',
        name: 'AdminProviders',
        component: () => import('@/views/admin/providers/ProviderList.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'],
          title: '供应商管理',
        },
      },
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/users/UserList.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ROLE_ROOT_ADMIN'],
          title: '用户管理',
        },
      },
      {
        path: 'admin/orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/orders/AdminOrderList.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ROLE_ROOT_ADMIN'],
          title: '订单管理',
        },
      },
    ],
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/ForbiddenView.vue'),
    meta: { title: '无权限' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta?.guest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  if (to.meta?.roles && !authStore.hasRole(to.meta.roles)) {
    next({ name: 'Forbidden' })
    return
  }

  const title = to.meta?.title ? `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE}` : import.meta.env.VITE_APP_TITLE
  if (title) {
    document.title = title
  }

  next()
})

export default router
