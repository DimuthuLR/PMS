import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'
import { useDashboardStore } from './dashboard'

export const useActuatorsStore = defineStore('actuators', {
  state: () => ({
    actuators: [],
    loading: false,
    lastFetched: 0,
  }),

  getters: {
    activeValves: (state) => state.actuators.filter((a) => a.type === 'valve' && a.status === 'on'),
    autoActuators: (state) => state.actuators.filter((a) => a.mode === 'auto'),
  },

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return
      this.loading = true
      try {
        const response = await api.get('/actuators')
        this.actuators = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      const response = await api.post('/actuators', data)
      this.actuators.push(response.data)
      this.lastFetched = markFresh()
      useDashboardStore().invalidate() // ✅
      return response.data
    },

    async update(id, data) {
      const response = await api.put(`/actuators/${id}`, data)
      const index = this.actuators.findIndex((a) => a.id === id)
      if (index !== -1) this.actuators[index] = response.data
      this.lastFetched = markFresh()
      useDashboardStore().invalidate() // ✅
      return response.data
    },

    async delete(id) {
      await api.delete(`/actuators/${id}`)
      this.actuators = this.actuators.filter((a) => a.id !== id)
      this.lastFetched = markFresh()
      useDashboardStore().invalidate() // ✅
    },

    async toggle(id) {
      const response = await api.post(`/actuators/${id}/toggle`)
      const index = this.actuators.findIndex((a) => a.id === id)
      if (index !== -1) this.actuators[index] = response.data
      this.lastFetched = markFresh()
      useDashboardStore().invalidate() // ✅
      return response.data
    },

    async runAuto() {
      const response = await api.post('/actuators/run-auto')
      await this.fetch(true)
      useDashboardStore().invalidate() // ✅
      return response.data
    },
  },
  persist: {
    key: 'pms-actuators',
    pick: ['actuators', 'lastFetched'],
  },
})
