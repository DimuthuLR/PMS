import { defineStore } from 'pinia'
import api from '../api/config'

export const useUsersStore = defineStore('users', {
  state: () => ({ users: [], loading: false }),

  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/users')
        this.users = response.data
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      const response = await api.post('/users', data)
      this.users.push(response.data)
      return response.data
    },

    async update(id, data) {
      const response = await api.put(`/users/${id}`, data)
      const i = this.users.findIndex((x) => x.id === id)
      if (i > -1) this.users[i] = response.data
      return response.data
    },

    async delete(id) {
      await api.delete(`/users/${id}`)
      this.users = this.users.filter((u) => u.id !== id)
    },
  },
})
