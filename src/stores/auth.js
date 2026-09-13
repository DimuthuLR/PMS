import { defineStore } from 'pinia'
import api from '../api/config'
import { connectSocket, disconnectSocket } from '../api/socket'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    role: null,
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

        // ✅ Open WebSocket connection
        connectSocket()

        return { success: true, user }
      } catch (error) {
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
      // ✅ Close WebSocket connection
      disconnectSocket()
      this.user = null
      this.token = null
      this.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      localStorage.removeItem('user')
    },

    /** Called on app boot if a token exists — reconnects the socket. */
    restoreSession() {
      if (this.token) {
        connectSocket()
      }
    },
  },

  persist: {
    key: 'pms-auth',
    pick: ['user', 'token', 'role'],
  },
})
