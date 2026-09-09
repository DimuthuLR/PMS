<template>
  <div class="care-container">
    <div class="header-actions">
      <h1>Care Logs</h1>
      <button @click="showForm = true"><font-awesome-icon icon="plus" /> Add Care Log</button>
    </div>

    <div class="card" v-if="careStore.logs.length === 0">
      <p>No care logs yet. Add one!</p>
    </div>

    <div class="care-grid" v-else>
      <div v-for="log in careStore.logs" :key="log.id" class="card log-card">
        <h3>{{ log.product }}</h3>
        <p><strong>Batch:</strong> {{ getBatchName(log.batchId) }}</p>
        <p><strong>Type:</strong> {{ log.type }} | <strong>Method:</strong> {{ log.method }}</p>
        <p><strong>Quantity:</strong> {{ log.quantity }}</p>
        <p><strong>Cost:</strong> ${{ log.cost }}</p>
        <p>
          <strong>Date:</strong> {{ log.date }} | <strong>Next Due:</strong>
          {{ log.nextDue || 'N/A' }}
        </p>
        <div class="actions">
          <button class="edit-btn" @click="editLog(log)">
            <font-awesome-icon icon="edit" /> Edit
          </button>
          <button class="delete-btn" @click="deleteLog(log.id)">
            <font-awesome-icon icon="trash" /> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit Care Log' : 'New Care Log' }}</h2>
        <form @submit.prevent="saveLog">
          <div class="form-group">
            <label>Batch</label>
            <select v-model="form.batchId" required>
              <option v-for="b in batchesStore.batches" :key="b.id" :value="b.id">
                {{ b.cropType }} ({{ b.variety }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Type</label>
            <select v-model="form.type">
              <option value="organic">Organic</option>
              <option value="chemical">Chemical</option>
            </select>
          </div>
          <div class="form-group">
            <label>Product</label><input v-model="form.product" required />
          </div>
          <div class="form-group"><label>Quantity</label><input v-model="form.quantity" /></div>
          <div class="form-group">
            <label>Method</label><input v-model="form.method" placeholder="e.g. Drench, Spray" />
          </div>
          <div class="form-group">
            <label>Cost ($)</label><input v-model.number="form.cost" type="number" step="0.01" />
          </div>
          <div class="form-group"><label>Date</label><input v-model="form.date" type="date" /></div>
          <div class="form-group">
            <label>Next Due Date</label><input v-model="form.nextDue" type="date" />
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
import { useCareStore } from '../stores/care'
import { useBatchesStore } from '../stores/batches'

const careStore = useCareStore()
const batchesStore = useBatchesStore()
const showForm = ref(false)
const editing = ref(false)
let editId = null
const form = reactive({
  batchId: '',
  type: 'organic',
  product: '',
  quantity: '',
  method: '',
  cost: 0,
  date: '',
  nextDue: '',
})

onMounted(async () => {
  await batchesStore.fetch()
  await careStore.fetch()
})

const getBatchName = (id) => batchesStore.batches.find((b) => b.id === id)?.cropType || 'Unknown'

const saveLog = async () => {
  const data = { ...form }
  if (editing.value) await careStore.update(editId, data)
  else await careStore.create(data)
  closeForm()
}

const editLog = (log) => {
  editing.value = true
  editId = log.id
  Object.assign(form, log)
  showForm.value = true
}

const deleteLog = async (id) => {
  if (confirm('Delete this log?')) await careStore.delete(id)
}

const closeForm = () => {
  showForm.value = false
  editing.value = false
  editId = null
  Object.assign(form, {
    batchId: '',
    type: 'organic',
    product: '',
    quantity: '',
    method: '',
    cost: 0,
    date: '',
    nextDue: '',
  })
}
</script>

<style scoped>
.care-container {
  padding: 0 0.5rem;
}

.care-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.log-card {
  transition: 0.2s;
  padding: 1.2rem;
  background: var(--card-bg);
}

.log-card:hover {
  transform: translateY(-2px);
}

/* ===== FIXED: Button spacing ===== */
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

.edit-btn {
  background: var(--info);
  color: #fff;
}

.edit-btn:hover {
  opacity: 0.85;
  transform: scale(1.02);
}

.delete-btn {
  background: var(--danger);
  color: #fff;
}

.delete-btn:hover {
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

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

.secondary {
  background: var(--border-color);
  color: var(--text-color);
}

/* Responsive */
@media (max-width: 768px) {
  .care-grid {
    grid-template-columns: 1fr;
  }
  .actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
