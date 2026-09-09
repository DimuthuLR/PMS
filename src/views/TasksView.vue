<template>
  <div class="tasks-container">
    <div class="header-actions">
      <h1>Tasks & Labor</h1>
      <button @click="showForm = true"><font-awesome-icon icon="plus" /> New Task</button>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <h4>Pending</h4>
        <p>{{ pendingCount }}</p>
      </div>
      <div class="stat-card">
        <h4>In Progress</h4>
        <p>{{ inProgressCount }}</p>
      </div>
      <div class="stat-card">
        <h4>Done</h4>
        <p>{{ doneCount }}</p>
      </div>
    </div>

    <!-- Task Cards -->
    <div class="task-grid">
      <div v-for="task in tasksStore.tasks" :key="task.id" class="card task-card">
        <h3>{{ task.title }}</h3>
        <p><strong>Batch:</strong> {{ getBatchName(task.batchId) }}</p>
        <p><strong>Assigned:</strong> {{ task.assignedTo }}</p>
        <p><strong>Deadline:</strong> {{ task.deadline }}</p>
        <p>
          <strong>Status:</strong> <span :class="task.status">{{ task.status }}</span>
        </p>
        <p>
          <strong>Hours:</strong> {{ task.hoursLogged }} | <strong>Labor Cost:</strong> ${{
            task.laborCost
          }}
        </p>
        <div class="actions">
          <select v-model="task.status" @change="updateStatus(task)">
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button @click="editTask(task)"><font-awesome-icon icon="edit" /></button>
          <button class="danger" @click="deleteTask(task.id)">
            <font-awesome-icon icon="trash" />
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal (unchanged) -->
    <div v-if="showForm" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit Task' : 'New Task' }}</h2>
        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label>Batch</label>
            <select v-model="form.batchId" required>
              <option v-for="b in batchesStore.batches" :key="b.id" :value="b.id">
                {{ b.cropType }}
              </option>
            </select>
          </div>
          <div class="form-group"><label>Title</label><input v-model="form.title" required /></div>
          <div class="form-group">
            <label>Assigned To</label><input v-model="form.assignedTo" />
          </div>
          <div class="form-group">
            <label>Deadline</label><input v-model="form.deadline" type="date" />
          </div>
          <div class="form-group">
            <label>Hours Logged</label
            ><input v-model.number="form.hoursLogged" type="number" step="0.5" />
          </div>
          <div class="form-group">
            <label>Labor Cost ($)</label
            ><input v-model.number="form.laborCost" type="number" step="0.01" />
          </div>
          <button type="submit">Save</button>
          <button type="button" class="secondary" @click="closeForm">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useTasksStore } from '../stores/tasks'
import { useBatchesStore } from '../stores/batches'

const tasksStore = useTasksStore()
const batchesStore = useBatchesStore()
const showForm = ref(false)
const editing = ref(false)
let editId = null
const form = reactive({
  batchId: '',
  title: '',
  assignedTo: '',
  deadline: '',
  hoursLogged: 0,
  laborCost: 0,
})

const pendingCount = computed(() => tasksStore.tasks.filter((t) => t.status === 'pending').length)
const inProgressCount = computed(
  () => tasksStore.tasks.filter((t) => t.status === 'in-progress').length,
)
const doneCount = computed(() => tasksStore.tasks.filter((t) => t.status === 'done').length)

onMounted(async () => {
  await batchesStore.fetch()
  await tasksStore.fetch()
})

const getBatchName = (id) => batchesStore.batches.find((b) => b.id === id)?.cropType || 'Unknown'

const updateStatus = async (task) => {
  await tasksStore.update(task.id, { status: task.status })
}

const saveTask = async () => {
  if (editing.value) await tasksStore.update(editId, { ...form })
  else await tasksStore.create({ ...form })
  closeForm()
}

const editTask = (task) => {
  editing.value = true
  editId = task.id
  Object.assign(form, task)
  showForm.value = true
}

const deleteTask = async (id) => {
  if (confirm('Delete this task?')) await tasksStore.delete(id)
}

const closeForm = () => {
  showForm.value = false
  editing.value = false
  editId = null
  Object.assign(form, {
    batchId: '',
    title: '',
    assignedTo: '',
    deadline: '',
    hoursLogged: 0,
    laborCost: 0,
  })
}
</script>

<style scoped>
.tasks-container {
  padding: 0 0.5rem;
}

/* Stats row - fixed layout */
.stats-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.stat-card {
  background: var(--card-bg);
  padding: 1.2rem 2rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  flex: 1;
  min-width: 120px;
  text-align: center;
}

.stat-card h4 {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  font-weight: 400;
  margin-bottom: 0.3rem;
}

.stat-card p {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
}

/* Task grid - fixed */
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.task-card {
  transition: 0.2s;
  padding: 1.2rem;
  background: var(--card-bg);
}

.task-card:hover {
  transform: translateY(-2px);
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 0.8rem;
}

select {
  width: auto;
  padding: 0.3rem 0.6rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-row {
    gap: 0.8rem;
  }
  .stat-card {
    min-width: 80px;
    padding: 0.8rem 1rem;
  }
  .stat-card p {
    font-size: 1.5rem;
  }
  .task-grid {
    grid-template-columns: 1fr;
  }
}

/* Status colors */
.pending {
  color: var(--warning);
}
.in-progress {
  color: var(--info);
}
.done {
  color: var(--primary);
}

/* Modal (unchanged) */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  background: var(--card-bg);
}
</style>
