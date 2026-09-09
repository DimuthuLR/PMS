import { defineStore } from 'pinia'
import api from '../api/config'

export const useTankStore = defineStore('tank', {
  state: () => ({ tank: null, loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/tank')
        this.tank = response.data
      } finally {
        this.loading = false
      }
    },
    async update(payload) {
      const response = await api.put('/tank', payload)
      this.tank = response.data
      return response.data
    },
    async togglePump() {
      const response = await api.post('/tank/toggle-pump')
      this.tank = response.data
      return response.data
    },
  },
})
