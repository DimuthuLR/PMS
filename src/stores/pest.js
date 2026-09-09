import { defineStore } from 'pinia'
import { mockApi } from '../api/mockService'

export const usePestStore = defineStore('pest', {
  state: () => ({ pests: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.pests = await mockApi.getPests()
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const p = await mockApi.createPest(data)
      this.pests.push(p)
      return p
    },
    async update(id, data) {
      const p = await mockApi.updatePest(id, data)
      const i = this.pests.findIndex((x) => x.id === id)
      if (i > -1) this.pests[i] = p
      return p
    },
    async delete(id) {
      await mockApi.deletePest(id)
      this.pests = this.pests.filter((p) => p.id !== id)
    },
    getByBatch(batchId) {
      return this.pests.filter((p) => p.batchId === batchId)
    },
  },
})
