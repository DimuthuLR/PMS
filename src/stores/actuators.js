import { defineStore } from 'pinia'
import api from '../api/config'

export const useActuatorsStore = defineStore('actuators', {
  state: () => ({ actuators: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/actuators')
        this.actuators = response.data
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const response = await api.post('/actuators', data)
      this.actuators.push(response.data)
      return response.data
    },
    async update(id, data) {
      const response = await api.put(`/actuators/${id}`, data)
      const index = this.actuators.findIndex((a) => a.id === id)
      if (index !== -1) this.actuators[index] = response.data
      return response.data
    },
    async delete(id) {
      await api.delete(`/actuators/${id}`)
      this.actuators = this.actuators.filter((a) => a.id !== id)
    },
    async toggle(id) {
      const response = await api.post(`/actuators/${id}/toggle`)
      const index = this.actuators.findIndex((a) => a.id === id)
      if (index !== -1) this.actuators[index] = response.data
      return response.data
    },
    async runAuto() {
      // If you have a /run-auto endpoint, call it; otherwise keep mock logic
      // For now, we'll keep the mock logic in the frontend or add a new endpoint later.
      // I'll provide an endpoint in the next step.
      const response = await api.post('/actuators/run-auto')
      return response.data
    },
  },
})
