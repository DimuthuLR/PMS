import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'
import { onSocketEvent } from '../api/socket'
import { useDashboardStore } from './dashboard'

export const useSensorsStore = defineStore('sensors', {
  state: () => ({
    data: null,
    loading: false,
    lastFetched: 0,
    _socketBound: false,
  }),

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return
      this.loading = true
      try {
        const response = await api.get('/sensors')
        this.data = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async simulate() {
      const response = await api.post('/sensors/simulate')
      this.data = response.data
      this.lastFetched = markFresh()
      useDashboardStore().invalidate()
      return response.data
    },

    async update(payload) {
      const response = await api.put('/sensors', payload)
      this.data = response.data
      this.lastFetched = markFresh()
      useDashboardStore().invalidate()
      return response.data
    },

    /** Subscribe to real-time sensor events. Idempotent. */
    bindSocketEvents() {
      if (this._socketBound) return
      this._socketBound = true

      onSocketEvent('sensor:update', (payload) => {
        this.data = payload
        this.lastFetched = markFresh()
      })
    },
  },

  persist: {
    key: 'pms-sensors',
    pick: ['data', 'lastFetched'],
  },
})
