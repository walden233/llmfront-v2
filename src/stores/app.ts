import { defineStore } from 'pinia'

interface AppState {
  sidebarCollapsed: boolean
  globalLoading: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    globalLoading: false,
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setSidebar(value: boolean) {
      this.sidebarCollapsed = value
    },
    setGlobalLoading(value: boolean) {
      this.globalLoading = value
    },
  },
})
