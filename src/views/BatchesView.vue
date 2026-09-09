<template>
  <div class="batches-container">
    <div class="header-actions">
      <h1>Cultivation Batches</h1>
      <button @click="showForm = true"><font-awesome-icon icon="plus" /> New Batch</button>
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
        <form @submit.prevent="saveBatch">
          <div class="form-group">
            <label>Crop Type</label><input v-model="form.cropType" required />
          </div>
          <div class="form-group"><label>Variety</label><input v-model="form.variety" /></div>
          <div class="form-group">
            <label>Plot</label>
            <select v-model="form.plotId">
              <option v-for="p in plotsStore.plots" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Start Date</label><input v-model="form.startDate" type="date" />
          </div>
          <div class="form-group">
            <label>Initial Plant Count</label
            ><input v-model.number="form.initialCount" type="number" />
          </div>
          <div class="form-group">
            <label>Expected Yield (kg)</label
            ><input v-model.number="form.expectedYield" type="number" />
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
import { useBatchesStore } from '../stores/batches'
import { usePlotsStore } from '../stores/plots'

const batchesStore = useBatchesStore()
const plotsStore = usePlotsStore()
const showForm = ref(false)
const editing = ref(false)
let editId = null
const form = reactive({
  cropType: '',
  variety: '',
  plotId: '',
  startDate: '',
  initialCount: 100,
  expectedYield: 0,
})

onMounted(async () => {
  await plotsStore.fetch()
  await batchesStore.fetch()
})

const getPlotName = (id) => plotsStore.plots.find((p) => p.id === id)?.name || 'Unknown'

const saveBatch = async () => {
  if (editing.value) await batchesStore.update(editId, { ...form })
  else await batchesStore.create({ ...form })
  closeForm()
}

const editBatch = (batch) => {
  editing.value = true
  editId = batch.id
  Object.assign(form, batch)
  showForm.value = true
}

const deleteBatch = async (id) => {
  if (confirm('Delete this batch?')) await batchesStore.delete(id)
}

const closeForm = () => {
  showForm.value = false
  editing.value = false
  editId = null
  Object.assign(form, {
    cropType: '',
    variety: '',
    plotId: '',
    startDate: '',
    initialCount: 100,
    expectedYield: 0,
  })
}
</script>

<style scoped>
.batches-container {
  padding: 0 0.5rem;
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
  color: #fff;
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
  color: #fff;
}

.view-link:hover {
  opacity: 0.85;
  transform: scale(1.02);
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

@media (max-width: 768px) {
  .batch-grid {
    grid-template-columns: 1fr;
  }
  .actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
