import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'

export const usePlotsStore = defineStore('plots', {
  state: () => ({
    plots: [],
    loading: false,
    lastFetched: 0,
  }),

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return
      this.loading = true
      try {
        const response = await api.get('/plots')
        this.plots = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      const response = await api.post('/plots', data)
      this.plots.push(response.data)
      this.lastFetched = markFresh()
      return response.data
    },

    async update(id, data) {
      const response = await api.put(`/plots/${id}`, data)
      const index = this.plots.findIndex((p) => p.id === id)
      if (index !== -1) this.plots[index] = response.data
      this.lastFetched = markFresh()
      return response.data
    },

    async delete(id) {
      await api.delete(`/plots/${id}`)
      this.plots = this.plots.filter((p) => p.id !== id)
      this.lastFetched = markFresh()
    },
  },
  persist: {
    key: 'pms-plots',
    pick: ['plots', 'lastFetched'],
  },
})
