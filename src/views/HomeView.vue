<template>
  <main class="page-shell">
    <section class="hero-card card">
      <article class="hero-copy">
        <p class="eyebrow">今日记账</p>
        <h1 class="page-title">电子记账本</h1>
        <p class="lead">每一笔到账、每一笔花费，都完整地纳入真实的电子账本。</p>
        <div class="action-row">
          <router-link class="btn btn-primary" to="/statistics">查看统计</router-link>
          <button class="btn btn-secondary" type="button" @click="scrollToForm">记一笔</button>
        </div>
      </article>

      <aside class="mini-panel">
        <p class="eyebrow">今日概览</p>
        <div class="mini-metric">
          <span>收入</span><strong>{{ formatCurrency(todayIncomeTotal) }}</strong>
        </div>
        <div class="mini-metric">
          <span>支出</span><strong>{{ formatCurrency(todayExpenseTotal) }}</strong>
        </div>
        <div class="mini-metric">
          <span>结余</span><strong>{{ formatCurrency(todayNetTotal) }}</strong>
        </div>
        <p class="lead" style="margin-top: 6px">
          {{ todayLabel }}共 {{ todayRecords.length }} 条记录
        </p>
      </aside>
    </section>

    <section class="grid two-col" style="margin-top: 18px">
      <article class="list-card card" id="record-form-card">
        <p class="eyebrow">记录管理</p>
        <h2 class="page-title" style="font-size: 1.2rem; margin-top: 4px">
          {{ editingId ? '编辑记录' : '新增一笔记录' }}
        </h2>

        <form class="form-grid" style="margin-top: 12px" @submit.prevent="submitRecord">
          <div class="form-field">
            <label for="record-type">类型</label>
            <select id="record-type" v-model="form.type">
              <option value="收入">收入</option>
              <option value="支出">支出</option>
            </select>
          </div>
          <div class="form-field">
            <label for="record-category">类别</label>
            <input
              id="record-category"
              v-model="form.category"
              type="text"
              placeholder="例如：餐饮、交通、工资"
              required
            />
          </div>
          <div class="form-field">
            <label for="record-amount">金额</label>
            <input
              id="record-amount"
              v-model.number="form.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          <div class="form-field">
            <label for="record-date">日期</label>
            <input id="record-date" v-model="form.record_date" type="date" required />
          </div>
          <div class="form-field">
            <label for="record-remark">备注</label>
            <input id="record-remark" v-model="form.remark" type="text" placeholder="可选备注" />
          </div>

          <div class="action-row">
            <button class="btn btn-primary" type="submit" :disabled="loading">
              {{ editingId ? '保存修改' : '新增记录' }}
            </button>
            <button v-if="editingId" class="btn btn-secondary" type="button" @click="resetForm">
              取消
            </button>
          </div>

          <p
            v-if="message.text"
            class="form-hint"
            :class="message.type === 'error' ? 'text-danger' : 'text-success'"
          >
            {{ message.text }}
          </p>
        </form>
      </article>

      <article class="feature-card card">
        <p class="eyebrow">最近记录</p>
        <h2 class="page-title" style="font-size: 1.2rem; margin-top: 4px"></h2>

        <ul
          v-if="records.length"
          class="recent-records-list"
          style="list-style: none; padding: 0; margin: 10px 0 0; display: grid; gap: 10px"
        >
          <li v-for="item in records" :key="item.id" class="record-item">
            <div class="record-meta">
              <span>{{ item.category }}</span>
              <span>{{ formatDateLabel(item.record_date) }}</span>
            </div>
            <span :class="item.type === '收入' ? 'amount positive' : 'amount negative'"
              >{{ item.type === '收入' ? '+' : '-' }} {{ formatCurrency(item.amount) }}</span
            >
            <p style="margin: 4px 0 0; color: var(--muted); font-size: 0.92rem">
              {{ item.remark || '无备注' }}
            </p>
            <div class="action-row" style="margin-top: 8px; justify-content: flex-start">
              <button class="btn btn-secondary" type="button" @click="editRecord(item)">
                编辑
              </button>
              <button class="btn btn-secondary" type="button" @click="deleteRecord(item.id)">
                删除
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="form-hint">当前用户暂无记录，可先新增一笔。</p>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import { useRecordsStore } from '@/stores/records'

