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
  background: linear-gradient(135deg, #1d4ed8, #22d3ee);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 12px 30px rgba(34, 211, 238, 0.35);
}

.app-logo__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.app-logo__subtitle {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.76);
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}
</style>
