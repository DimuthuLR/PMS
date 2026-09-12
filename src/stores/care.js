import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'

export const useCareStore = defineStore('care', {
  state: () => ({
    logs: [],
    loading: false,
    lastFetched: 0,
  }),

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return

      this.loading = true
      try {
        const response = await api.get('/care')
        this.logs = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      const response = await api.post('/care', data)
      this.logs.push(response.data)
      this.lastFetched = markFresh()
      return response.data
    },

    async update(id, data) {
      const response = await api.put(`/care/${id}`, data)
      const index = this.logs.findIndex((c) => c.id === id)
      if (index !== -1) this.logs[index] = response.data
      this.lastFetched = markFresh()
      return response.data
    },

    async delete(id) {
      await api.delete(`/care/${id}`)
      this.logs = this.logs.filter((c) => c.id !== id)
      this.lastFetched = markFresh()
    },

    async getByBatch(batchId) {
      // This is a filtered read — don't cache, always fresh
      const response = await api.get(`/care?batch_id=${batchId}`)
      return response.data
    },
  },
})
