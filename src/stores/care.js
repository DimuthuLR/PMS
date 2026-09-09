import { defineStore } from 'pinia'
import api from '../api/config'

export const useCareStore = defineStore('care', {
  state: () => ({ logs: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/care')
        this.logs = response.data
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const response = await api.post('/care', data)
      this.logs.push(response.data)
      return response.data
    },
    async update(id, data) {
      const response = await api.put(`/care/${id}`, data)
      const index = this.logs.findIndex((c) => c.id === id)
      if (index !== -1) this.logs[index] = response.data
      return response.data
    },
    async delete(id) {
      await api.delete(`/care/${id}`)
      this.logs = this.logs.filter((c) => c.id !== id)
    },
    async getByBatch(batchId) {
      const response = await api.get(`/care?batch_id=${batchId}`)
      return response.data
    },
  },
})
