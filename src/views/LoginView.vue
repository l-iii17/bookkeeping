<template>
  <main class="page-shell">
    <section class="auth-layout">
      <article class="form-card card">
        <p class="eyebrow">账户入口</p>
        <h1 class="page-title">登录到个人记账系统</h1>
        <p class="lead">这是备用入口；主入口仍然是首页，登录会以轻量弹窗形式完成。</p>

        <AuthModal :initial-mode="'login'" @close="router.push('/')" />
      </article>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'

import AuthModal from '@/components/AuthModal.vue'

const router = useRouter()
</script>
