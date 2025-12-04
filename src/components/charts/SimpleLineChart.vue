<template>
  <div class="simple-line-chart">
    <svg
      :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
      :style="{ height: `${height}px` }"
      role="img"
      aria-label="模型调用趋势"
    >
      <g v-if="hasData">
        <line
          v-for="tick in yTicks"
          :key="`grid-${tick}`"
          :x1="padding.left"
          :x2="viewBoxWidth - padding.right"
          :y1="tickToY(tick)"
          :y2="tickToY(tick)"
          class="grid-line"
        />
        <line
          :x1="padding.left"
          :x2="viewBoxWidth - padding.right"
          :y1="viewBoxHeight - padding.bottom"
          :y2="viewBoxHeight - padding.bottom"
          class="axis-line"
        />
        <line
          :x1="padding.left"
          :x2="padding.left"
          :y1="padding.top"
          :y2="viewBoxHeight - padding.bottom"
          class="axis-line"
        />

        <g v-for="(label, index) in categoryLabels" :key="`x-${label}-${index}`">
          <text
            :x="padding.left + index * xStep"
            :y="viewBoxHeight - padding.bottom + 24"
            text-anchor="middle"
            class="tick-label"
          >
            {{ label }}
          </text>
        </g>

        <g v-for="tick in yTicks" :key="`tick-${tick}`">
          <text
            :x="padding.left - 10"
            :y="tickToY(tick) + 4"
            text-anchor="end"
            class="tick-label"
          >
            {{ tick }}
          </text>
        </g>

        <template v-for="series in resolvedSeries" :key="series.name">
          <path :d="buildPath(series)" :stroke="series.color" class="line-path" />
          <template v-for="point in buildPoints(series)" :key="`${series.name}-${point.x}-${point.y}`">
            <circle :cx="point.x" :cy="point.y" r="4" :fill="series.color" class="point" />
          </template>
        </template>
      </g>
      <text v-else x="50%" y="50%" text-anchor="middle" class="empty-text">暂无折线数据</text>
    </svg>

    <div class="chart-legend" v-if="resolvedSeries.length">
      <div v-for="series in resolvedSeries" :key="`legend-${series.name}`" class="legend-item">
        <span class="dot" :style="{ backgroundColor: series.color }" />
        <span class="legend-label">{{ series.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

interface LineSeries {
  name: string
  color?: string
  data: { x: string; y: number }[]
}

const props = defineProps<{
  series: LineSeries[]
  height?: number
  categories?: string[]
}>()

const viewBoxWidth = 880
const defaultHeight = 320
const padding = { top: 12, right: 24, bottom: 48, left: 64 }

const viewBoxHeight = computed(() => props.height ?? defaultHeight)

const palette = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#ef4444']

const resolvedSeries = computed(() =>
  props.series
    .filter((s) => s.data && s.data.length)
    .map((s, index) => ({
      ...s,
      color: s.color ?? palette[index % palette.length],
      data: s.data.map((item) => ({
        x: item.x,
        y: item.y,
      })),
    })),
)

const compareKey = (a: string, b: string) => {
  const aDate = dayjs(a)
  const bDate = dayjs(b)
  if (aDate.isValid() && bDate.isValid()) return aDate.valueOf() - bDate.valueOf()
  return a.localeCompare(b)
}

const inferredCategories = computed(() => {
  const collected = new Set<string>()
  resolvedSeries.value.forEach((s) => s.data.forEach((item) => collected.add(item.x)))
  return Array.from(collected).sort(compareKey)
})

const categoryKeys = computed(() => {
  if (props.categories && props.categories.length) {
    return props.categories.map((item) => item)
  }
  return inferredCategories.value
})

const categoryLabels = computed(() => categoryKeys.value.map((key) => formatLabel(key)))

const hasData = computed(() => resolvedSeries.value.some((s) => s.data.length))

const yMax = computed(() => {
  const maxValue = Math.max(
    ...resolvedSeries.value.flatMap((series) => series.data.map((item) => item.y)),
    0,
  )
  return maxValue > 0 ? maxValue : 1
})

const yTicks = computed(() => {
  const step = yMax.value / 4
  return Array.from({ length: 5 }, (_, index) => Number((index * step).toFixed(1)))
})

const xStep = computed(() => {
  const count = Math.max(categoryKeys.value.length - 1, 1)
  return (viewBoxWidth - padding.left - padding.right) / count
})

const yUnit = computed(() => (viewBoxHeight.value - padding.top - padding.bottom) / yMax.value)

const tickToY = (tick: number) =>
  viewBoxHeight.value - padding.bottom - Math.min(tick, yMax.value) * yUnit.value

const buildPoints = (series: LineSeries & { color?: string }) =>
  categoryKeys.value.map((key, index) => {
    const matched = series.data.find((item) => item.x === key)
    const value = matched?.y ?? 0
    return {
      x: padding.left + index * xStep.value,
      y: viewBoxHeight.value - padding.bottom - value * yUnit.value,
    }
  })

const buildPath = (series: LineSeries & { color?: string }) => {
  const points = buildPoints(series)
  if (!points.length) return ''
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
}

function formatLabel(value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('MM-DD') : value
}

const height = computed(() => props.height ?? defaultHeight)
</script>

<style scoped>
.simple-line-chart {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

svg {
  width: 100%;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
  opacity: 0.7;
}

.axis-line {
  stroke: #cbd5e1;
  stroke-width: 1.5;
}

.tick-label {
  font-size: 12px;
  fill: #94a3b8;
}

.line-path {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
}

.point {
  stroke: #fff;
  stroke-width: 2;
  filter: drop-shadow(0 1px 2px rgba(15, 23, 42, 0.12));
}

.empty-text {
  fill: #cbd5e1;
  font-size: 14px;
}

.chart-legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  color: #475569;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-label {
  white-space: nowrap;
}
</style>
