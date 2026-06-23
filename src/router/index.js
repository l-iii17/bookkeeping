import { createRouter, createWebHashHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import StatisticsView from '../views/StatisticsView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/home',
      redirect: '/',
    },
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/register',
      component: RegisterView,
    },
    {
      path: '/statistics',
      component: StatisticsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLogin) {
    alert('请先登录后再查看统计内容。')
    return next('/')
  }

  if (to.path === '/login' && auth.isLogin) {
    return next('/')
  }

  next()
})

export default router
