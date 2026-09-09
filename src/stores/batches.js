import { defineStore } from 'pinia'
import api from '../api/config'

export const useBatchesStore = defineStore('batches', {
  state: () => ({ batches: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/batches')
        this.batches = response.data
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const response = await api.post('/batches', data)
      this.batches.push(response.data)
      return response.data
    },
    async update(id, data) {
      const response = await api.put(`/batches/${id}`, data)
      const index = this.batches.findIndex((b) => b.id === id)
      if (index !== -1) this.batches[index] = response.data
      return response.data
    },
    async delete(id) {
      await api.delete(`/batches/${id}`)
      this.batches = this.batches.filter((b) => b.id !== id)
    },
    async getByPlot(plotId) {
      const response = await api.get(`/batches/plot/${plotId}`)
      return response.data
    },
  },
})
