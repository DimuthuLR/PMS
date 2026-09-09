import { defineStore } from 'pinia'
import { mockApi } from '../api/mockService'

export const useSensorsStore = defineStore('sensors', {
  state: () => ({ data: null, loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.data = await mockApi.getSensors()
      } finally {
        this.loading = false
      }
    },
    async update(payload) {
      this.data = await mockApi.updateSensors(payload)
    },
  },
})
