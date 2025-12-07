<template>
  <div class="simple-pie-chart">
    <svg
      v-if="slices.length"
      viewBox="0 0 320 320"
      :style="{ height: `${height}px` }"
      role="img"
      aria-label="调用占比饼图"
    >
      <g transform="translate(160, 160)">
        <template v-for="slice in slices" :key="slice.label">
          <path :d="slice.d" :fill="slice.color" fill-opacity="0.9" stroke="#fff" stroke-width="1" />
        </template>
      </g>
    </svg>
    <div v-else class="empty">暂无饼图数据</div>

    <div class="legend" v-if="slices.length">
      <div v-for="slice in slices" :key="`legend-${slice.label}`" class="legend-item">
        <span class="dot" :style="{ backgroundColor: slice.color }" />
        <div class="legend-text">
          <p class="legend-label">{{ slice.label }}</p>
          <p class="legend-desc">{{ slice.value }} 次 · {{ slice.percent }}%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface PieDatum {
  label: string
  value: number
  color?: string
}

const props = defineProps<{
  data: PieDatum[]
  height?: number
}>()

const palette = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#ef4444']

const buildFullCirclePath = (radius: number) =>
  ['M 0 0', `L 0 ${-radius}`, `A ${radius} ${radius} 0 1 1 0 ${radius}`, `A ${radius} ${radius} 0 1 1 0 ${-radius}`, 'Z'].join(
    ' ',
  )

const slices = computed(() => {
  const normalized = props.data
    .map((item) => ({ ...item, value: Math.max(item.value, 0) }))
    .filter((item) => item.value > 0)

  const total = normalized.reduce((sum, item) => sum + item.value, 0)
  if (!total) return []

  const radius = 130
  const singleSlice = normalized.length === 1

  if (singleSlice) {
    const item = normalized[0]
    const color = item.color ?? palette[0]
    return [
      {
        label: item.label,
        value: item.value,
        color,
        percent: '100.0',
        d: buildFullCirclePath(radius),
      },
    ]
  }

  let startAngle = -Math.PI / 2

  return normalized.map((item, index) => {
    const angle = (item.value / total) * Math.PI * 2
    const endAngle = startAngle + angle
    const startX = Math.cos(startAngle) * radius
    const startY = Math.sin(startAngle) * radius
    const endX = Math.cos(endAngle) * radius
    const endY = Math.sin(endAngle) * radius
    const largeArc = angle > Math.PI ? 1 : 0
    const pathData = [
      'M 0 0',
      `L ${startX.toFixed(2)} ${startY.toFixed(2)}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`,
      'Z',
    ].join(' ')
    const color = item.color ?? palette[index % palette.length]
    startAngle = endAngle
    return {
      label: item.label,
      value: item.value,
      color,
      percent: ((item.value / total) * 100).toFixed(1),
      d: pathData,
    }
  })
})

const height = computed(() => props.height ?? 280)
</script>

<style scoped>
.simple-pie-chart {
  display: grid;
  grid-template-columns: minmax(200px, 320px) 1fr;
  gap: 14px;
  align-items: start;
}

svg {
  width: 100%;
}

.legend {
  display: grid;
  gap: 8px;
}

.legend-item {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.legend-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-label {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
}

.legend-desc {
  margin: 0;
  color: #475569;
  font-size: 12px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.empty {
  min-height: 200px;
  display: grid;
  place-items: center;
  color: #94a3b8;
  font-size: 14px;
}
</style>
