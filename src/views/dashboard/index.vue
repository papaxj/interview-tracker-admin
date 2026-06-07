<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getCompanyList, type CompanyVo } from '@/api/company'
import { getJobApplicationList, type JobApplicationVo } from '@/api/application'
import { getOfferList } from '@/api/offer'
import { useAppStore } from '@/stores/app'
import {
  OfficeBuilding,
  Document,
  Trophy,
  Plus,
  DataBoard,
} from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()
const loading = ref(false)

// ---- 数据 ----
const companies = ref<CompanyVo[]>([])
const allApps = ref<JobApplicationVo[]>([])
const stats = ref({ companies: 0, applications: 0, offers: 0 })

const companyMap = computed<Record<number, string>>(() =>
  Object.fromEntries(companies.value.map((c) => [c.id, c.name ?? `ID-${c.id}`])),
)

// ---- 图表 refs ----
const trendChartRef = ref<HTMLDivElement>()
const statusChartRef = ref<HTMLDivElement>()
const companyChartRef = ref<HTMLDivElement>()
const cityChartRef = ref<HTMLDivElement>()

let trendChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null
let companyChart: echarts.ECharts | null = null
let cityChart: echarts.ECharts | null = null

let initDone = false

// ---- 加载数据 ----
async function loadData() {
  loading.value = true
  const userId = appStore.currentUserId
  console.log('[Dashboard] loading data for userId:', userId)

  // 独立调用，单个失败不影响其他
  const settled = await Promise.allSettled([
    getCompanyList({ page: 1, size: 200, userId }),
    getJobApplicationList({ page: 1, size: 1000, userId }),
    getOfferList({ page: 1, size: 1 }),
  ])

  let totalCompanies = 0
  let totalApps = 0
  let totalOffers = 0

  if (settled[0].status === 'fulfilled') {
    const cRes = settled[0].value
    companies.value = cRes.content
    totalCompanies = cRes.totalElements
  } else {
    console.error('[Dashboard] 公司列表加载失败:', settled[0].reason)
  }

  if (settled[1].status === 'fulfilled') {
    const aRes = settled[1].value
    allApps.value = aRes.content
    totalApps = aRes.totalElements
  } else {
    console.error('[Dashboard] 投递列表加载失败:', settled[1].reason)
  }

  if (settled[2].status === 'fulfilled') {
    totalOffers = settled[2].value.totalElements
  } else {
    console.error('[Dashboard] Offer列表加载失败:', settled[2].reason)
  }

  stats.value = {
    companies: totalCompanies,
    applications: totalApps,
    offers: totalOffers,
  }

  console.log('[Dashboard] stats:', stats.value, 'apps:', allApps.value.length, 'companies:', companies.value.length)

  loading.value = false
  await nextTick()
  renderCharts()
}

// ---- 月度趋势折线图 ----
function renderTrendChart() {
  if (!trendChartRef.value) return
  if (!trendChart) trendChart = echarts.init(trendChartRef.value)
  const months = collectMonthlyData()
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 8, right: 16, top: 20, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: months.map((m) => m.label),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
    },
    series: [
      {
        data: months.map((m) => m.count),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#4f6ef7' },
        itemStyle: { color: '#4f6ef7' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(79,110,247,0.12)' },
            { offset: 1, color: 'rgba(79,110,247,0)' },
          ]),
        },
      },
    ],
  })
}

function collectMonthlyData() {
  const now = new Date()
  const labels: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const counts = labels.map(() => 0)
  for (const app of allApps.value) {
    if (!app.applyDate) continue
    const key = app.applyDate.slice(0, 7) // "2026-06"
    const idx = labels.indexOf(key)
    if (idx >= 0) counts[idx]++
  }
  return labels.map((label, i) => ({ label, count: counts[i] }))
}

// ---- 状态分布饼图 ----
function renderStatusChart() {
  if (!statusChartRef.value) return
  if (!statusChart) statusChart = echarts.init(statusChartRef.value)
  const colors = ['#4f6ef7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']
  const statusMap: Record<string, number> = {}
  for (const app of allApps.value) {
    const s = app.status || '未知'
    statusMap[s] = (statusMap[s] || 0) + 1
  }
  const data = Object.entries(statusMap).map(([name, value], i) => ({
    name,
    value,
    itemStyle: { color: colors[i % colors.length] },
  }))
  statusChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      textStyle: { color: '#6b7280', fontSize: 11 },
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 12,
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { scaleSize: 6 },
        data,
      },
    ],
  })
}

// ---- 公司行业分布柱状图 ----
function renderCompanyChart() {
  if (!companyChartRef.value) return
  if (!companyChart) companyChart = echarts.init(companyChartRef.value)
  const count: Record<string, number> = {}
  for (const c of companies.value) {
    const ind = c.industry || '未分类'
    count[ind] = (count[ind] || 0) + 1
  }
  // 按数量降序，取前8
  const sorted = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  companyChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 10, right: 16, top: 12, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: sorted.map(([k]) => k),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 11, width: 80, overflow: 'truncate' },
      inverse: true,
    },
    series: [
      {
        data: sorted.map(([, v]) => v),
        type: 'bar',
        barWidth: 14,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#4f6ef7' },
            { offset: 1, color: '#818cf8' },
          ]),
        },
      },
    ],
  })
}

