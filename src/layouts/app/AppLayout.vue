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
import { Fold, Expand, Histogram, Key, Tickets, Box } from '@element-plus/icons-vue'
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
  { name: 'AccessKeys', label: 'Access Keys', icon: Key },
  { name: 'Models', label: '模型管理', icon: Box, roles: ['ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN'], disabled: true },
  { name: 'Orders', label: '订单管理', icon: Tickets, roles: ['ROLE_ROOT_ADMIN'], disabled: true },
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
}

.app-layout__logo {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.app-layout__menu {
  border-right: none;
}

.app-layout__header {
  display: flex;
  align-items: center;
  gap: 16px;
  height: var(--app-header-height);
  border-bottom: 1px solid #f0f0f0;
}

.app-layout__spacer {
  flex: 1;
}

.app-layout__user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

:deep(.el-aside) {
  background-color: #111827;
  color: #fff;
}

:deep(.el-menu) {
  background-color: transparent;
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.1);
}

:deep(.el-menu-item) {
  border-radius: 8px;
  margin: 4px 8px;
}
</style>
