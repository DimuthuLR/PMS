<template>
  <div class="harvest-container">
    <div class="header-actions">
      <h1>Harvest Logs</h1>
      <button @click="showForm = true"><font-awesome-icon icon="plus" /> Add Harvest Entry</button>
    </div>

    <div class="card" v-if="harvestStore.harvests.length === 0">
      <p>No harvest entries yet. Log your first harvest!</p>
    </div>

    <div class="harvest-grid" v-else>
      <div v-for="h in harvestStore.harvests" :key="h.id" class="card harvest-card">
        <h3>{{ getBatchName(h.batchId) }}</h3>
        <p><strong>Date:</strong> {{ h.date }}</p>
        <p><strong>Weight:</strong> {{ h.weightKg }} kg</p>
        <p><strong>Grade:</strong> {{ h.grade }}</p>
        <p><strong>Revenue:</strong> ${{ h.revenue }}</p>
        <div class="actions">
          <button class="edit-btn" @click="editHarvest(h)">
            <font-awesome-icon icon="edit" /> Edit
          </button>
          <button class="delete-btn" @click="deleteHarvest(h.id)">
            <font-awesome-icon icon="trash" /> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit Harvest' : 'New Harvest' }}</h2>
        <form @submit.prevent="saveHarvest">
          <div class="form-group">
            <label>Batch</label>
            <select v-model="form.batchId" required>
              <option v-for="b in batchesStore.batches" :key="b.id" :value="b.id">
                {{ b.cropType }} ({{ b.variety }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label><input v-model="form.date" type="date" required />
          </div>
          <div class="form-group">
            <label>Weight (kg)</label
            ><input v-model.number="form.weightKg" type="number" step="0.1" required />
          </div>
          <div class="form-group">
            <label>Grade</label>
            <select v-model="form.grade">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="Rejects">Rejects</option>
            </select>
          </div>
          <div class="form-group">
            <label>Revenue ($)</label
            ><input v-model.number="form.revenue" type="number" step="0.01" />
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
import { useHarvestStore } from '../stores/harvest'
import { useBatchesStore } from '../stores/batches'

const harvestStore = useHarvestStore()
const batchesStore = useBatchesStore()
const showForm = ref(false)
const editing = ref(false)
let editId = null
const form = reactive({ batchId: '', date: '', weightKg: 0, grade: 'A', revenue: 0 })

onMounted(async () => {
  await batchesStore.fetch()
  await harvestStore.fetch()
})

const getBatchName = (id) => batchesStore.batches.find((b) => b.id === id)?.cropType || 'Unknown'

const saveHarvest = async () => {
  if (editing.value) await harvestStore.update(editId, { ...form })
  else await harvestStore.create({ ...form })
  closeForm()
}

const editHarvest = (h) => {
  editing.value = true
  editId = h.id
  Object.assign(form, h)
  showForm.value = true
}

const deleteHarvest = async (id) => {
  if (confirm('Delete this harvest entry?')) await harvestStore.delete(id)
}

const closeForm = () => {
  showForm.value = false
  editing.value = false
  editId = null
  Object.assign(form, { batchId: '', date: '', weightKg: 0, grade: 'A', revenue: 0 })
}
</script>

<style scoped>
.harvest-container {
  padding: 0 0.5rem;
}

.harvest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.harvest-card {
  transition: 0.2s;
  padding: 1.2rem;
  background: var(--card-bg);
}

.harvest-card:hover {
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
  .harvest-grid {
    grid-template-columns: 1fr;
  }
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
</style>
