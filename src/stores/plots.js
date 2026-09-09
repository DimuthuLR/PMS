import { defineStore } from 'pinia'
import api from '../api/config'

export const usePlotsStore = defineStore('plots', {
  state: () => ({ plots: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/plots')
        this.plots = response.data
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const response = await api.post('/plots', data)
      this.plots.push(response.data)
      return response.data
    },
    async update(id, data) {
      const response = await api.put(`/plots/${id}`, data)
      const index = this.plots.findIndex((p) => p.id === id)
      if (index !== -1) this.plots[index] = response.data
      return response.data
    },
    async delete(id) {
      await api.delete(`/plots/${id}`)
      this.plots = this.plots.filter((p) => p.id !== id)
    },
  },
})
