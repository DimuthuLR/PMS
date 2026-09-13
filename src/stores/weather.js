import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'
import { useDashboardStore } from './dashboard'

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    data: null,
    loading: false,
    lastFetched: 0,
  }),

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return
      this.loading = true
      try {
        const response = await api.get('/weather')
        this.data = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async update(payload) {
      const response = await api.put('/weather', payload)
      this.data = response.data
      this.lastFetched = markFresh()
      useDashboardStore().invalidate() // ✅
      return response.data
    },

    async refresh() {
      const response = await api.post('/weather/refresh')
      this.data = response.data
      this.lastFetched = markFresh()
      useDashboardStore().invalidate() // ✅
      return response.data
    },
  },
  persist: {
    key: 'pms-weather',
    pick: ['data', 'lastFetched'],
  },
})
