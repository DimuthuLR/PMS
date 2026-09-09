import { defineStore } from 'pinia'
import api from '../api/config'

export const useTasksStore = defineStore('tasks', {
  state: () => ({ tasks: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await api.get('/tasks')
        this.tasks = response.data
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const response = await api.post('/tasks', data)
      this.tasks.push(response.data)
      return response.data
    },
    async update(id, data) {
      const response = await api.put(`/tasks/${id}`, data)
      const index = this.tasks.findIndex((t) => t.id === id)
      if (index !== -1) this.tasks[index] = response.data
      return response.data
    },
    async delete(id) {
      await api.delete(`/tasks/${id}`)
      this.tasks = this.tasks.filter((t) => t.id !== id)
    },
    async getByBatch(batchId) {
      const response = await api.get(`/tasks?batch_id=${batchId}`)
      return response.data
    },
  },
})
