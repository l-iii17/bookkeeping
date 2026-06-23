import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  addRecord as apiAddRecord,
  deleteRecord as apiDeleteRecord,
  getRecords,
  updateRecord as apiUpdateRecord,
} from '@/api/records'
import { useAuthStore } from '@/stores/auth'

export const useRecordsStore = defineStore('records', () => {
  const records = ref([])
  const loading = ref(false)
  const error = ref('')

  async function loadRecords(userId = useAuthStore().currentUser?.id) {
    if (!userId) {
      records.value = []
      return []
    }

    loading.value = true
    error.value = ''

    try {
      const { data } = await getRecords(userId)
      records.value = Array.isArray(data.data) ? data.data : []
      return records.value
    } catch (err) {
      console.error('Load records failed:', err)
      error.value = '读取记录失败，请检查后端是否已启动。'
      return []
    } finally {
      loading.value = false
    }
  }

  async function createRecord(payload) {
    const auth = useAuthStore()
    const userId = payload.user_id ?? auth.currentUser?.id

    if (!userId) {
      throw new Error('请先登录后再管理记录。')
    }

    await apiAddRecord({ ...payload, user_id: userId })
    await loadRecords(userId)
  }

  async function updateRecord(payload) {
    const auth = useAuthStore()
    const userId = payload.user_id ?? auth.currentUser?.id

    if (!userId) {
      throw new Error('请先登录后再管理记录。')
    }

    await apiUpdateRecord({ ...payload, user_id: userId })
    await loadRecords(userId)
  }

  async function removeRecord(id, userId = useAuthStore().currentUser?.id) {
    if (!id || !userId) {
      throw new Error('缺少记录 ID 或用户信息。')
    }

    await apiDeleteRecord(id, userId)
    await loadRecords(userId)
  }

  return {
    records,
    loading,
    error,
    loadRecords,
    createRecord,
    updateRecord,
    removeRecord,
  }
})