// ---- 城市分布柱状图 ----
function renderCityChart() {
  if (!cityChartRef.value) return
  if (!cityChart) cityChart = echarts.init(cityChartRef.value)
  const count: Record<string, number> = {}
  for (const app of allApps.value) {
    const city = app.workCity || '未知'
    count[city] = (count[city] || 0) + 1
  }
  const sorted = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  cityChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 16, top: 12, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: sorted.map(([k]) => k),
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
    },
    series: [
      {
        data: sorted.map(([, v]) => v),
        type: 'bar',
        barWidth: 24,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#10b981',
        },
      },
    ],
  })
}

function renderCharts() {
  renderTrendChart()
  renderStatusChart()
  renderCompanyChart()
  renderCityChart()
}

function resizeCharts() {
  trendChart?.resize()
  statusChart?.resize()
  companyChart?.resize()
  cityChart?.resize()
}

// ---- 快捷入口 ----
const quickItems = [
  { label: '新增公司', icon: Plus, path: '/company/form', color: '#4f6ef7' },
  { label: '公司管理', icon: OfficeBuilding, path: '/company', color: '#6366f1' },
  { label: '投递记录', icon: Document, path: '/application', color: '#10b981' },
  { label: 'Offer管理', icon: Trophy, path: '/offer', color: '#f59e0b' },
  { label: '数据字典', icon: DataBoard, path: '/dict', color: '#8b5cf6' },
]

// ---- 生命周期：先等用户列表就绪，再加载仪表盘数据 ----
onMounted(async () => {
  try {
    await appStore.loadMyUsers()
  } catch (e) {
    console.error('[Dashboard] loadMyUsers 失败:', e)
  }
  await loadData()
  initDone = true
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  trendChart?.dispose()
  statusChart?.dispose()
  companyChart?.dispose()
  cityChart?.dispose()
})

// 用户切换时重新加载（首次初始化不触发）
watch(() => appStore.currentUserId, () => {
  if (initDone) loadData()
})
</script>

<template>
  <div v-loading="loading" class="dashboard">
    <!-- 统计卡片 -->
    <div class="stat-row">
      <div class="stat-card clickable" @click="router.push('/company')">
        <div class="stat-card__icon" style="color: #4f6ef7; background: rgba(79,110,247,0.08)">
          <el-icon :size="20"><OfficeBuilding /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ stats.companies }}</span>
          <span class="stat-card__label">公司总数</span>
        </div>
      </div>
      <div class="stat-card clickable" @click="router.push('/application')">
        <div class="stat-card__icon" style="color: #10b981; background: rgba(16,185,129,0.08)">
          <el-icon :size="20"><Document /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ stats.applications }}</span>
          <span class="stat-card__label">投递记录</span>
        </div>
      </div>
      <div class="stat-card clickable" @click="router.push('/offer')">
        <div class="stat-card__icon" style="color: #f59e0b; background: rgba(245,158,11,0.08)">
          <el-icon :size="20"><Trophy /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ stats.offers }}</span>
          <span class="stat-card__label">Offer数量</span>
        </div>
      </div>
    </div>

    <!-- 图表区 第一行 -->
    <div class="chart-row">
      <el-card shadow="never" class="chart-card chart-card--wide">
        <template #header><span class="chart-title">月度投递趋势</span></template>
        <div ref="trendChartRef" class="chart-box"></div>
      </el-card>
      <el-card shadow="never" class="chart-card chart-card--narrow">
        <template #header><span class="chart-title">状态分布</span></template>
        <div ref="statusChartRef" class="chart-box"></div>
      </el-card>
    </div>

    <!-- 图表区 第二行 -->
    <div class="chart-row">
      <el-card shadow="never" class="chart-card chart-card--wide">
        <template #header><span class="chart-title">公司行业分布</span></template>
        <div ref="companyChartRef" class="chart-box"></div>
      </el-card>
      <el-card shadow="never" class="chart-card chart-card--narrow">
        <template #header><span class="chart-title">城市分布</span></template>
        <div ref="cityChartRef" class="chart-box"></div>
      </el-card>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-row">
      <div
        v-for="item in quickItems"
        :key="item.label"
        class="quick-item"
        @click="router.push(item.path)"
      >
        <span class="quick-item__icon" :style="{ color: item.color }">
          <el-icon :size="16"><component :is="item.icon" /></el-icon>
        </span>
        <span class="quick-item__label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.dashboard {
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  background: $card-bg;
  border: 1px solid $border-color;
  border-radius: $radius;

  &.clickable {
    cursor: pointer;
    transition: all $transition;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 2px 8px rgba(79,110,247,0.1);
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: $radius;
    flex-shrink: 0;
  }

  &__body {
    display: flex;
    flex-direction: column;
  }

  &__value {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    color: $text-color;
  }

  &__label {
    font-size: 13px;
    color: $text-secondary;
    margin-top: 2px;
  }
}

.chart-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.chart-card {
  :deep(.el-card__header) {
    padding: 14px 20px;
  }
  :deep(.el-card__body) {
    padding: 8px 16px 16px;
  }
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
}

.chart-box {
  width: 100%;
  height: 260px;
}

.quick-row {
  display: flex;
  gap: 10px;
}

.quick-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 0;
  background: $card-bg;
  border: 1px solid $border-color;
  border-radius: $radius;
  cursor: pointer;
  transition: all $transition;

  &:hover {
    border-color: $primary-color;
    background: $primary-light;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.1;
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: $text-secondary;
  }

  &:hover &__label {
    color: $text-color;
  }
}

@media (max-width: 900px) {
  .stat-row { grid-template-columns: 1fr; }
  .chart-row { grid-template-columns: 1fr; }
  .quick-row { flex-wrap: wrap; }
  .quick-item { flex: 1 1 calc(50% - 6px); }
}
</style>
