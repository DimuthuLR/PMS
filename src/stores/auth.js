import { defineStore } from 'pinia'
import api from '../api/config'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('userRole') || null,
  }),
  actions: {
    async login(username, password) {
      try {
        const response = await api.post('/auth/login', { username, password })
        const { token, user } = response.data
        this.user = user
        this.token = token
        this.role = user.role
        localStorage.setItem('token', token)
        localStorage.setItem('userRole', user.role)
        localStorage.setItem('user', JSON.stringify(user))
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Login failed')
      }
    },
    logout() {
      this.user = null
      this.token = null
      this.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      localStorage.removeItem('user')
    },
  },
})
