import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'
import { onSocketEvent } from '../api/socket'
import { useDashboardStore } from './dashboard'

export const useAlertsStore = defineStore('alerts', {
  state: () => ({
    alerts: [],
    loading: false,
    lastFetched: 0,
    _socketBound: false,
  }),

  getters: {
    unreadCount: (state) => state.alerts.filter((a) => !a.read).length,
    dangerAlerts: (state) => state.alerts.filter((a) => a.type === 'danger' && !a.read),
  },

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return
      this.loading = true
      try {
        const response = await api.get('/alerts')
        this.alerts = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async markRead(id) {
      const response = await api.put(`/alerts/${id}`, { read: true })
      const index = this.alerts.findIndex((a) => a.id === id)
      if (index !== -1) this.alerts[index] = response.data
      this.lastFetched = markFresh()
      useDashboardStore().invalidate()
      return response.data
    },

    async markAllRead() {
      await api.post('/alerts/mark-all-read')
      this.alerts = this.alerts.map((a) => ({ ...a, read: true }))
      this.lastFetched = markFresh()
      useDashboardStore().invalidate()
    },

    async generate() {
      await api.post('/alerts/generate')
      await this.fetch(true)
      useDashboardStore().invalidate()
      return this.alerts
    },

    async create(data) {
      const response = await api.post('/alerts', data)
      this.alerts.unshift(response.data)
      this.lastFetched = markFresh()
      useDashboardStore().invalidate()
      return response.data
    },

    async delete(id) {
      await api.delete(`/alerts/${id}`)
      this.alerts = this.alerts.filter((a) => a.id !== id)
      this.lastFetched = markFresh()
      useDashboardStore().invalidate()
    },

    bindSocketEvents() {
      if (this._socketBound) return
      this._socketBound = true

      onSocketEvent('alert:new', (payload) => {
        if (!this.alerts.find((a) => a.id === payload.id)) {
          this.alerts.unshift(payload)
        }
        this.lastFetched = markFresh()
      })

      onSocketEvent('alert:updated', (payload) => {
        const index = this.alerts.findIndex((a) => a.id === payload.id)
        if (index !== -1) this.alerts[index] = payload
        this.lastFetched = markFresh()
      })

      onSocketEvent('alert:deleted', ({ id }) => {
        this.alerts = this.alerts.filter((a) => a.id !== id)
        this.lastFetched = markFresh()
      })

      onSocketEvent('alerts:all-read', () => {
        this.alerts = this.alerts.map((a) => ({ ...a, read: true }))
        this.lastFetched = markFresh()
      })
    },
  },

  persist: {
    key: 'pms-alerts',
    pick: ['alerts', 'lastFetched'],
  },
})
