import { defineStore } from 'pinia'
import { mockApi } from '../api/mockService'

export const useCareStore = defineStore('care', {
  state: () => ({ logs: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.logs = await mockApi.getCareLogs()
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const c = await mockApi.createCareLog(data)
      this.logs.push(c)
      return c
    },
    async update(id, data) {
      const c = await mockApi.updateCareLog(id, data)
      const i = this.logs.findIndex((x) => x.id === id)
      if (i > -1) this.logs[i] = c
      return c
    },
    async delete(id) {
      await mockApi.deleteCareLog(id)
      this.logs = this.logs.filter((c) => c.id !== id)
    },
    getByBatch(batchId) {
      return this.logs.filter((c) => c.batchId === batchId)
    },
  },
})
