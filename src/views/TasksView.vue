<template>
  <div class="tasks-container">
    <div class="header-actions">
      <h1>Tasks & Labor</h1>
      <button @click="openNewForm"><font-awesome-icon icon="plus" /> New Task</button>
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

    <!-- No batches warning -->
    <div v-if="batchesStore.batches.length === 0" class="warning-banner card">
      ⚠️ Create a <router-link to="/batches">Batch</router-link> before adding tasks.
    </div>

    <!-- Empty state -->
    <div v-if="tasksStore.tasks.length === 0" class="empty-state card">
      <p>No tasks yet.</p>
      <p class="hint">Click "New Task" to assign work to your team.</p>
    </div>

    <!-- Task Cards -->
    <div class="task-grid">
      <div v-for="task in tasksStore.tasks" :key="task.id" class="card task-card">
        <h3>{{ task.title }}</h3>
        <p><strong>Batch:</strong> {{ getBatchName(task.batchId) }}</p>
        <p><strong>Assigned:</strong> {{ task.assignedTo || '—' }}</p>
        <p><strong>Deadline:</strong> {{ task.deadline || '—' }}</p>
        <p>
          <strong>Status:</strong>
          <span :class="statusClass(task.status)">{{ formatStatus(task.status) }}</span>
        </p>
        <p>
          <strong>Hours:</strong> {{ task.hoursLogged }} | <strong>Labor Cost:</strong> ${{
            task.laborCost
          }}
        </p>
        <div class="actions">
          <select :value="task.status" @change="updateStatus(task, $event.target.value)">
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button class="edit-btn" @click="editTask(task)">
            <font-awesome-icon icon="edit" />
          </button>
          <button class="delete-btn" @click="deleteTask(task.id)">
            <font-awesome-icon icon="trash" />
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit Task' : 'New Task' }}</h2>

        <div v-if="errorMessage" class="error-banner">❌ {{ errorMessage }}</div>

        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label>Batch *</label>
            <select v-model.number="form.batchId" required>
              <option value="" disabled>Select a batch...</option>
              <option v-for="b in batchesStore.batches" :key="b.id" :value="b.id">
                {{ b.cropType }} ({{ b.variety || '' }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Title *</label>
            <input v-model="form.title" required />
          </div>
          <div class="form-group">
            <label>Assigned To</label>
            <input v-model="form.assignedTo" />
          </div>
          <div class="form-group">
            <label>Deadline</label>
            <input v-model="form.deadline" type="date" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div class="form-group">
            <label>Hours Logged</label>
            <input v-model.number="form.hoursLogged" type="number" step="0.5" min="0" />
          </div>
          <div class="form-group">
            <label>Labor Cost ($)</label>
            <input v-model.number="form.laborCost" type="number" step="0.01" min="0" />
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
            <button type="button" class="secondary" @click="closeForm" :disabled="saving">
              Cancel
            </button>
          </div>
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
const saving = ref(false)
const errorMessage = ref('')
let editId = null

const emptyForm = () => ({
  batchId: '',
  title: '',
  assignedTo: '',
  deadline: '',
  status: 'pending',
  hoursLogged: 0,
  laborCost: 0,
})

const form = reactive(emptyForm())

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

const formatStatus = (s) => {
  if (s === 'in-progress') return 'In Progress'
  if (!s) return 'Unknown'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const statusClass = (s) => s || 'pending'

const openNewForm = () => {
  Object.assign(form, emptyForm())
  editing.value = false
  editId = null
  errorMessage.value = ''
  showForm.value = true
}

const updateStatus = async (task, newStatus) => {
  try {
    await tasksStore.update(task.id, { status: newStatus })
  } catch (err) {
    alert('Failed to update status: ' + (err.response?.data?.message || err.message))
  }
}

const saveTask = async () => {
  errorMessage.value = ''

  // Client-side validation
  if (!form.batchId) {
    errorMessage.value = 'Please select a batch.'
    return
  }
  if (!form.title?.trim()) {
    errorMessage.value = 'Task title is required.'
    return
  }

  saving.value = true
  try {
    if (editing.value) {
      await tasksStore.update(editId, { ...form })
    } else {
      await tasksStore.create({ ...form })
    }
    closeForm()
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Failed to save task.'
    console.error('[TasksView] Save failed:', err.response?.data || err)
  } finally {
    saving.value = false
  }
}

const editTask = (task) => {
  editing.value = true
  editId = task.id
  errorMessage.value = ''
  Object.assign(form, {
    batchId: task.batchId,
    title: task.title || '',
    assignedTo: task.assignedTo || '',
    deadline: task.deadline || '',
    status: task.status || 'pending',
    hoursLogged: task.hoursLogged ?? 0,
    laborCost: task.laborCost ?? 0,
  })
  showForm.value = true
}

const deleteTask = async (id) => {
  if (!confirm('Delete this task?')) return
  try {
    await tasksStore.delete(id)
  } catch (err) {
    alert('Failed to delete: ' + (err.response?.data?.message || err.message))
  }
}

const closeForm = () => {
  showForm.value = false
  editing.value = false
  editId = null
  errorMessage.value = ''
  Object.assign(form, emptyForm())
}
</script>

<style scoped>
.tasks-container {
  padding: 0 0.5rem;
}

/* ✅ THE FIX — this class was missing entirely */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.warning-banner {
  padding: 1rem;
  background: var(--card-bg);
  border-left: 4px solid var(--warning);
  margin-bottom: 1rem;
  color: var(--text-color);
}

.warning-banner a {
  color: var(--primary);
  text-decoration: underline;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  background: var(--card-bg);
  margin-bottom: 1rem;
}

.empty-state .hint {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Stats row */
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
  box-shadow: var(--shadow-sm);
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

/* Task grid */
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
  padding: 0.4rem 0.6rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-color);
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.7rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}

.edit-btn {
  background: var(--info);
  color: #fff;
}

.delete-btn {
  background: var(--danger);
  color: #fff;
}

.actions button:hover {
  opacity: 0.85;
  transform: scale(1.02);
}

/* Status colors */
.pending {
  color: var(--warning);
  font-weight: 600;
}
.in-progress {
  color: var(--info);
  font-weight: 600;
}
.done {
  color: var(--success);
  font-weight: 600;
}

/* Modal */
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

.error-banner {
  background: var(--danger);
  color: #fff;
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-color);
  color: var(--text-color);
  font-family: inherit;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

.form-actions button {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}

.form-actions button[type='submit'] {
  background: var(--primary);
  color: var(--primary-contrast);
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary {
  background: var(--border-color);
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
</style>
