import { defineStore } from 'pinia'
import { mockApi } from '../api/mockService'

export const useFinancialStore = defineStore('financial', {
  state: () => ({ expenses: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.expenses = await mockApi.getFinancials()
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const e = await mockApi.createFinancial(data)
      this.expenses.push(e)
      return e
    },
    async update(id, data) {
      const e = await mockApi.updateFinancial(id, data)
      const i = this.expenses.findIndex((x) => x.id === id)
      if (i > -1) this.expenses[i] = e
      return e
    },
    async delete(id) {
      await mockApi.deleteFinancial(id)
      this.expenses = this.expenses.filter((e) => e.id !== id)
    },
    getByBatch(batchId) {
      return this.expenses.filter((e) => e.batchId === batchId)
    },
  },
})
