<template>
  <div class="batches-container">
    <div class="header-actions">
      <h1>Cultivation Batches</h1>
      <button @click="openNewForm"><font-awesome-icon icon="plus" /> New Batch</button>
    </div>

    <!-- No plots warning -->
    <div v-if="plotsStore.plots.length === 0" class="warning-banner card">
      ⚠️ You need to create a <router-link to="/plots">Plot</router-link> before adding a batch.
    </div>

    <!-- Empty state -->
    <div v-if="batchesStore.batches.length === 0" class="empty-state card">
      <p>No batches yet.</p>
      <p class="hint">Click "New Batch" to create your first crop cycle.</p>
    </div>

    <div class="batch-grid">
      <div v-for="batch in batchesStore.batches" :key="batch.id" class="card batch-card">
        <h3>
          {{ batch.cropType }} <span class="badge">{{ batch.stage }}</span>
        </h3>
        <p><strong>Variety:</strong> {{ batch.variety }}</p>
        <p><strong>Plot:</strong> {{ getPlotName(batch.plotId) }}</p>
        <p>
          <strong>Plants:</strong> {{ batch.initialCount }} | <strong>Start:</strong>
          {{ batch.startDate }}
        </p>
        <div class="actions">
          <router-link :to="`/batches/${batch.id}`" class="view-link">
            <font-awesome-icon icon="eye" /> View Details
          </router-link>
          <button class="edit-btn" @click="editBatch(batch)">
            <font-awesome-icon icon="edit" /> Edit
          </button>
          <button class="delete-btn" @click="deleteBatch(batch.id)">
            <font-awesome-icon icon="trash" /> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit Batch' : 'New Batch' }}</h2>

        <!-- Error message -->
        <div v-if="errorMessage" class="error-banner">❌ {{ errorMessage }}</div>

        <form @submit.prevent="saveBatch">
          <div class="form-group">
            <label>Crop Type *</label>
            <input v-model="form.cropType" required />
          </div>
          <div class="form-group">
            <label>Variety</label>
            <input v-model="form.variety" />
          </div>
          <div class="form-group">
            <label>Plot *</label>
            <select v-model.number="form.plotId" required>
              <option value="" disabled>Select a plot...</option>
              <option v-for="p in plotsStore.plots" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Start Date *</label>
            <input v-model="form.startDate" type="date" required />
          </div>
          <div class="form-group">
            <label>Initial Plant Count</label>
            <input v-model.number="form.initialCount" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>Expected Yield (kg)</label>
            <input v-model.number="form.expectedYield" type="number" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label>Stage</label>
            <select v-model="form.stage">
              <option>Sowing</option>
              <option>Nursery</option>
              <option>Transplanting</option>
              <option>Vegetative</option>
              <option>Flowering</option>
              <option>Fruiting</option>
              <option>Harvesting</option>
              <option>Decommissioned</option>
            </select>
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
import { ref, reactive, onMounted } from 'vue'
import { useBatchesStore } from '../stores/batches'
import { usePlotsStore } from '../stores/plots'

const batchesStore = useBatchesStore()
const plotsStore = usePlotsStore()

const showForm = ref(false)
const editing = ref(false)
const saving = ref(false)
const errorMessage = ref('')
let editId = null

const today = new Date().toISOString().slice(0, 10)

const emptyForm = () => ({
  cropType: '',
  variety: '',
  plotId: '',
  startDate: today,
  initialCount: 100,
  expectedYield: 0,
  stage: 'Sowing',
})

const form = reactive(emptyForm())

onMounted(async () => {
  await plotsStore.fetch()
  await batchesStore.fetch()
})

const getPlotName = (id) => plotsStore.plots.find((p) => p.id === id)?.name || 'Unknown'

const openNewForm = () => {
  Object.assign(form, emptyForm())
  editing.value = false
  editId = null
  errorMessage.value = ''
  showForm.value = true
}

const saveBatch = async () => {
  errorMessage.value = ''

  // Client-side validation (belt + braces with HTML5 required)
  if (!form.cropType?.trim()) {
    errorMessage.value = 'Crop type is required.'
    return
  }
  if (!form.plotId) {
    errorMessage.value = 'Please select a plot.'
    return
  }
  if (!form.startDate) {
    errorMessage.value = 'Start date is required.'
    return
  }

  saving.value = true
  try {
    if (editing.value) {
      await batchesStore.update(editId, { ...form })
    } else {
      await batchesStore.create({ ...form })
    }
    closeForm()
  } catch (err) {
    // Show the real backend error message to the user
    const msg =
      err.response?.data?.message || err.message || 'Failed to save. Check the console for details.'
    errorMessage.value = msg
    console.error('[BatchesView] Save failed:', err.response?.data || err)
  } finally {
    saving.value = false
  }
}

const editBatch = (batch) => {
  editing.value = true
  editId = batch.id
  errorMessage.value = ''
  Object.assign(form, {
    cropType: batch.cropType || '',
    variety: batch.variety || '',
    plotId: batch.plotId || '',
    startDate: batch.startDate || '',
    initialCount: batch.initialCount ?? 0,
    expectedYield: batch.expectedYield ?? 0,
    stage: batch.stage || 'Sowing',
  })
  showForm.value = true
}

const deleteBatch = async (id) => {
  if (!confirm('Delete this batch?')) return
  try {
    await batchesStore.delete(id)
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
.batches-container {
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

.batch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.batch-card {
  transition: 0.2s;
  padding: 1.2rem;
  background: var(--card-bg);
}

.batch-card:hover {
  transform: translateY(-2px);
}

.badge {
  background: var(--primary);
  color: var(--primary-contrast);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 400;
  margin-left: 0.5rem;
}

.actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
  align-items: center;
}

.actions button,
.view-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-weight: 500;
}

.view-link {
  background: var(--primary);
  color: var(--primary-contrast);
}

.view-link:hover {
  opacity: 0.85;
  transform: scale(1.02);
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

@media (max-width: 768px) {
  .batch-grid {
    grid-template-columns: 1fr;
  }
}
</style>
