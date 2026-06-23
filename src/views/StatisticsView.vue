<template>
  <main class="page-shell">
    <section class="hero-card card">
      <article class="hero-copy">
        <p class="eyebrow">统计中心</p>
        <h1 class="page-title">按月份与年份查看财务趋势。</h1>
        <p class="lead">
          选择月份或年份，即可切换收入、支出、结余、储蓄率和消费占比。
        </p>
      </article>

      <aside class="mini-panel word-cloud-card">
        <div v-if="remarkCloud.length" class="word-cloud">
          <span
            v-for="item in remarkCloud"
            :key="item.word"
            class="word-tag"
            :style="{ fontSize: item.size, opacity: item.opacity }"
          >
            {{ item.word }}
          </span>
        </div>
        <p v-else class="form-hint">当前暂无备注内容可生成词云。</p>
      </aside>
    </section>

    <section class="grid two-col" style="margin-top: 18px">
      <article class="summary-card card">
        <p class="eyebrow">按月份查询</p>
        <h2 class="page-title" style="font-size: 1.15rem; margin-top: 6px">本月概览</h2>
        <div class="filter-row" style="margin-top: 10px">
          <label class="mini-label">
            月份
            <select v-model="selectedMonth">
              <option value="">全部月份</option>
              <option v-for="month in monthOptions" :key="month" :value="month">
                {{ monthLabel(month) }}
              </option>
            </select>
          </label>
        </div>
        <div class="summary-grid">
          <article class="mini-stat-box">
            <span>收入</span
            ><strong class="positive">{{ formatCurrency(monthlyIncomeTotal) }}</strong>
          </article>
          <article class="mini-stat-box">
            <span>支出</span><strong>{{ formatCurrency(monthlyExpenseTotal) }}</strong>
          </article>
          <article class="mini-stat-box">
            <span>结余</span><strong class="positive">{{ formatCurrency(monthlyNetTotal) }}</strong>
          </article>
          <article class="mini-stat-box">
            <span>储蓄率</span><strong class="positive">{{ monthlySavingsRate }}%</strong>
          </article>
        </div>
        <p class="lead" style="margin-top: 10px">
          当前筛选 {{ monthLabel(selectedMonth) || '全部月份' }}，共
          {{ monthlyRecords.length }} 条记录。
        </p>
      </article>

      <article class="chart-card card">
        <p class="eyebrow">月份消费占比</p>
        <h2 class="page-title" style="font-size: 1.2rem; margin-top: 4px">本月支出构成</h2>
        <div class="pie-shell">
          <div class="pie-chart" :style="{ background: monthPieGradient }">
            <div class="pie-center">
              <strong>{{
                monthExpenseBreakdown.length ? formatCurrency(monthlyExpenseTotal) : '暂无支出'
              }}</strong>
              <span>{{ monthLabel(selectedMonth) || '全部月份' }}支出</span>
            </div>
          </div>
          <ul class="pie-legend">
            <li
              v-for="(item, index) in monthExpenseBreakdown"
              :key="item.category"
              class="legend-item"
            >
              <span
                class="legend-dot"
                :style="{ background: piePalette[index % piePalette.length] }"
              ></span>
              <span class="legend-copy"
                ><strong>{{ item.category }}</strong
                ><small>{{ item.percent }}% · {{ formatCurrency(item.amount) }}</small></span
              >
            </li>
          </ul>
        </div>
      </article>
    </section>

    <section class="grid two-col" style="margin-top: 18px">
      <article class="summary-card card">
        <p class="eyebrow">按年份查询</p>
        <h2 class="page-title" style="font-size: 1.15rem; margin-top: 6px">本年概览</h2>
        <div class="filter-row" style="margin-top: 10px">
          <label class="mini-label">
            年份
            <select v-model="selectedYear">
              <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}年</option>
            </select>
          </label>
        </div>
        <div class="summary-grid">
          <article class="mini-stat-box">
            <span>收入</span
            ><strong class="positive">{{ formatCurrency(yearlyIncomeTotal) }}</strong>
          </article>
          <article class="mini-stat-box">
            <span>支出</span><strong>{{ formatCurrency(yearlyExpenseTotal) }}</strong>
          </article>
          <article class="mini-stat-box">
            <span>结余</span><strong class="positive">{{ formatCurrency(yearlyNetTotal) }}</strong>
          </article>
          <article class="mini-stat-box">
            <span>储蓄率</span><strong class="positive">{{ yearlySavingsRate }}%</strong>
          </article>
        </div>
        <p class="lead" style="margin-top: 10px">
          当前年度 {{ selectedYear }} 年，共 {{ yearlyRecords.length }} 条记录。
        </p>
      </article>

      <article class="chart-card card">
        <p class="eyebrow">年份消费占比</p>
        <h2 class="page-title" style="font-size: 1.2rem; margin-top: 4px">本年支出构成</h2>
        <div class="pie-shell">
          <div class="pie-chart" :style="{ background: yearPieGradient }">
            <div class="pie-center">
              <strong>{{
                yearlyExpenseBreakdown.length ? formatCurrency(yearlyExpenseTotal) : '暂无支出'
              }}</strong>
              <span>{{ selectedYear }}年支出</span>
            </div>
          </div>
          <ul class="pie-legend">
            <li
              v-for="(item, index) in yearlyExpenseBreakdown"
              :key="item.category"
              class="legend-item"
            >
              <span
                class="legend-dot"
                :style="{ background: piePalette[index % piePalette.length] }"
              ></span>
              <span class="legend-copy"
                ><strong>{{ item.category }}</strong
                ><small>{{ item.percent }}% · {{ formatCurrency(item.amount) }}</small></span
              >
            </li>
          </ul>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useRecordsStore } from '@/stores/records'

