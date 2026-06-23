import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const register = (data) => {
  return api.post('/register.php', data)
}

export const login = (data) => {
  return api.post('/login.php', data)
}

export const logout = () => {
  return Promise.resolve({
    data: {
      success: true,
      message: '已退出登录',
    },
  })
}
