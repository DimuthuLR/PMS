<template>
  <div>
    <div class="header-actions">
      <h1>Field Plots</h1>
      <button @click="showForm = true"><font-awesome-icon icon="plus" /> Add Plot</button>
    </div>

    <div class="grid-2">
      <div v-for="plot in plotsStore.plots" :key="plot.id" class="card plot-card">
        <h3>{{ plot.name }}</h3>
        <p>
          <strong>Grid:</strong> {{ plot.gridRef }} | <strong>Soil:</strong> {{ plot.soilType }}
        </p>
        <p><strong>Dimensions:</strong> {{ plot.dimensions }}</p>
        <div class="actions">
          <button @click="editPlot(plot)"><font-awesome-icon icon="edit" /></button>
          <button class="danger" @click="deletePlot(plot.id)">
            <font-awesome-icon icon="trash" />
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit Plot' : 'New Plot' }}</h2>
        <form @submit.prevent="savePlot">
          <div class="form-group"><label>Name</label><input v-model="form.name" required /></div>
          <div class="form-group">
            <label>Grid Reference</label><input v-model="form.gridRef" />
          </div>
          <div class="form-group"><label>Dimensions</label><input v-model="form.dimensions" /></div>
          <div class="form-group"><label>Soil Type</label><input v-model="form.soilType" /></div>
          <button type="submit">Save</button>
          <button type="button" class="secondary" @click="closeForm">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { usePlotsStore } from '../stores/plots'

const plotsStore = usePlotsStore()
const showForm = ref(false)
const editing = ref(false)
const form = reactive({ name: '', gridRef: '', dimensions: '', soilType: '' })
let editId = null

onMounted(() => plotsStore.fetch())

const savePlot = async () => {
  if (editing.value) {
    await plotsStore.update(editId, { ...form })
  } else {
    await plotsStore.create({ ...form })
  }
  closeForm()
}

const editPlot = (plot) => {
  editing.value = true
  editId = plot.id
  Object.assign(form, plot)
  showForm.value = true
}

const deletePlot = async (id) => {
  if (confirm('Delete this plot?')) await plotsStore.delete(id)
}

const closeForm = () => {
  showForm.value = false
  editing.value = false
  editId = null
  Object.assign(form, { name: '', gridRef: '', dimensions: '', soilType: '' })
}
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.plot-card {
  transition: 0.2s;
}
.plot-card:hover {
  transform: translateY(-2px);
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-content {
  max-width: 500px;
  width: 100%;
}
</style>
