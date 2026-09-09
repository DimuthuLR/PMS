import { defineStore } from 'pinia'
import { mockApi } from '../api/mockService'

export const usePlotsStore = defineStore('plots', {
  state: () => ({ plots: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.plots = await mockApi.getPlots()
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const p = await mockApi.createPlot(data)
      this.plots.push(p)
      return p
    },
    async update(id, data) {
      const p = await mockApi.updatePlot(id, data)
      const i = this.plots.findIndex((x) => x.id === id)
      if (i > -1) this.plots[i] = p
      return p
    },
    async delete(id) {
      await mockApi.deletePlot(id)
      this.plots = this.plots.filter((p) => p.id !== id)
    },
  },
})
