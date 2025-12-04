<template>
  <div class="app-page dashboard">
    <div class="dashboard__banner">
      <div>
        <p class="eyebrow">控制台</p>
        <h2>欢迎，{{ authStore.username }}</h2>
        <p class="text-muted">
          在这里查看核心指标、调度模型、管理 Access Key 与订单，统计数据已接入 StatisticsController。
        </p>
        <div class="dashboard__actions">
          <el-button type="primary" size="large" @click="router.push({ name: 'AccessKeys' })">
            快速创建 Access Key
          </el-button>
          <span class="badge badge--ghost">按日期过滤统计数据</span>
        </div>
      </div>
      <div class="dashboard__halo" aria-hidden="true" />
    </div>

    <el-card class="panel-card dashboard__filters" shadow="hover">
      <div class="filter-row">
        <div>
          <p class="eyebrow">统计筛选</p>
          <h3>模型使用情况</h3>
          <p class="text-muted">对接 /statistics/models，可按日期区间与模型标识过滤。</p>
        </div>
        <div class="filter-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            :clearable="false"
            :disabled="!canViewStatistics"
            @change="handleDateChange"
          />
          <el-input
            v-model="modelFilter"
            size="small"
            placeholder="模型标识 (可选)"
            clearable
            :disabled="!canViewStatistics"
            @keyup.enter="loadModelStats"
            style="width: 200px"
          />
          <el-button
            type="primary"
            size="small"
            :loading="loadingStats"
            :disabled="!canViewStatistics"
            @click="loadModelStats"
          >
            刷新统计
          </el-button>
        </div>
      </div>
    </el-card>

    <div class="dashboard__metrics">
      <el-card v-for="metric in metrics" :key="metric.label" shadow="hover" class="metric-card">
        <p class="metric__label">{{ metric.label }}</p>
        <p class="metric__value">{{ metric.value }}</p>
        <p class="metric__desc">{{ metric.desc }}</p>
      </el-card>
    </div>

    <div class="chart-grid panel-card">
      <div class="chart-panel">
        <div class="chart-panel__header">
          <div>
            <h3>调用趋势</h3>
            <p class="text-muted">按日期聚合的调用次数（/statistics/models）。</p>
          </div>
          <el-tag v-if="canViewStatistics" effect="light">时间：{{ dateRangeLabel }}</el-tag>
        </div>
        <div class="chart-panel__body">
          <el-skeleton v-if="loadingStats" animated :rows="4" />
          <el-empty v-else-if="!canViewStatistics" description="需要模型管理员权限才能查看聚合统计" />
          <SimpleLineChart
            v-else-if="lineSeries.length"
            :series="lineSeries"
            :height="320"
            :categories="dateCategories"
          />
          <el-empty v-else description="暂无统计数据" />
        </div>
      </div>

      <div class="chart-panel">
        <div class="chart-panel__header">
          <div>
            <h3>模型调用占比</h3>
            <p class="text-muted">按模型标识统计的调用次数分布。</p>
          </div>
        </div>
        <div class="chart-panel__body">
          <el-skeleton v-if="loadingStats" animated :rows="4" />
          <el-empty v-else-if="!canViewStatistics" description="需要模型管理员权限才能查看聚合统计" />
          <SimplePieChart v-else-if="pieData.length" :data="pieData" />
          <el-empty v-else description="暂无占比数据" />
        </div>
      </div>

      <div class="chart-panel">
        <div class="chart-panel__header">
          <div>
            <h3>成功 / 失败占比</h3>
            <p class="text-muted">从总调用中拆分成功与失败占比。</p>
          </div>
        </div>
        <div class="chart-panel__body">
          <el-skeleton v-if="loadingStats" animated :rows="4" />
          <SimplePieChart
            v-else-if="totalRequests"
            :data="[
              { label: '成功', value: successCount, color: chartPalette[2] },
              { label: '失败', value: failureCount, color: chartPalette[6] },
            ]"
          />
          <el-empty v-else description="暂无调用数据" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import SimpleLineChart from '@/components/charts/SimpleLineChart.vue'
import SimplePieChart from '@/components/charts/SimplePieChart.vue'
import { fetchModelStatistics } from '@/api/statistics'
import { useAuthStore } from '@/stores/auth'
import type { ModelStatisticsItem, ModelStatisticsQuery } from '@/types/statistics'

const router = useRouter()
const authStore = useAuthStore()

const chartPalette = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#ef4444']

const dateRange = ref<[Date, Date]>([
  dayjs().subtract(6, 'day').toDate(),
  dayjs().toDate(),
])
const modelFilter = ref('')

const loadingStats = ref(false)
const stats = ref<ModelStatisticsItem[]>([])

const canViewStatistics = computed(() => authStore.hasRole(['ROLE_MODEL_ADMIN', 'ROLE_ROOT_ADMIN']))

const dateRangeLabel = computed(() => {
  const [start, end] = dateRange.value
  return `${dayjs(start).format('MM/DD')} - ${dayjs(end).format('MM/DD')}`
})

