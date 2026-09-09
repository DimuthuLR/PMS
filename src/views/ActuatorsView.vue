<template>
  <div class="actuators-container">
    <!-- Header -->
    <div class="header-actions">
      <h1>💧 Irrigation Control</h1>
      <div class="header-buttons">
        <button v-if="isAdmin" @click="runAutoLogic" class="auto-btn" :disabled="runningAuto">
          <font-awesome-icon icon="sync" /> Run Auto Logic
        </button>
        <button v-if="isAdmin" @click="showAddForm = true">
          <font-awesome-icon icon="plus" /> Add Actuator
        </button>
      </div>
    </div>

    <!-- Tank Status -->
    <div class="tank-card card">
      <h3>Water Tank</h3>
      <div class="tank-info" v-if="tankStore.tank">
        <div class="tank-level">
          <div
            class="level-bar"
            :style="{ width: tankStore.tank.level + '%' }"
            :class="tankLevelClass"
          ></div>
          <span>{{ tankStore.tank.level }}%</span>
        </div>
        <div class="tank-details">
          <p><strong>Capacity:</strong> {{ tankStore.tank.capacity }} L</p>
          <p>
            <strong>Pump:</strong>
            <span :class="pumpStatusClass">{{ tankStore.tank.pumpStatus }}</span>
          </p>
          <p><strong>Mode:</strong> {{ tankStore.tank.autoMode ? 'Auto' : 'Manual' }}</p>
          <div class="tank-actions">
            <button v-if="canToggle" @click="togglePump" class="pump-toggle">
              {{ tankStore.tank.pumpStatus === 'on' ? 'Turn Off Pump' : 'Turn On Pump' }}
            </button>
            <button v-if="isAdminOrManager" @click="toggleTankMode" class="mode-toggle">
              Switch to {{ tankStore.tank.autoMode ? 'Manual' : 'Auto' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else>Loading tank data...</div>
    </div>

    <!-- Actuators Grid -->
    <div class="actuators-grid">
      <div v-for="act in actuatorsStore.actuators" :key="act.id" class="card actuator-card">
        <h3>{{ act.name }}</h3>
        <p><strong>Type:</strong> {{ act.type }}</p>
        <p><strong>Zone:</strong> {{ act.zone }}</p>
        <p>
          <strong>Status:</strong>
          <span :class="act.status">{{ act.status }}</span>
        </p>
        <p><strong>Mode:</strong> {{ act.mode }}</p>
        <div v-if="act.type === 'valve' && act.mode === 'auto'">
          <p><strong>Threshold:</strong> {{ act.autoThreshold }}% moisture</p>
        </div>

        <!-- Action Buttons -->
        <div class="actuator-actions">
          <button
            v-if="canToggle"
            @click="toggleActuator(act.id)"
            class="toggle-btn"
            :class="act.status"
          >
            {{ act.status === 'on' ? 'Turn Off' : 'Turn On' }}
          </button>

          <button v-if="isAdminOrManager" @click="toggleMode(act.id)" class="mode-btn">
            Set {{ act.mode === 'manual' ? 'Auto' : 'Manual' }}
          </button>

          <button v-if="isAdminOrManager" @click="editActuator(act)">
            <font-awesome-icon icon="edit" />
          </button>

          <button v-if="isAdmin" class="delete-btn" @click="deleteActuator(act.id)">
            <font-awesome-icon icon="trash" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="(showAddForm || editing) && isAdmin" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit Actuator' : 'Add Actuator' }}</h2>
        <form @submit.prevent="saveActuator">
          <div class="form-group">
            <label>Name</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Type</label>
            <select v-model="form.type">
              <option value="valve">Valve</option>
              <option value="pump">Pump</option>
            </select>
          </div>
          <div class="form-group">
            <label>Zone</label>
            <input v-model="form.zone" />
          </div>
          <div class="form-group" v-if="form.type === 'valve'">
            <label>Auto Threshold (soil moisture %)</label>
            <input v-model.number="form.autoThreshold" type="number" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>Mode</label>
            <select v-model="form.mode">
              <option value="manual">Manual</option>
              <option value="auto">Auto</option>
            </select>
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
import { useActuatorsStore } from '../stores/actuators'
import { useTankStore } from '../stores/tank'
import { useSensorsStore } from '../stores/sensors'
import { useAuthStore } from '../stores/auth'

// ----- Stores -----
const authStore = useAuthStore()
const actuatorsStore = useActuatorsStore()
const tankStore = useTankStore()
const sensorsStore = useSensorsStore()

// ----- Role Checks -----
const isAdmin = computed(() => authStore.role === 'admin')
const isManager = computed(() => authStore.role === 'manager')
const isAdminOrManager = computed(() => isAdmin.value || isManager.value)
const isOperator = computed(() => authStore.role === 'operator' || authStore.role === 'worker')
const canToggle = computed(() => isAdmin.value || isManager.value || isOperator.value)

// ----- State -----
const showAddForm = ref(false)
const editing = ref(false)
let editId = null
const form = reactive({
  name: '',
  type: 'valve',
  zone: '',
  mode: 'manual',
  autoThreshold: 40,
})
const runningAuto = ref(false)

// ----- Computed for Tank -----
const tankLevelClass = computed(() => {
  const level = tankStore.tank?.level || 0
  if (level < 20) return 'danger'
  if (level < 40) return 'warning'
  return 'ok'
})

const pumpStatusClass = computed(() => {
  const status = tankStore.tank?.pumpStatus
  return status === 'on' ? 'status-on' : 'status-off'
})

// ----- Tank Actions -----
const togglePump = async () => {
  if (!canToggle.value) return
  await tankStore.togglePump()
}

const toggleTankMode = async () => {
  if (!isAdminOrManager.value) return
  if (!tankStore.tank) return
  await tankStore.update({ autoMode: !tankStore.tank.autoMode })
}

// ----- Actuator Actions -----
const toggleActuator = async (id) => {
  if (!canToggle.value) return
  await actuatorsStore.toggle(id)
}

const toggleMode = async (id) => {
  if (!isAdminOrManager.value) return
  const act = actuatorsStore.actuators.find((a) => a.id === id)
  if (!act) return
  const newMode = act.mode === 'manual' ? 'auto' : 'manual'
  await actuatorsStore.update(id, { mode: newMode })
}

const runAutoLogic = async () => {
  if (!isAdmin.value) return
  runningAuto.value = true
  await actuatorsStore.runAuto()
  await tankStore.fetch()
  runningAuto.value = false
}

const saveActuator = async () => {
  if (!isAdmin.value) return
  if (editing.value) {
    await actuatorsStore.update(editId, { ...form })
  } else {
    await actuatorsStore.create({ ...form })
  }
  closeForm()
}

const editActuator = (act) => {
  if (!isAdminOrManager.value) return
  editing.value = true
  editId = act.id
  Object.assign(form, act)
  showAddForm.value = true
}

const deleteActuator = async (id) => {
  if (!isAdmin.value) return
  if (confirm('Delete this actuator?')) {
    await actuatorsStore.delete(id)
  }
}

const closeForm = () => {
  showAddForm.value = false
  editing.value = false
  editId = null
  Object.assign(form, { name: '', type: 'valve', zone: '', mode: 'manual', autoThreshold: 40 })
}

// ----- Lifecycle -----
onMounted(async () => {
  await Promise.all([actuatorsStore.fetch(), tankStore.fetch(), sensorsStore.fetch()])
})
</script>

<style scoped>
/* ===== CONTAINER ===== */
.actuators-container {
  padding: 0 0.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== HEADER ===== */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.header-buttons {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.auto-btn {
  background: var(--warning);
  color: #1e1e1e;
}

/* ===== TANK CARD ===== */
.tank-card {
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  background: var(--card-bg);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.tank-info {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
  margin-top: 0.5rem;
}

.tank-level {
  flex: 1;
  min-width: 150px;
  position: relative;
  height: 30px;
  background: var(--bg-color);
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.level-bar {
  height: 100%;
  transition: width 0.5s ease;
  background: var(--primary);
}
.level-bar.danger {
  background: var(--danger);
}
.level-bar.warning {
  background: var(--warning);
}
.level-bar.ok {
  background: var(--primary);
}

.tank-level span {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-weight: 700;
  font-size: 0.9rem;
}

.tank-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.tank-details p {
  margin: 0;
}

.tank-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pump-toggle,
.mode-toggle {
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.pump-toggle {
  background: var(--info);
  color: #fff;
}
.mode-toggle {
  background: #6c757d;
  color: #fff;
}

.status-on {
  color: var(--primary);
  font-weight: 700;
}
.status-off {
  color: var(--danger);
  font-weight: 700;
}

/* ===== ACTUATORS GRID - FIXED ===== */
.actuators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.actuator-card {
  padding: 1.2rem;
  background: var(--card-bg);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  transition: 0.2s;
  display: flex;
  flex-direction: column;
}

.actuator-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}

.actuator-card h3 {
  margin-bottom: 0.8rem;
  color: var(--primary);
  font-size: 1.1rem;
}

.actuator-card p {
  margin: 0.2rem 0;
  font-size: 0.9rem;
}

.actuator-card .on {
  color: var(--primary);
  font-weight: 700;
}
.actuator-card .off {
  color: var(--danger);
  font-weight: 700;
}

/* ===== ACTUATOR ACTIONS ===== */
.actuator-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.8rem;
  align-items: center;
}

.actuator-actions button {
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;
}

.toggle-btn.on {
  background: var(--danger);
  color: #fff;
}
.toggle-btn.off {
  background: var(--primary);
  color: #fff;
}

.mode-btn {
  background: var(--info);
  color: #fff;
}

.delete-btn {
  background: var(--danger);
  color: #fff;
}

.actuator-actions button:hover {
  opacity: 0.85;
  transform: scale(1.02);
}

/* ===== MODAL ===== */
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
  border-radius: 10px;
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

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .tank-info {
    flex-direction: column;
    align-items: stretch;
  }
  .actuators-grid {
    grid-template-columns: 1fr;
  }
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .header-buttons {
    justify-content: center;
  }
}
</style>
