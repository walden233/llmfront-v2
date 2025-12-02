<template>
  <el-container class="app-layout">
    <el-aside :width="sidebarWidth">
      <div class="app-layout__logo">
        <AppLogo />
      </div>
      <el-menu
        :default-active="activeMenu"
        class="app-layout__menu"
        @select="handleMenuSelect"
        :collapse="appStore.sidebarCollapsed"
      >
        <template v-for="item in visibleMenus" :key="item.name">
          <el-menu-item :index="item.name" :disabled="item.disabled">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-layout__header">
        <el-button link @click="appStore.toggleSidebar">
          <el-icon>
            <component :is="appStore.sidebarCollapsed ? Expand : Fold" />
          </el-icon>
        </el-button>
        <div class="app-layout__spacer" />
        <el-dropdown>
          <span class="app-layout__user">
            <el-avatar size="small">{{ initials }}</el-avatar>
            <span>{{ authStore.username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>{{ authStore.role }}</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Fold,
  Expand,
  Histogram,
  Key,
  Tickets,
  Box,
  ChatDotRound,
  Picture,
  Document,
  Setting,
  Service,
  User,
} from '@element-plus/icons-vue'
import AppLogo from '@/components/common/AppLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

interface MenuItem {
  name: string
  label: string
  icon: any
  roles?: string[]
  disabled?: boolean
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const rawMenus: MenuItem[] = [
  { name: 'Dashboard', label: '概览', icon: Histogram },
  { name: 'Chat', label: '智能聊天', icon: ChatDotRound },
  { name: 'Image', label: '图像生成', icon: Picture },
  { name: 'AccessKeys', label: 'Access Keys', icon: Key },
  { name: 'Orders', label: '我的订单', icon: Tickets },
  { name: 'Models', label: '可用模型', icon: Box },
  { name: 'UsageLogs', label: '调用日志', icon: Document },
  {
    name: 'AdminModels',
    label: '模型管理',
    icon: Setting,
    roles: ['ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'],
  },
  {
    name: 'AdminProviders',
    label: '供应商管理',
    icon: Service,
    roles: ['ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'],
  },
  {
    name: 'AdminUsers',
    label: '用户管理',
    icon: User,
    roles: ['ROLE_ROOT_ADMIN'],
  },
  {
    name: 'AdminOrders',
    label: '订单管理',
    icon: Tickets,
    roles: ['ROLE_ROOT_ADMIN'],
  },
]

const visibleMenus = computed(() =>
  rawMenus.filter((menu) => (menu.roles?.length ? authStore.hasRole(menu.roles) : true)),
)

const activeMenu = computed(() => (route.name ? route.name.toString() : ''))

const sidebarWidth = computed(() => (appStore.sidebarCollapsed ? '80px' : '220px'))

const initials = computed(() => authStore.username.slice(0, 2).toUpperCase())

const handleMenuSelect = (name: string) => {
  if (!name || name === route.name) {
    return
  }
  router.push({ name })
}

const handleLogout = () => {
  authStore.logout()
  router.replace({ name: 'Login' })
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
  background: transparent;
}

.app-layout__logo {
  padding: 22px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.app-layout__menu {
  border-right: none;
  padding: 12px 10px;
}

.app-layout__header {
  display: flex;
  align-items: center;
  gap: 16px;
  height: var(--app-header-height);
  padding: 0 20px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px) saturate(1.1);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.06);
}

.app-layout__spacer {
  flex: 1;
}

.app-layout__user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 999px;
  background: linear-gradient(120deg, rgba(37, 99, 235, 0.14), rgba(14, 165, 233, 0.14));
}

:deep(.el-aside) {
  background: linear-gradient(180deg, #0f172a 0%, #111827 60%, #0b1224 100%);
  color: #fff;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 10px 0 40px rgba(15, 23, 42, 0.35);
}

:deep(.el-menu) {
  background-color: transparent;
  color: #fff;
  --el-menu-text-color: rgba(255, 255, 255, 0.78);
  --el-menu-active-color: #fff;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.32), rgba(14, 165, 233, 0.28));
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
}

:deep(.el-menu-item) {
  border-radius: 12px;
  margin: 4px 6px;
  transition: transform 0.18s ease, background 0.18s ease;
}

:deep(.el-menu-item:not(.is-active):hover) {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

:deep(.el-header) {
  padding: 0;
}

:deep(.el-main) {
  padding: 0;
  background: transparent;
}
</style>
