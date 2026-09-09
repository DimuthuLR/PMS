import { defineStore } from 'pinia'
import { mockApi } from '../api/mockService'

export const useUsersStore = defineStore('users', {
  state: () => ({ users: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.users = await mockApi.getUsers()
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const u = await mockApi.createUser(data)
      this.users.push(u)
      return u
    },
    async update(id, data) {
      const u = await mockApi.updateUser(id, data)
      const i = this.users.findIndex((x) => x.id === id)
      if (i > -1) this.users[i] = u
      return u
    },
    async delete(id) {
      await mockApi.deleteUser(id)
      this.users = this.users.filter((u) => u.id !== id)
    },
  },
})
