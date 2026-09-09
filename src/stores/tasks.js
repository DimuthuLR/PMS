import { defineStore } from 'pinia'
import { mockApi } from '../api/mockService'

export const useTasksStore = defineStore('tasks', {
  state: () => ({ tasks: [], loading: false }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.tasks = await mockApi.getTasks()
      } finally {
        this.loading = false
      }
    },
    async create(data) {
      const t = await mockApi.createTask(data)
      this.tasks.push(t)
      return t
    },
    async update(id, data) {
      const t = await mockApi.updateTask(id, data)
      const i = this.tasks.findIndex((x) => x.id === id)
      if (i > -1) this.tasks[i] = t
      return t
    },
    async delete(id) {
      await mockApi.deleteTask(id)
      this.tasks = this.tasks.filter((t) => t.id !== id)
    },
    getByBatch(batchId) {
      return this.tasks.filter((t) => t.batchId === batchId)
    },
  },
})
