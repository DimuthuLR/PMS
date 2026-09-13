import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'

export const usePestStore = defineStore('pest', {
  state: () => ({
    records: [],
    loading: false,
    lastFetched: 0,
  }),

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return

      this.loading = true
      try {
        const response = await api.get('/pest')
        this.records = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      const response = await api.post('/pest', data)
      this.records.push(response.data)
      this.lastFetched = markFresh()
      return response.data
    },

    async update(id, data) {
      const response = await api.put(`/pest/${id}`, data)
      const index = this.records.findIndex((r) => r.id === id)
      if (index !== -1) this.records[index] = response.data
      this.lastFetched = markFresh()
      return response.data
    },

    async delete(id) {
      await api.delete(`/pest/${id}`)
      this.records = this.records.filter((r) => r.id !== id)
      this.lastFetched = markFresh()
    },
  },
  persist: {
    key: 'pms-pest',
    pick: ['records', 'lastFetched'],
  },
})
