import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'

export const useHarvestStore = defineStore('harvest', {
  state: () => ({
    harvests: [],
    loading: false,
    lastFetched: 0,
  }),

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return

      this.loading = true
      try {
        const response = await api.get('/harvest')
        this.harvests = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      const response = await api.post('/harvest', data)
      this.harvests.push(response.data)
      this.lastFetched = markFresh()
      return response.data
    },

    async update(id, data) {
      const response = await api.put(`/harvest/${id}`, data)
      const index = this.harvests.findIndex((h) => h.id === id)
      if (index !== -1) this.harvests[index] = response.data
      this.lastFetched = markFresh()
      return response.data
    },

    async delete(id) {
      await api.delete(`/harvest/${id}`)
      this.harvests = this.harvests.filter((h) => h.id !== id)
      this.lastFetched = markFresh()
    },

    async getByBatch(batchId) {
      const response = await api.get(`/harvest?batch_id=${batchId}`)
      return response.data
    },

    async getSummary(batchId = null) {
      // Not cached — used for analytics views that need fresh data
      const url = batchId ? `/harvest/summary?batch_id=${batchId}` : '/harvest/summary'
      const response = await api.get(url)
      return response.data
    },
  },
})
