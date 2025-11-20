<script setup lang="ts">
const props = withDefaults(defineProps<{ subtitle?: string }>(), {
  subtitle: '运营控制台',
})
</script>

<template>
  <div class="app-logo">
    <div class="app-logo__symbol">LLM</div>
    <div>
      <p class="app-logo__title">LLM Proxy</p>
      <p class="app-logo__subtitle">{{ props.subtitle }}</p>
    </div>
  </div>
</template>

<style scoped>
.app-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo__symbol {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: linear-gradient(135deg, #165dff, #63a4ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  letter-spacing: 1px;
}

.app-logo__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.app-logo__subtitle {
  margin: 0;
  font-size: 12px;
  color: #888;
}
</style>
