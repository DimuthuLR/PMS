import { defineStore } from 'pinia'
import api from '../api/config'

export const useAlertsStore = defineStore('alerts', {
  state: () => ({ alerts: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/alerts')
        this.alerts = response.data
      } finally {
        this.loading = false
      }
    },
    async markRead(id) {
      const response = await api.put(`/alerts/${id}/read`)
      const index = this.alerts.findIndex((a) => a.id === id)
      if (index !== -1) this.alerts[index] = response.data
      return response.data
    },
    async generate() {
      const response = await api.post('/alerts/generate')
      await this.fetch()
      return response.data
    },
  },
})
