import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'
import { onSocketEvent } from '../api/socket'
import { useDashboardStore } from './dashboard'

export const useTankStore = defineStore('tank', {
  state: () => ({
    tank: null,
    loading: false,
    lastFetched: 0,
    _socketBound: false,
  }),

  getters: {
    percentage: (state) => {
      if (!state.tank || !state.tank.capacity) return 0
      return Math.round((state.tank.level / state.tank.capacity) * 100)
    },
    isLow: (state) => {
      if (!state.tank) return false
      return state.tank.level < state.tank.lowLevelThreshold
    },
    isFull: (state) => {
      if (!state.tank) return false
      return state.tank.level >= state.tank.fillLevelThreshold
    },
  },

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return
      this.loading = true
      try {
        const response = await api.get('/tank')
        this.tank = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async update(payload) {
      const response = await api.put('/tank', payload)
      this.tank = response.data
      this.lastFetched = markFresh()
      useDashboardStore().invalidate()
      return response.data
    },

    async togglePump() {
      const response = await api.post('/tank/toggle-pump')
      this.tank = response.data
      this.lastFetched = markFresh()
      useDashboardStore().invalidate()
      return response.data
    },

    bindSocketEvents() {
      if (this._socketBound) return
      this._socketBound = true

      onSocketEvent('tank:update', (payload) => {
        this.tank = payload
        this.lastFetched = markFresh()
      })
    },
  },

  persist: {
    key: 'pms-tank',
    pick: ['tank', 'lastFetched'],
  },
})
