<template>
  <div class="pest-container">
    <div class="header-actions">
      <h1>Pest & Disease Diagnostics</h1>
      <button @click="showForm = true"><font-awesome-icon icon="plus" /> Log Symptom</button>
    </div>

    <!-- Empty state -->
    <div v-if="pestStore.records.length === 0" class="empty-state card">
      <p>No symptoms logged yet.</p>
      <p class="hint">Click "Log Symptom" to record a pest or disease observation.</p>
    </div>

    <div class="pest-grid">
      <div
        v-for="p in pestStore.records"
        :key="p.id"
        class="card pest-card"
        :class="{ resolved: p.resolved }"
      >
        <h3>{{ p.symptom }}</h3>
        <p><strong>Batch:</strong> {{ getBatchName(p.batchId) }}</p>
        <p><strong>Severity:</strong> {{ p.severity }}/5</p>
        <p><strong>Date:</strong> {{ p.date }}</p>
        <p><strong>Status:</strong> {{ p.resolved ? '✅ Resolved' : '⚠️ Active' }}</p>
        <div class="actions">
          <button class="resolve-btn" @click="toggleResolved(p)">
            {{ p.resolved ? 'Mark Active' : 'Mark Resolved' }}
          </button>
          <button class="edit-btn" @click="editPest(p)">
            <font-awesome-icon icon="edit" /> Edit
          </button>
          <button class="delete-btn" @click="deletePest(p.id)">
            <font-awesome-icon icon="trash" /> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit Symptom' : 'New Symptom' }}</h2>
        <form @submit.prevent="savePest">
          <div class="form-group">
            <label>Batch</label>
            <select v-model.number="form.batchId" required>
              <option value="" disabled>Select a batch...</option>
              <option v-for="b in batchesStore.batches" :key="b.id" :value="b.id">
                {{ b.cropType }} ({{ b.variety || 'no variety' }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Symptom Description</label>
            <textarea v-model="form.symptom" required></textarea>
          </div>
          <div class="form-group">
            <label>Severity (1–5)</label>
            <input v-model.number="form.severity" type="number" min="1" max="5" required />
          </div>
          <div class="form-group">
            <label>Date</label>
            <input v-model="form.date" type="date" required />
          </div>
          <div class="form-group">
            <label>Image URL (optional)</label>
            <input v-model="form.imageUrl" />
          </div>
          <div class="form-actions">
            <button type="submit">Save</button>
            <button type="button" class="secondary" @click="closeForm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { usePestStore } from '../stores/pest'
import { useBatchesStore } from '../stores/batches'

const pestStore = usePestStore()
const batchesStore = useBatchesStore()
const showForm = ref(false)
const editing = ref(false)
let editId = null

const today = new Date().toISOString().slice(0, 10)
const form = reactive({ batchId: '', symptom: '', severity: 3, date: today, imageUrl: '' })

onMounted(async () => {
  await batchesStore.fetch()
  await pestStore.fetch()
})

const getBatchName = (id) => batchesStore.batches.find((b) => b.id === id)?.cropType || 'Unknown'

const toggleResolved = async (p) => {
  await pestStore.update(p.id, { resolved: !p.resolved })
}

const savePest = async () => {
  if (editing.value) {
    await pestStore.update(editId, { ...form })
  } else {
    await pestStore.create({ ...form })
  }
  closeForm()
}

const editPest = (p) => {
  editing.value = true
  editId = p.id
  Object.assign(form, {
    batchId: p.batchId,
    symptom: p.symptom,
    severity: p.severity,
    date: p.date,
    imageUrl: p.imageUrl || '',
  })
  showForm.value = true
}

const deletePest = async (id) => {
  if (confirm('Delete this symptom?')) await pestStore.delete(id)
}

const closeForm = () => {
  showForm.value = false
  editing.value = false
  editId = null
  Object.assign(form, {
    batchId: '',
    symptom: '',
    severity: 3,
    date: today,
    imageUrl: '',
  })
}
</script>

<style scoped>
.pest-container {
  padding: 0 0.5rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  background: var(--card-bg);
}

.empty-state .hint {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.pest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.pest-card {
  transition: 0.2s;
  padding: 1.2rem;
  background: var(--card-bg);
  border-left: 4px solid var(--danger);
}

.pest-card.resolved {
  border-left-color: var(--primary);
  opacity: 0.75;
}

.pest-card:hover {
  transform: translateY(-2px);
}

.actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
}

.actions button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.resolve-btn {
  background: var(--warning);
  color: #1e1e1e;
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

.form-group textarea {
  min-height: 80px;
  resize: vertical;
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

.secondary {
  background: var(--border-color);
  color: var(--text-color);
}

@media (max-width: 768px) {
  .pest-grid {
    grid-template-columns: 1fr;
  }
}
</style>