const auth = useAuthStore()
const recordsStore = useRecordsStore()
const route = useRoute()
const { records } = storeToRefs(recordsStore)

const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const selectedYear = ref(new Date().getFullYear().toString())

function normalizeType(type) {
  const value = String(type || '')
    .trim()
    .toLowerCase()
  if (['收入', 'income', 'in'].includes(value) || value === '收入') return '收入'
  if (['支出', 'expense', 'out'].includes(value) || value === '支出') return '支出'
  return value === '收入' ? '收入' : '支出'
}

function sumByType(items, type) {
  return items
    .filter((item) => normalizeType(item.type) === type)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
}

function buildBreakdown(items) {
  const expenses = items.filter((item) => normalizeType(item.type) === '支出')
  const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const map = new Map()

  expenses.forEach((item) => {
    const key = item.category || '未分类'
    const current = map.get(key) || { category: key, amount: 0, count: 0 }
    current.amount += Number(item.amount || 0)
    current.count += 1
    map.set(key, current)
  })

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

const monthOptions = computed(() => {
  return [
    ...new Set(
      records.value.map((item) => String(item.record_date || '').slice(0, 7)).filter(Boolean),
    ),
  ].sort()
})

function monthLabel(value) {
  if (!value) return '全部月份'
  return `${value.slice(0, 4)}年${Number(value.slice(5, 7))}月`
}

const yearOptions = computed(() => {
  return [
    ...new Set(
      records.value.map((item) => String(item.record_date || '').slice(0, 4)).filter(Boolean),
    ),
  ].sort((a, b) => Number(b) - Number(a))
})

const monthlyRecords = computed(() => {
  if (!selectedMonth.value) return records.value
  return records.value.filter(
    (item) => String(item.record_date || '').slice(0, 7) === selectedMonth.value,
  )
})

const monthlyIncomeTotal = computed(() => sumByType(monthlyRecords.value, '收入'))
const monthlyExpenseTotal = computed(() => sumByType(monthlyRecords.value, '支出'))
const monthlyNetTotal = computed(() => monthlyIncomeTotal.value - monthlyExpenseTotal.value)
const monthlySavingsRate = computed(() => {
  if (monthlyIncomeTotal.value <= 0) return '0.00'
  return (
    ((monthlyIncomeTotal.value - monthlyExpenseTotal.value) / monthlyIncomeTotal.value) *
    100
  ).toFixed(2)
})
const monthExpenseBreakdown = computed(() => buildBreakdown(monthlyRecords.value))

const yearlyRecords = computed(() => {
  if (!selectedYear.value) return records.value
  return records.value.filter(
    (item) => String(item.record_date || '').slice(0, 4) === String(selectedYear.value),
  )
})

const yearlyIncomeTotal = computed(() => sumByType(yearlyRecords.value, '收入'))
const yearlyExpenseTotal = computed(() => sumByType(yearlyRecords.value, '支出'))
const yearlyNetTotal = computed(() => yearlyIncomeTotal.value - yearlyExpenseTotal.value)
const yearlySavingsRate = computed(() => {
  if (yearlyIncomeTotal.value <= 0) return '0.00'
  return (
    ((yearlyIncomeTotal.value - yearlyExpenseTotal.value) / yearlyIncomeTotal.value) *
    100
  ).toFixed(2)
})
const yearlyExpenseBreakdown = computed(() => buildBreakdown(yearlyRecords.value))

const piePalette = ['#7ba97d', '#d49a78', '#8bb7c7', '#d8b36e', '#b68cc2', '#f2a7b2']

const remarkCloud = computed(() => {
  const stopWords = new Set([
    '和',
    '的',
    '了',
    '在',
    '有',
    '是',
    '为',
    '与',
    '到',
    '也',
    '都',
    '很',
    '就',
    '不',
    '这',
    '那',
    '一个',
    '收入',
    '支出',
    '日常',
    '生活',
    '费用',
    '开销',
    '消费',
    '备注',
    '记录',
    '今天',
    '月',
    '年',
    '日',
    '用',
    '了',
    'the',
    'and',
    'for',
    'with',
    'this',
    'that',
    'your',
    'our',
    'have',
    'from',
    'been',
    'into',
    'over',
    'more',
  ])

  const map = new Map()

  records.value.forEach((item) => {
    const raw = String(item.remark || '').trim()
    if (!raw) return

    const words = raw
      .split(/[^\u4e00-\u9fa5a-zA-Z0-9]+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 2 && !stopWords.has(word))

    words.forEach((word) => {
      map.set(word, (map.get(word) || 0) + 1)
    })
  })

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([word, count]) => ({
      word,
      size: `${0.95 + count * 0.18}rem`,
      opacity: `${0.75 + Math.min(count, 5) * 0.04}`,
    }))
})