const auth = useAuthStore()
const recordsStore = useRecordsStore()
const { records, loading } = storeToRefs(recordsStore)

const editingId = ref(null)
const message = ref({ type: '', text: '' })

const form = reactive({
  type: '支出',
  category: '',
  amount: '',
  remark: '',
  record_date: new Date().toISOString().slice(0, 10),
})

function formatDateLabel(value) {
  if (!value) return '暂无日期'
  const [year, month, day] = String(value)
    .split('-')
    .map((item) => Number(item))
  if (!year || !month) return String(value)
  return `${year}年${month}月${day ? `${day}日` : ''}`.replace(/年$/, '年')
}

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

const todayKey = computed(() => new Date().toISOString().slice(0, 10))
const todayLabel = computed(() => formatDateLabel(todayKey.value))
const todayRecords = computed(() =>
  records.value.filter((item) => String(item.record_date || '').slice(0, 10) === todayKey.value),
)
const todayIncomeTotal = computed(() => sumByType(todayRecords.value, '收入'))
const todayExpenseTotal = computed(() => sumByType(todayRecords.value, '支出'))
const todayNetTotal = computed(() => todayIncomeTotal.value - todayExpenseTotal.value)

function formatCurrency(value) {
  return `¥ ${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function resetForm() {
  editingId.value = null
  form.type = '支出'
  form.category = ''
  form.amount = ''
  form.remark = ''
  form.record_date = new Date().toISOString().slice(0, 10)
}

function scrollToForm() {
  document
    .getElementById('record-form-card')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function loadRecords() {
  if (!auth.currentUser?.id) {
    recordsStore.records = []
    return
  }

  try {
    await recordsStore.loadRecords(auth.currentUser.id)
  } catch (error) {
    console.error('Load records failed:', error)
    message.value = { type: 'error', text: '读取记录失败，请检查后端是否已启动。' }
  }
}

function editRecord(item) {
  editingId.value = item.id
  form.type = item.type || '支出'
  form.category = item.category || ''
  form.amount = Number(item.amount || 0)
  form.remark = item.remark || ''
  form.record_date = item.record_date || new Date().toISOString().slice(0, 10)
  scrollToForm()
}

async function submitRecord() {
  if (!auth.currentUser?.id) {
    message.value = { type: 'error', text: '请先登录后再管理记录。' }
    return
  }

  message.value = { type: '', text: '' }
  loading.value = true

  try {
    const payload = {
      user_id: auth.currentUser.id,
      type: form.type,
      category: form.category,
      amount: Number(form.amount || 0),
      remark: form.remark,
      record_date: form.record_date,
    }

    if (editingId.value) {
      await recordsStore.updateRecord({ ...payload, id: editingId.value })
      message.value = { type: 'success', text: '记录已更新' }
    } else {
      await recordsStore.createRecord(payload)
      message.value = { type: 'success', text: '记录已添加' }
    }

    resetForm()
  } catch (error) {
    console.error('Save record failed:', error)
    message.value = { type: 'error', text: '保存记录失败，请检查后端是否可用。' }
  } finally {
    loading.value = false
  }
}

async function deleteRecord(id) {
  if (!auth.currentUser?.id) return

  try {
    await recordsStore.removeRecord(id, auth.currentUser.id)
    message.value = { type: 'success', text: '记录已删除' }
  } catch (error) {
    console.error('Delete record failed:', error)
    message.value = { type: 'error', text: '删除失败，请重试。' }
  }
}

watch(
  () => auth.currentUser?.id,
  () => {
    loadRecords()
  },
)

onMounted(() => {
  auth.hydrate()
  loadRecords()
})
</script>
