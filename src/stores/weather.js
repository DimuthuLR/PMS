import { defineStore } from 'pinia'
import api from '../api/config'

export const useWeatherStore = defineStore('weather', {
  state: () => ({ data: null, loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/weather')
        this.data = response.data
      } finally {
        this.loading = false
      }
    },
    async update(payload) {
      const response = await api.put('/weather', payload)
      this.data = response.data
      return response.data
    },
  },
})
