<template>
  <div class="financial-container">
    <div class="header-actions">
      <h1>Financial – Expenses</h1>
      <button @click="showForm = true"><font-awesome-icon icon="plus" /> Add Expense</button>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <h4>Total Expenses</h4>
        <p>${{ totalExpenses }}</p>
      </div>
      <div class="stat-card">
        <h4>Expense Categories</h4>
        <p>{{ categoryCount }}</p>
      </div>
      <div class="stat-card">
        <h4>Top Category</h4>
        <p>{{ topCategory || 'N/A' }}</p>
      </div>
    </div>

    <div class="expense-grid">
      <div v-for="exp in financialStore.expenses" :key="exp.id" class="card expense-card">
        <h3>{{ exp.category }}</h3>
        <p><strong>Batch:</strong> {{ getBatchName(exp.batchId) }}</p>
        <p><strong>Cost:</strong> ${{ exp.costAmount }}</p>
        <p><strong>Date:</strong> {{ exp.date }}</p>
        <p v-if="exp.description">
          <em>{{ exp.description }}</em>
        </p>
        <div class="actions">
          <button class="edit-btn" @click="editExpense(exp)">
            <font-awesome-icon icon="edit" /> Edit
          </button>
          <button class="delete-btn" @click="deleteExpense(exp.id)">
            <font-awesome-icon icon="trash" /> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit Expense' : 'New Expense' }}</h2>
        <form @submit.prevent="saveExpense">
          <div class="form-group">
            <label>Batch</label>
            <select v-model="form.batchId" required>
              <option v-for="b in batchesStore.batches" :key="b.id" :value="b.id">
                {{ b.cropType }} ({{ b.variety }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="form.category">
              <option value="Seeds">Seeds</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Water">Water</option>
              <option value="Labor">Labor</option>
              <option value="Overhead">Overhead</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cost ($)</label
            ><input v-model.number="form.costAmount" type="number" step="0.01" required />
          </div>
          <div class="form-group">
            <label>Date</label><input v-model="form.date" type="date" required />
          </div>
          <div class="form-group">
            <label>Description</label><input v-model="form.description" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useFinancialStore } from '../stores/financial'
import { useBatchesStore } from '../stores/batches'

const financialStore = useFinancialStore()
const batchesStore = useBatchesStore()
const showForm = ref(false)
const editing = ref(false)
let editId = null
const form = reactive({ batchId: '', category: 'Seeds', costAmount: 0, date: '', description: '' })

const totalExpenses = computed(() => financialStore.expenses.reduce((s, e) => s + e.costAmount, 0))
const categoryCount = computed(() => {
  const set = new Set(financialStore.expenses.map((e) => e.category))
  return set.size
})
const topCategory = computed(() => {
  const map = {}
  financialStore.expenses.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + e.costAmount
  })
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1])
  return sorted.length ? sorted[0][0] : null
})

onMounted(async () => {
  await batchesStore.fetch()
  await financialStore.fetch()
})

const getBatchName = (id) => batchesStore.batches.find((b) => b.id === id)?.cropType || 'Unknown'

const saveExpense = async () => {
  if (editing.value) await financialStore.update(editId, { ...form })
  else await financialStore.create({ ...form })
  closeForm()
}

const editExpense = (exp) => {
  editing.value = true
  editId = exp.id
  Object.assign(form, exp)
  showForm.value = true
}

const deleteExpense = async (id) => {
  if (confirm('Delete this expense?')) await financialStore.delete(id)
}

const closeForm = () => {
  showForm.value = false
  editing.value = false
  editId = null
  Object.assign(form, { batchId: '', category: 'Seeds', costAmount: 0, date: '', description: '' })
}
</script>

<style scoped>
.financial-container {
  padding: 0 0.5rem;
}

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

.expense-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.expense-card {
  transition: 0.2s;
  padding: 1.2rem;
  background: var(--card-bg);
}

.expense-card:hover {
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
  .expense-grid {
    grid-template-columns: 1fr;
  }
}
</style>
