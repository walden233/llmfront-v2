<template>
  <div class="auth-layout">
    <div class="auth-layout__panel">
      <AppLogo subtitle="模型代理平台" />
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppLogo from '@/components/common/AppLogo.vue'
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: radial-gradient(circle at top, rgba(22, 93, 255, 0.15), transparent 40%), #f7f7fb;
}

.auth-layout__panel {
  width: min(420px, 100%);
  padding: 36px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 40px rgba(43, 52, 69, 0.12);
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
