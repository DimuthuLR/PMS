<template>
  <div class="dashboard">
    <h1>🌱 Dashboard</h1>
    <p class="welcome">Welcome back, {{ authStore.user?.username }}!</p>

    <!-- System Health -->
    <div class="system-health card">
      <h3>System Health</h3>
      <div class="health-indicators">
        <div class="health-item" :class="sensorStatus">
          <span class="dot"></span> Sensors: {{ sensorStatus }}
        </div>
        <div class="health-item" :class="actuatorStatus">
          <span class="dot"></span> Actuators: {{ actuatorStatus }}
        </div>
        <div class="health-item" :class="taskStatus">
          <span class="dot"></span> Tasks: {{ taskStatus }}
        </div>
        <div class="health-item" :class="tankStatus">
          <span class="dot"></span> Water Tank: {{ tankStatus }}
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <div class="metric-card card">
        <h4>Active Batches</h4>
        <p>{{ activeBatches }}</p>
      </div>
      <div class="metric-card card">
        <h4>Total Plants</h4>
        <p>{{ totalPlants }}</p>
      </div>
      <div class="metric-card card">
        <h4>Today's Harvest</h4>
        <p>{{ todayHarvest }} kg</p>
      </div>
      <div class="metric-card card">
        <h4>Pending Tasks</h4>
        <p>{{ pendingTasks }}</p>
      </div>
    </div>

    <!-- Weather & Alerts - Two Column -->
    <div class="two-col">
      <div class="weather-section card">
        <h3>🌤️ Weather</h3>
        <div v-if="weatherStore.data">
          <div class="weather-current">
            <span class="weather-icon">{{ weatherIcon }}</span>
            <span class="weather-temp">{{ weatherStore.data.temp }}°C</span>
            <span class="weather-condition">{{ weatherStore.data.condition }}</span>
          </div>
          <p>
            Wind: {{ weatherStore.data.windSpeed }} km/h | Humidity:
            {{ weatherStore.data.humidity }}%
          </p>
          <div class="forecast">
            <div v-for="day in weatherStore.data.forecast" :key="day.day" class="forecast-day">
              <strong>{{ day.day }}</strong> {{ day.condition }} {{ day.temp }}°C
            </div>
          </div>
        </div>
        <div v-else>Loading weather...</div>
      </div>

      <div class="alerts-section card">
        <h3>🔔 Alerts</h3>
        <div v-if="alertsStore.alerts.length === 0" class="no-alerts">✅ All clear – no alerts</div>
        <div
          v-for="alert in alertsStore.alerts"
          :key="alert.id"
          class="alert-item"
          :class="alert.type"
        >
          <span class="alert-icon">{{ alertIcon(alert.type) }}</span>
          <div>
            <p class="alert-message">{{ alert.message }}</p>
            <small>{{ formatDate(alert.timestamp) }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Irrigation Status -->
    <div class="irrigation-card card">
      <h3>💧 Irrigation Status</h3>
      <div class="irrigation-grid" v-if="tankStore.tank">
        <div>
          <strong>Tank Level:</strong> {{ tankStore.tank.level }}%
          <span :class="tankLevelClass">{{
            tankStore.tank.pumpStatus === 'on' ? '🟢 Pump ON' : '🔴 Pump OFF'
          }}</span>
        </div>
        <div><strong>Active Valves:</strong> {{ activeValves }}</div>
      </div>
      <router-link
        to="/actuators"
        class="action-btn"
        style="display: inline-block; margin-top: 0.5rem"
      >
        <font-awesome-icon icon="water" /> Go to Control
      </router-link>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions card">
      <h3>Quick Actions</h3>
      <div class="action-buttons">
        <router-link to="/batches" class="action-btn">
          <font-awesome-icon icon="plus" /> Start Batch
        </router-link>
        <router-link to="/harvest" class="action-btn">
          <font-awesome-icon icon="tractor" /> Log Harvest
        </router-link>
        <router-link to="/care" class="action-btn">
          <font-awesome-icon icon="syringe" /> Add Care Log
        </router-link>
        <button @click="refreshAll" class="action-btn refresh-btn">
          <font-awesome-icon icon="sync" /> Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useBatchesStore } from '../stores/batches'
import { useHarvestStore } from '../stores/harvest'
import { useTasksStore } from '../stores/tasks'
import { useSensorsStore } from '../stores/sensors'
import { useWeatherStore } from '../stores/weather'
import { useAlertsStore } from '../stores/alerts'
import { useTankStore } from '../stores/tank'
import { useActuatorsStore } from '../stores/actuators'

const authStore = useAuthStore()
const batchesStore = useBatchesStore()
const harvestStore = useHarvestStore()
const tasksStore = useTasksStore()
const sensorsStore = useSensorsStore()
const weatherStore = useWeatherStore()
const alertsStore = useAlertsStore()
const tankStore = useTankStore()
const actuatorsStore = useActuatorsStore()

const loading = ref(false)

