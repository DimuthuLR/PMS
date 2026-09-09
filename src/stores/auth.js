import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('userRole') || null,
  }),
  actions: {
    async login(username, password) {
      // Mock credentials
      const validUsers = {
        admin: { role: 'admin', pass: 'admin123' },
        manager: { role: 'manager', pass: 'manager123' },
        worker: { role: 'worker', pass: 'worker123' },
      }
      const found = validUsers[username]
      if (!found || found.pass !== password) throw new Error('Invalid credentials')

      this.user = { username, role: found.role }
      this.token = 'fake-jwt-' + Date.now()
      this.role = found.role
      localStorage.setItem('token', this.token)
      localStorage.setItem('userRole', this.role)
    },
    logout() {
      this.user = null
      this.token = null
      this.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
    },
  },
})
