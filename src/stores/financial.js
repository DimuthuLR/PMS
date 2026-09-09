import { defineStore } from 'pinia'
import api from '../api/config'

export const useFinancialStore = defineStore('financial', {
  state: () => ({ expenses: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/financial')
        this.expenses = response.data
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const response = await api.post('/financial', data)
      this.expenses.push(response.data)
      return response.data
    },
    async update(id, data) {
      const response = await api.put(`/financial/${id}`, data)
      const index = this.expenses.findIndex((e) => e.id === id)
      if (index !== -1) this.expenses[index] = response.data
      return response.data
    },
    async delete(id) {
      await api.delete(`/financial/${id}`)
      this.expenses = this.expenses.filter((e) => e.id !== id)
    },
    async getByBatch(batchId) {
      const response = await api.get(`/financial?batch_id=${batchId}`)
      return response.data
    },
  },
})
