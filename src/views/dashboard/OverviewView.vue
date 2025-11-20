<template>
  <div class="app-page dashboard">
    <div class="dashboard__header">
      <div>
        <h2>欢迎，{{ authStore.username }}</h2>
        <p class="text-muted">通过控制台管理模型、Access Key 与调用情况。</p>
      </div>
      <el-button type="primary" @click="router.push({ name: 'AccessKeys' })">
        快速创建 Access Key
      </el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="6" v-for="metric in metrics" :key="metric.label">
        <el-card shadow="hover">
          <p class="metric__label">{{ metric.label }}</p>
          <p class="metric__value">{{ metric.value }}</p>
          <p class="metric__desc">{{ metric.desc }}</p>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="dashboard__placeholder" shadow="never">
      <template #header>近期动态</template>
      <p>统计接口尚未接入，可在此展示模型使用量、任务完成率等图表。</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const metrics = ref([
  { label: '在线模型', value: 0, desc: '来自模型管理接口' },
  { label: '本月调用次数', value: 0, desc: '接入统计后展示' },
  { label: '余额', value: authStore.user?.balance ?? 0, desc: '当前账户可用余额 (元)' },
  { label: '活跃 Access Key', value: 0, desc: 'Access Key 列表统计' },
])
</script>

<style scoped>
.dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.metric__label {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.metric__value {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 600;
}

.metric__desc {
  margin: 8px 0 0;
  color: #999;
}

.dashboard__placeholder {
  margin-top: 24px;
}
</style>