// Computed metrics
const activeBatches = computed(
  () => batchesStore.batches.filter((b) => b.stage !== 'Decommissioned').length,
)
const totalPlants = computed(() =>
  batchesStore.batches.reduce((sum, b) => sum + (b.initialCount || 0), 0),
)
const todayHarvest = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return harvestStore.harvests
    .filter((h) => h.date === today)
    .reduce((sum, h) => sum + (h.weightKg || 0), 0)
})
const pendingTasks = computed(() => tasksStore.tasks.filter((t) => t.status === 'pending').length)

// Irrigation
const activeValves = computed(
  () => actuatorsStore.actuators.filter((a) => a.type === 'valve' && a.status === 'on').length,
)

const tankLevelClass = computed(() => {
  const level = tankStore.tank?.level || 0
  if (level < 20) return 'danger'
  if (level < 40) return 'warning'
  return 'ok'
})

const tankStatus = computed(() => {
  const level = tankStore.tank?.level || 0
  if (level < 20) return 'danger'
  if (level < 40) return 'warning'
  return 'ok'
})

// Health statuses
const sensorStatus = computed(() => {
  const temp = sensorsStore.data?.temperature
  const moisture = sensorsStore.data?.soilMoisture
  if (temp > 35 || moisture < 30) return 'warning'
  if (temp > 30 || moisture < 40) return 'ok'
  return 'ok'
})

const actuatorStatus = computed(() => 'ok')
const taskStatus = computed(() => {
  const overdue = tasksStore.tasks.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done',
  ).length
  if (overdue > 2) return 'danger'
  if (overdue > 0) return 'warning'
  return 'ok'
})

// Weather
const weatherIcon = computed(() => {
  const condition = weatherStore.data?.condition?.toLowerCase() || ''
  if (condition.includes('sunny')) return '☀️'
  if (condition.includes('cloud')) return '☁️'
  if (condition.includes('rain')) return '🌧️'
  if (condition.includes('snow')) return '❄️'
  return '🌤️'
})

// Alert helpers
const alertIcon = (type) => {
  const icons = { danger: '❌', warning: '⚠️', info: 'ℹ️', success: '✅' }
  return icons[type] || 'ℹ️'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString()
}

// Refresh all data
const refreshAll = async () => {
  loading.value = true
  await Promise.all([
    batchesStore.fetch(),
    harvestStore.fetch(),
    tasksStore.fetch(),
    sensorsStore.fetch(),
    weatherStore.fetch(),
    alertsStore.fetch(),
    tankStore.fetch(),
    actuatorsStore.fetch(),
  ])
  loading.value = false
}

onMounted(async () => {
  await refreshAll()
})
</script>

<style scoped>
.dashboard {
  padding: 0 0.5rem;
}

.welcome {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

/* System Health */
.system-health {
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  background: var(--card-bg);
}

.health-indicators {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.health-item .dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--border-color);
}

.health-item.ok .dot {
  background: var(--primary);
}
.health-item.warning .dot {
  background: var(--warning);
}
.health-item.danger .dot {
  background: var(--danger);
}

.health-item.ok {
  color: var(--primary);
}
.health-item.warning {
  color: var(--warning);
}
.health-item.danger {
  color: var(--danger);
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  text-align: center;
  padding: 1.2rem;
}

.metric-card h4 {
  font-size: 0.9rem;
  opacity: 0.7;
  font-weight: 400;
  margin-bottom: 0.3rem;
}

.metric-card p {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary);
}

/* Two column layout */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.weather-section,
.alerts-section {
  padding: 1.2rem;
}

.weather-current {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.8rem;
  margin: 0.5rem 0;
}

.weather-temp {
  font-weight: 700;
  color: var(--primary);
}

.weather-condition {
  font-size: 1rem;
  opacity: 0.8;
}

.forecast {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.8rem;
}

.forecast-day {
  background: var(--bg-color);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-size: 0.9rem;
}

/* Alerts */
.no-alerts {
  padding: 1rem;
  text-align: center;
  color: var(--primary);
  font-weight: 500;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border-color);
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-icon {
  font-size: 1.2rem;
}

.alert-message {
  margin: 0;
  font-weight: 500;
}

.alert-item.danger .alert-message {
  color: var(--danger);
}
.alert-item.warning .alert-message {
  color: var(--warning);
}
.alert-item.info .alert-message {
  color: var(--info);
}

.alert-item small {
  opacity: 0.6;
  font-size: 0.75rem;
}

/* Irrigation Card */
.irrigation-card {
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  background: var(--card-bg);
}

.irrigation-grid {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 0.5rem;
}

.irrigation-grid .danger {
  color: var(--danger);
  font-weight: 700;
}
.irrigation-grid .warning {
  color: var(--warning);
  font-weight: 700;
}
.irrigation-grid .ok {
  color: var(--primary);
  font-weight: 700;
}

/* Quick Actions */
.quick-actions {
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  background: var(--card-bg);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  transition: 0.2s;
}

.action-btn:hover {
  opacity: 0.85;
  transform: translateY(-2px);
}

.refresh-btn {
  background: var(--info);
}

/* Responsive */
@media (max-width: 768px) {
  .two-col {
    grid-template-columns: 1fr;
  }
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }
  .health-indicators {
    gap: 1rem;
  }
  .action-buttons {
    flex-direction: column;
  }
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
