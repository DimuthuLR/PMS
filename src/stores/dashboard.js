import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'
import { onSocketEvent } from '../api/socket'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    data: null,
    loading: false,
    lastFetched: 0,
    _socketBound: false,
  }),

  getters: {
    systemStatus: (state) => state.data?.systemStatus ?? 'Unknown',
    activeBatches: (state) => state.data?.activeBatches ?? 0,
    totalPlants: (state) => state.data?.totalPlants ?? 0,
    todayHarvest: (state) => state.data?.todayHarvestKg ?? 0,
    pendingTasks: (state) => state.data?.pendingTasks ?? 0,
    overdueTasks: (state) => state.data?.overdueTasks ?? 0,
    activeValves: (state) => state.data?.activeValves ?? 0,
    totalActuators: (state) => state.data?.totalActuators ?? 0,
    autoActuators: (state) => state.data?.autoActuators ?? 0,
    alerts: (state) => state.data?.alerts ?? [],
    unreadAlerts: (state) => state.data?.unreadAlerts ?? 0,
    dangerAlerts: (state) => state.data?.dangerAlerts ?? 0,
    sensors: (state) => state.data?.sensors ?? null,
    weather: (state) => state.data?.weather ?? null,
    tank: (state) => state.data?.tank ?? null,
    tankPercentage: (state) => {
      const tank = state.data?.tank
      if (!tank || !tank.capacity) return 0
      return Math.round((tank.level / tank.capacity) * 100)
    },
    tankStatus: (state) => {
      const tank = state.data?.tank
      if (!tank || !tank.capacity) return 'ok'
      const pct = (tank.level / tank.capacity) * 100
      if (pct < 20) return 'danger'
      if (pct < 40) return 'warning'
      return 'ok'
    },
    sensorStatus: (state) => {
      const s = state.data?.sensors
      if (!s) return 'ok'
      if (s.temperature > 35 || s.soilMoisture < 30) return 'warning'
      if (s.temperature > 30 || s.soilMoisture < 40) return 'warning'
      return 'ok'
    },
    taskStatus: (state) => {
      const overdue = state.data?.overdueTasks ?? 0
      if (overdue > 2) return 'danger'
      if (overdue > 0) return 'warning'
      return 'ok'
    },
  },

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return
      this.loading = true
      try {
        const response = await api.get('/dashboard')
        this.data = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    invalidate() {
      this.lastFetched = 0
    },

    /**
     * Debounced background refresh.
     * Called when socket events signal something changed on the server.
     */
    scheduleRefresh() {
      if (this._refreshTimer) clearTimeout(this._refreshTimer)
      this._refreshTimer = setTimeout(() => {
        this.fetch(true)
      }, 800) // 800ms debounce — batching rapid bursts
    },

    bindSocketEvents() {
      if (this._socketBound) return
      this._socketBound = true

      // Whenever the backend says "something changed," schedule a refetch.
      onSocketEvent('dashboard:refresh', () => {
        this.scheduleRefresh()
      })
    },
  },

  persist: {
    key: 'pms-dashboard',
    pick: ['data', 'lastFetched'],
  },
})
