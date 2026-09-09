import { defineStore } from 'pinia'
import { mockApi } from '../api/mockService'

export const useWeatherStore = defineStore('weather', {
  state: () => ({ data: null, loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.data = await mockApi.getWeather()
      } finally {
        this.loading = false
      }
    },
    async update(payload) {
      this.data = await mockApi.updateWeather(payload)
    },
  },
})
