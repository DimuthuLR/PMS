import { defineStore } from 'pinia'
import { mockApi } from '../api/mockService'

export const useHarvestStore = defineStore('harvest', {
  state: () => ({ harvests: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.harvests = await mockApi.getHarvests()
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const h = await mockApi.createHarvest(data)
      this.harvests.push(h)
      return h
    },
    async update(id, data) {
      const h = await mockApi.updateHarvest(id, data)
      const i = this.harvests.findIndex((x) => x.id === id)
      if (i > -1) this.harvests[i] = h
      return h
    },
    async delete(id) {
      await mockApi.deleteHarvest(id)
      this.harvests = this.harvests.filter((h) => h.id !== id)
    },
    getByBatch(batchId) {
      return this.harvests.filter((h) => h.batchId === batchId)
    },
  },
})
