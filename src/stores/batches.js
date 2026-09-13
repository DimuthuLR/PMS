import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'
import { useDashboardStore } from './dashboard'

export const useBatchesStore = defineStore('batches', {
  state: () => ({
    batches: [],
    loading: false,
    lastFetched: 0,
  }),

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return
      this.loading = true
      try {
        const response = await api.get('/batches')
        this.batches = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      const response = await api.post('/batches', data)
      this.batches.push(response.data)
      this.lastFetched = markFresh()
      useDashboardStore().invalidate() // ✅
      return response.data
    },

    async update(id, data) {
      const response = await api.put(`/batches/${id}`, data)
      const index = this.batches.findIndex((b) => b.id === id)
      if (index !== -1) this.batches[index] = response.data
      this.lastFetched = markFresh()
      useDashboardStore().invalidate() // ✅
      return response.data
    },

    async delete(id) {
      await api.delete(`/batches/${id}`)
      this.batches = this.batches.filter((b) => b.id !== id)
      this.lastFetched = markFresh()
      useDashboardStore().invalidate() // ✅
    },
  },
  persist: {
    key: 'pms-batches',
    pick: ['batches', 'lastFetched'],
  },
})
