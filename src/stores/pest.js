import { defineStore } from 'pinia'
import api from '../api/config'

export const usePestStore = defineStore('pest', {
  state: () => ({ pests: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/pest')
        this.pests = response.data
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const response = await api.post('/pest', data)
      this.pests.push(response.data)
      return response.data
    },
    async update(id, data) {
      const response = await api.put(`/pest/${id}`, data)
      const index = this.pests.findIndex((p) => p.id === id)
      if (index !== -1) this.pests[index] = response.data
      return response.data
    },
    async delete(id) {
      await api.delete(`/pest/${id}`)
      this.pests = this.pests.filter((p) => p.id !== id)
    },
    async getByBatch(batchId) {
      const response = await api.get(`/pest?batch_id=${batchId}`)
      return response.data
    },
  },
})
