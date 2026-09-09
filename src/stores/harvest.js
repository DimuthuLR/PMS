import { defineStore } from 'pinia'
import api from '../api/config'

export const useHarvestStore = defineStore('harvest', {
  state: () => ({ harvests: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/harvest')
        this.harvests = response.data
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const response = await api.post('/harvest', data)
      this.harvests.push(response.data)
      return response.data
    },
    async update(id, data) {
      const response = await api.put(`/harvest/${id}`, data)
      const index = this.harvests.findIndex((h) => h.id === id)
      if (index !== -1) this.harvests[index] = response.data
      return response.data
    },
    async delete(id) {
      await api.delete(`/harvest/${id}`)
      this.harvests = this.harvests.filter((h) => h.id !== id)
    },
    async getByBatch(batchId) {
      const response = await api.get(`/harvest?batch_id=${batchId}`)
      return response.data
    },
  },
})
