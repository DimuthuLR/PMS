import { defineStore } from 'pinia'
import api from '../api/config'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('userRole') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.role === 'admin',
    isManager: (state) => state.role === 'admin' || state.role === 'manager',
  },

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
        return { success: true, user }
      } catch (error) {
        // ✅ FIX: backend returns { message: "..." }, not { error: "..." }
        const message =
          error.response?.data?.message ||
          (error.response ? 'Login failed' : 'Cannot connect to server')
        throw new Error(message)
      }
    },

    async fetchCurrentUser() {
      try {
        const response = await api.get('/auth/me')
        this.user = response.data.user
        this.role = response.data.user.role
        return this.user
      } catch (error) {
        this.logout()
        throw error
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
