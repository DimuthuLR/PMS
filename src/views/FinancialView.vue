<template>
  <div class="financial-container">
    <div class="header-actions">
      <h1>Financial – Expenses</h1>
      <button @click="openNewForm"><font-awesome-icon icon="plus" /> Add Expense</button>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <h4>Total Expenses</h4>
        <p>${{ totalExpenses.toFixed(2) }}</p>
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

    <!-- No batches warning -->
    <div v-if="batchesStore.batches.length === 0" class="warning-banner card">
      ⚠️ Create a <router-link to="/batches">Batch</router-link> before logging expenses.
    </div>

    <!-- Empty state -->
    <div v-if="financialStore.records.length === 0" class="empty-state card">
      <p>No expenses recorded yet.</p>
      <p class="hint">Click "Add Expense" to log your first cost.</p>
    </div>

    <!-- Expense List — ✅ FIXED: reads `records`, not `expenses` -->
    <div class="expense-grid">
      <div v-for="exp in financialStore.records" :key="exp.id" class="card expense-card">
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

    <!-- Add/Edit Modal -->
    <div v-if="showForm" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit Expense' : 'New Expense' }}</h2>

        <div v-if="errorMessage" class="error-banner">❌ {{ errorMessage }}</div>

        <form @submit.prevent="saveExpense">
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
            <label>Cost ($) *</label>
            <input v-model.number="form.costAmount" type="number" step="0.01" min="0" required />
          </div>
          <div class="form-group">
            <label>Date *</label>
            <input v-model="form.date" type="date" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input v-model="form.description" />
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
import { useFinancialStore } from '../stores/financial'
import { useBatchesStore } from '../stores/batches'

const financialStore = useFinancialStore()
const batchesStore = useBatchesStore()

const showForm = ref(false)
const editing = ref(false)
const saving = ref(false)
const errorMessage = ref('')
let editId = null

const today = new Date().toISOString().slice(0, 10)

const emptyForm = () => ({
  batchId: '',
  category: 'Seeds',
  costAmount: 0,
  date: today,
  description: '',
})

const form = reactive(emptyForm())

const totalExpenses = computed(() =>
  (financialStore.records || []).reduce((sum, e) => sum + (e.costAmount || 0), 0),
)

const categoryCount = computed(() => {
  if (!financialStore.records) return 0
  return new Set(financialStore.records.map((e) => e.category)).size
})

const topCategory = computed(() => {
  if (!financialStore.records?.length) return null
  const map = {}
  financialStore.records.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + (e.costAmount || 0)
  })
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1])
  return sorted.length ? sorted[0][0] : null
})

const getBatchName = (id) => {
  const batch = batchesStore.batches?.find((b) => b.id === id)
  return batch?.cropType || 'Unknown'
}

const openNewForm = () => {
  Object.assign(form, emptyForm())
  editing.value = false
  editId = null
  errorMessage.value = ''
  showForm.value = true
}

const saveExpense = async () => {
  errorMessage.value = ''
  if (!form.batchId) {
    errorMessage.value = 'Please select a batch.'
    return
  }
  if (!form.costAmount || form.costAmount <= 0) {
    errorMessage.value = 'Cost must be greater than 0.'
    return
  }
  if (!form.date) {
    errorMessage.value = 'Date is required.'
    return
  }

  saving.value = true
  try {
    if (editing.value) await financialStore.update(editId, { ...form })
    else await financialStore.create({ ...form })
    closeForm()
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Failed to save.'
    console.error('[FinancialView] Save failed:', err.response?.data || err)
  } finally {
    saving.value = false
  }
}

const editExpense = (exp) => {
  editing.value = true
  editId = exp.id
  errorMessage.value = ''
  Object.assign(form, {
    batchId: exp.batchId,
    category: exp.category,
    costAmount: exp.costAmount,
    date: exp.date,
    description: exp.description || '',
  })
  showForm.value = true
}

const deleteExpense = async (id) => {
  if (!confirm('Delete this expense?')) return
  try {
    await financialStore.delete(id)
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

onMounted(async () => {
  await batchesStore.fetch()
  await financialStore.fetch()
})
</script>

<style scoped>
.financial-container {
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
.stats-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}
.stat-card {
  background: var(--card-bg);
  padding: 1.2rem 2rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  flex: 1;
  min-width: 120px;
  text-align: center;
}
.stat-card h4 {
  font-size: 0.9rem;
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
}
.expense-card {
  padding: 1.2rem;
  background: var(--card-bg);
  transition: 0.2s;
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
</style>
