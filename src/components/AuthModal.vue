<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="modal-card card" role="dialog" aria-modal="true" aria-label="账户入口">
      <header class="modal-header">
        <div>
          <p class="eyebrow">账户入口</p>
          <h2 class="page-title" style="font-size: 1.2rem; margin-top: 4px">
            {{ mode === 'login' ? '欢迎回来' : '创建你的记账账号' }}
          </h2>
        </div>
        <button class="ghost-btn" type="button" @click="emit('close')" aria-label="关闭">×</button>
      </header>

      <div class="tab-row">
        <button
          class="tab-btn"
          :class="{ active: mode === 'login' }"
          type="button"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'register' }"
          type="button"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <form
        v-if="mode === 'login'"
        class="form-grid"
        style="margin-top: 14px"
        @submit.prevent="handleLogin"
      >
        <div class="form-field">
          <label for="auth-username">用户名</label>
          <input
            id="auth-username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-field">
          <label for="auth-password">密码</label>
          <input
            id="auth-password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
      </form>

      <form v-else class="form-grid" style="margin-top: 14px" @submit.prevent="handleRegister">
        <div class="form-field">
          <label for="register-username">用户名</label>
          <input
            id="register-username"
            v-model="registerForm.username"
            type="text"
            placeholder="例如：张三"
            required
          />
        </div>
        <div class="form-field">
          <label for="register-password">密码</label>
          <input
            id="register-password"
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '创建账户' }}
        </button>
      </form>

      <p
        v-if="message.text"
        class="form-hint"
        :class="message.type === 'error' ? 'text-danger' : 'text-success'"
      >
        {{ message.text }}
      </p>
      <p class="form-hint" style="margin-top: 8px">
        {{ mode === 'login' ? '首次使用？' : '已有账号？' }}
        <button
          class="meta-link"
          type="button"
          @click="mode = mode === 'login' ? 'register' : 'login'"
        >
          {{ mode === 'login' ? '去注册' : '去登录' }}
        </button>
      </p>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

import { login, register } from '@/api/users'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  initialMode: {
    type: String,
    default: 'login',
  },
})

const emit = defineEmits(['close', 'success'])

const auth = useAuthStore()
const mode = ref(props.initialMode)
const loading = ref(false)
const message = ref({ type: '', text: '' })

watch(
  () => props.initialMode,
  (next) => {
    mode.value = next
  },
)

const loginForm = reactive({
  username: '',
  password: '',
})

const registerForm = reactive({
  username: '',
  password: '',
})

async function handleLogin() {
  message.value = { type: '', text: '' }
  loading.value = true

  try {
    const { data } = await login({
      username: loginForm.username,
      password: loginForm.password,
    })

    if (!data.success) {
      message.value = { type: 'error', text: data.message || '登录失败' }
      return
    }

    auth.loginSuccess(data.user || { username: loginForm.username }, data.token || '')
    message.value = { type: 'success', text: data.message || '登录成功' }
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Login failed:', error)
    message.value = { type: 'error', text: '登录失败，请检查后端是否已启动。' }
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  message.value = { type: '', text: '' }
  loading.value = true

  try {
    const { data } = await register({
      username: registerForm.username,
      password: registerForm.password,
    })

    if (!data.success) {
      message.value = { type: 'error', text: data.message || '注册失败' }
      return
    }

    message.value = { type: 'success', text: data.message || '注册成功' }
    mode.value = 'login'
  } catch (error) {
    console.error('Register failed:', error)
    message.value = { type: 'error', text: '注册失败，请检查后端是否已启动。' }
  } finally {
    loading.value = false
  }
}
</script>