const totalRequests = computed(() => stats.value.reduce((sum, item) => sum + (item.totalRequests || 0), 0))
const successCount = computed(() => stats.value.reduce((sum, item) => sum + (item.successCount || 0), 0))
const failureCount = computed(() => stats.value.reduce((sum, item) => sum + (item.failureCount || 0), 0))
const successRate = computed(() => (totalRequests.value ? (successCount.value / totalRequests.value) * 100 : 0))

const metrics = computed(() => [
  { label: '账户角色', value: authStore.user?.role ?? 'N/A', desc: '当前用户的权限角色' },
  { label: '统计区间', value: dateRangeLabel.value, desc: '查询的时间范围' },
  {
    label: '调用总数',
    value: totalRequests.value,
    desc: `成功 ${successCount.value} / 失败 ${failureCount.value}`,
  },
  { label: '成功率', value: `${successRate.value.toFixed(1)}%`, desc: '按统计接口实时计算' },
  {
    label: '余额',
    value: `¥${authStore.user?.balance?.toFixed(2) ?? '0.00'}`,
    desc: '当前账户可用余额 (元)',
  },
])

const dateCategories = computed(() => {
  const [start, end] = dateRange.value
  const result: string[] = []
  let cursor = dayjs(start).startOf('day')
  const endDay = dayjs(end).startOf('day')
  while (cursor.valueOf() <= endDay.valueOf()) {
    result.push(cursor.format('YYYY-MM-DD'))
    cursor = cursor.add(1, 'day')
  }
  return result
})

const statsByModel = computed(() => {
  const map = new Map<string, Map<string, ModelStatisticsItem>>()
  stats.value.forEach((item) => {
    const key = item.modelIdentifier || `模型${item.modelId ?? ''}`
    const dateKey = getStatDate(item)
    if (!dateKey) return
    const byDate = map.get(key) ?? new Map<string, ModelStatisticsItem>()
    byDate.set(dateKey, item)
    map.set(key, byDate)
  })
  return map
})

const modelTotals = computed(() =>
  Array.from(statsByModel.value.entries()).map(([key, value]) => {
    const summary = Array.from(value.values()).reduce(
      (acc, curr) => {
        acc.total += curr.totalRequests || 0
        acc.success += curr.successCount || 0
        acc.failure += curr.failureCount || 0
        return acc
      },
      { total: 0, success: 0, failure: 0 },
    )
    return { key, ...summary }
  }),
)

const sortedModelTotals = computed(() => [...modelTotals.value].sort((a, b) => b.total - a.total))

const lineSeries = computed(() => {
  if (!stats.value.length) return []
  const dates = dateCategories.value
  if (!dates.length) return []

  const aggregate = dates.map((date) => ({
    x: date,
    y: stats.value
      .filter((item) => getStatDate(item) === date)
      .reduce((sum, item) => sum + (item.totalRequests || 0), 0),
  }))

  const series = [
    { name: '总调用', color: chartPalette[0], data: aggregate },
  ]

  sortedModelTotals.value.slice(0, 3).forEach((model, index) => {
    const data = dates.map((date) => {
      const dayStat = statsByModel.value.get(model.key)?.get(date)
      return {
        x: date,
        y: dayStat?.totalRequests ?? 0,
      }
    })
    series.push({ name: model.key, color: chartPalette[(index + 1) % chartPalette.length], data })
  })

  return series
})

const pieData = computed(() =>
  sortedModelTotals.value
    .filter((item) => item.total > 0)
    .map((item, index) => ({
      label: item.key,
      value: item.total,
      color: chartPalette[(index + 1) % chartPalette.length],
    })),
)

const buildQueryPayload = (): ModelStatisticsQuery => {
  const payload: ModelStatisticsQuery = {}
  const [start, end] = dateRange.value
  if (start && end) {
    payload.startDate = dayjs(start).format('YYYY-MM-DD')
    payload.endDate = dayjs(end).format('YYYY-MM-DD')
  }
  if (modelFilter.value.trim()) {
    payload.modelIdentifier = modelFilter.value.trim()
  }
  return payload
}

const loadModelStats = async () => {
  if (!canViewStatistics.value) return
  loadingStats.value = true
  try {
    const payload = buildQueryPayload()
    stats.value = await fetchModelStatistics(payload)
  } finally {
    loadingStats.value = false
  }
}

const handleDateChange = () => {
  if (canViewStatistics.value) {
    loadModelStats()
  }
}

const normalizeDate = (value: string) => {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : value
}

const getStatDate = (item: ModelStatisticsItem) => normalizeDate(item.statDate || item.date || '')

onMounted(() => {
  if (canViewStatistics.value) {
    loadModelStats()
  }
})
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

.dashboard__filters {
  margin-top: 12px;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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
  font-size: 24px;
  font-weight: 700;
  word-break: break-all;
  line-height: 1.2;
}

.metric__desc {
  margin: 8px 0 0;
  color: #94a3b8;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 14px;
  padding: 16px;
}

.chart-panel {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  box-shadow: var(--app-shadow-soft);
}

.chart-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.chart-panel__body {
  margin-top: 8px;
  min-height: 280px;
}

</style>
