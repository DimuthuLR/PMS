import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'

export const useFinancialStore = defineStore('financial', {
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
        const response = await api.get('/financial')
        this.records = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      const response = await api.post('/financial', data)
      this.records.push(response.data)
      this.lastFetched = markFresh()
      return response.data
    },

    async update(id, data) {
      const response = await api.put(`/financial/${id}`, data)
      const index = this.records.findIndex((r) => r.id === id)
      if (index !== -1) this.records[index] = response.data
      this.lastFetched = markFresh()
      return response.data
    },

    async delete(id) {
      await api.delete(`/financial/${id}`)
      this.records = this.records.filter((r) => r.id !== id)
      this.lastFetched = markFresh()
    },
  },
  persist: {
    key: 'pms-financial',
    pick: ['records', 'lastFetched'],
  },
})
