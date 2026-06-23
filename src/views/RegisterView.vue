<template>
  <main class="page-shell">
    <section class="auth-layout">
      <article class="form-card card">
        <p class="eyebrow">新用户注册</p>
        <h1 class="page-title">创建你的记账账号</h1>
        <p class="lead">只需 1 分钟，就能建立一套舒服、清爽的收支管理入口。</p>

        <AuthModal :initial-mode="'register'" @close="router.push('/')" />
      </article>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'

import AuthModal from '@/components/AuthModal.vue'

const router = useRouter()
</script>
