import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'bookkeeping_auth'

export const useAuthStore = defineStore('auth', () => {
  const isLogin = ref(false)
  const currentUser = ref(null)
  const token = ref('')

  function hydrate() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (!saved) {
        return
      }

      const parsed = JSON.parse(saved)

      isLogin.value = Boolean(parsed?.isLogin)
      currentUser.value = parsed?.currentUser || null
      token.value = parsed?.token || ''
    } catch (error) {
      console.error('Failed to restore auth state:', error)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isLogin: isLogin.value,
        currentUser: currentUser.value,
        token: token.value,
      }),
    )
  }

  function loginSuccess(user, authToken = '') {
    currentUser.value = user || null
    isLogin.value = true
    token.value = authToken
    persist()
  }

  function logout() {
    isLogin.value = false
    currentUser.value = null
    token.value = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  hydrate()

  return {
    isLogin,
    currentUser,
    token,
    hydrate,
    loginSuccess,
    logout,
  }
})
