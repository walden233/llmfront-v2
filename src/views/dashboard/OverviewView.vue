<template>
  <div class="app-page dashboard">
    <div class="dashboard__banner">
      <div>
        <p class="eyebrow">控制台</p>
        <h2>欢迎，{{ authStore.username }}</h2>
        <p class="text-muted">在这里查看核心指标、调度模型、管理 Access Key 与订单。</p>
        <div class="dashboard__actions">
          <el-button type="primary" size="large" @click="router.push({ name: 'AccessKeys' })">
            快速创建 Access Key
          </el-button>
          <span class="badge badge--ghost">一键启动模型体验</span>
        </div>
      </div>
      <div class="dashboard__halo" aria-hidden="true" />
    </div>

    <div class="dashboard__metrics">
      <el-card v-for="metric in metrics" :key="metric.label" shadow="hover" class="metric-card">
        <p class="metric__label">{{ metric.label }}</p>
        <p class="metric__value">{{ metric.value }}</p>
        <p class="metric__desc">{{ metric.desc }}</p>
      </el-card>
    </div>

    <el-card class="dashboard__placeholder" shadow="never">
      <template #header>近期动态</template>
      <p>统计接口尚未接入，可在此展示模型使用量、任务完成率等图表。</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const metrics = computed(() => [
  { label: '账户角色', value: authStore.user?.role ?? 'N/A', desc: '当前用户的权限角色' },
  { label: '本月调用次数', value: 0, desc: '接入统计后展示' },
  {
    label: '余额',
    value: `¥${authStore.user?.balance?.toFixed(2) ?? '0.00'}`,
    desc: '当前账户可用余额 (元)',
  },
  { label: '活跃 Access Key', value: 0, desc: 'Access Key 列表统计' },
])
</script>

<style scoped>
.dashboard__banner {
  position: relative;
  overflow: hidden;
  padding: 20px 24px;
  border-radius: 18px;
  background: linear-gradient(115deg, rgba(37, 99, 235, 0.2), rgba(14, 165, 233, 0.18), #ffffff);
  border: 1px solid #e0e7ff;
  box-shadow: var(--app-shadow-soft);
}

.dashboard__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.dashboard__halo {
  position: absolute;
  width: 280px;
  height: 280px;
  right: -80px;
  top: -120px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.25), transparent 55%);
  filter: blur(10px);
}

.dashboard__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.metric-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: var(--app-shadow-soft);
  background: linear-gradient(180deg, #ffffff, #f8fbff);
}

.metric__label {
  margin: 0;
  font-size: 14px;
  color: var(--app-muted);
}

.metric__value {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
}

.metric__desc {
  margin: 8px 0 0;
  color: #94a3b8;
}

.dashboard__placeholder {
  margin-top: 8px;
  border-radius: 14px;
  border: 1px dashed #d0d7e3;
}
</style>
