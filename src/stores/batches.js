import { defineStore } from 'pinia'
import { mockApi } from '../api/mockService'

export const useBatchesStore = defineStore('batches', {
  state: () => ({ batches: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.batches = await mockApi.getBatches()
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const b = await mockApi.createBatch(data)
      this.batches.push(b)
      return b
    },
    async update(id, data) {
      const b = await mockApi.updateBatch(id, data)
      const i = this.batches.findIndex((x) => x.id === id)
      if (i > -1) this.batches[i] = b
      return b
    },
    async delete(id) {
      await mockApi.deleteBatch(id)
      this.batches = this.batches.filter((b) => b.id !== id)
    },
    getByPlot(plotId) {
      return this.batches.filter((b) => b.plotId === plotId)
    },
  },
})
