<template>
  <div class="app-shell">
    <header class="topbar card">
      <div>
        <p class="eyebrow">记账助手</p>
        <h2 class="topbar-title">轻量收支管理</h2>
      </div>

      <nav class="top-nav">
        <router-link class="nav-link" to="/">主页</router-link>
        <router-link class="nav-link" to="/statistics">统计</router-link>
      </nav>

      <div class="top-actions">
        <template v-if="auth.isLogin">
          <span class="user-chip">欢迎，{{ auth.currentUser?.username || '用户' }}</span>
          <button class="btn btn-secondary login-chip" type="button" @click="handleLogout">
            退出
          </button>
        </template>
        <template v-else>
          <button class="btn btn-secondary login-chip" type="button" @click="openAuth('login')">
            登录
          </button>
          <button class="btn btn-primary login-chip" type="button" @click="openAuth('register')">
            注册
          </button>
        </template>
      </div>
    </header>

    <RouterView />

    <AuthModal
      v-if="showAuthModal"
      :initial-mode="authMode"
      @close="showAuthModal = false"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AuthModal from '@/components/AuthModal.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const showAuthModal = ref(false)
const authMode = ref('login')

function openAuth(mode = 'login') {
  authMode.value = mode
  showAuthModal.value = true
}

function handleLogout() {
  auth.logout()
  router.push('/')
}

function handleAuthSuccess() {
  showAuthModal.value = false
}
</script>
