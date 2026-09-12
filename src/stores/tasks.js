import { defineStore } from 'pinia'
import api from '../api/config'
import { isFresh, markFresh } from '../utils/cache'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    lastFetched: 0,
  }),

  getters: {
    pendingTasks: (state) => state.tasks.filter((t) => t.status === 'pending'),
    overdueTasks: (state) =>
      state.tasks.filter(
        (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done',
      ),
  },

  actions: {
    async fetch(force = false) {
      if (!force && isFresh(this.lastFetched)) return

      this.loading = true
      try {
        const response = await api.get('/tasks')
        this.tasks = response.data
        this.lastFetched = markFresh()
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      const response = await api.post('/tasks', data)
      this.tasks.push(response.data)
      this.lastFetched = markFresh()
      return response.data
    },

    async update(id, data) {
      const response = await api.put(`/tasks/${id}`, data)
      const index = this.tasks.findIndex((t) => t.id === id)
      if (index !== -1) this.tasks[index] = response.data
      this.lastFetched = markFresh()
      return response.data
    },

    async delete(id) {
      await api.delete(`/tasks/${id}`)
      this.tasks = this.tasks.filter((t) => t.id !== id)
      this.lastFetched = markFresh()
    },
  },
})