function pieGradientFor(breakdown) {
  if (!breakdown.length) return 'conic-gradient(#dfe7df 0deg 360deg)'

  const total = breakdown.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  let current = 0
  const parts = breakdown.map((item, index) => {
    const span = total > 0 ? (Number(item.amount || 0) / total) * 360 : 0
    const start = current
    const end = Math.min(360, current + span)
    current = end
    return `${piePalette[index % piePalette.length]} ${start}deg ${end}deg`
  })

  return `conic-gradient(${parts.join(', ')})`
}

const monthPieGradient = computed(() => pieGradientFor(monthExpenseBreakdown.value))
const yearPieGradient = computed(() => pieGradientFor(yearlyExpenseBreakdown.value))

function formatCurrency(value) {
  return `¥ ${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

async function loadRecords() {
  if (!auth.currentUser?.id) {
    recordsStore.records = []
    return
  }

  try {
    await recordsStore.loadRecords(auth.currentUser.id)
    if (!selectedYear.value) {
      selectedYear.value = String(new Date().getFullYear())
    }
  } catch (error) {
    console.error('Load statistics failed:', error)
  }
}

watch(
  () => auth.currentUser?.id,
  () => {
    loadRecords()
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    loadRecords()
  },
)

onActivated(() => {
  loadRecords()
})

onMounted(() => {
  auth.hydrate()
  loadRecords()
})
</script>
