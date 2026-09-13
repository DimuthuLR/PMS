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
        <p v-if="!isLoading('batches')">{{ activeBatches }}</p>
        <SkeletonLoader v-else variant="text" width="60%" height="2.2rem" />
      </div>
      <div class="metric-card card">
        <h4>Total Plants</h4>
        <p v-if="!isLoading('batches')">{{ totalPlants }}</p>
        <SkeletonLoader v-else variant="text" width="60%" height="2.2rem" />
      </div>
      <div class="metric-card card">
        <h4>Today's Harvest</h4>
        <p v-if="!isLoading('harvest')">{{ todayHarvest }} kg</p>
        <SkeletonLoader v-else variant="text" width="60%" height="2.2rem" />
      </div>
      <div class="metric-card card">
        <h4>Pending Tasks</h4>
        <p v-if="!isLoading('tasks')">{{ pendingTasks }}</p>
        <SkeletonLoader v-else variant="text" width="60%" height="2.2rem" />
      </div>
    </div>

    <!-- Weather & Alerts - Two Column -->
    <div class="two-col">
      <!-- Weather -->
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
              <strong>Day {{ day.day }}</strong>
              <div>{{ day.condition }}</div>
              <div class="forecast-temps">
                {{ Math.round(day.high) }}° / {{ Math.round(day.low) }}°
              </div>
              <small v-if="day.rainChance !== undefined" class="rain-chance">
                💧 {{ day.rainChance }}%
              </small>
            </div>
          </div>
        </div>

        <!-- Skeleton -->
        <div v-else class="weather-skeleton">
          <div class="weather-current-skeleton">
            <SkeletonLoader variant="circle" width="36" height="36" />
            <SkeletonLoader variant="text" width="100px" height="1.8rem" />
          </div>
          <SkeletonLoader variant="text" width="70%" />
          <div class="forecast">
            <SkeletonLoader v-for="n in 5" :key="n" variant="card" width="90px" height="80px" />
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div class="alerts-section card">
        <h3>🔔 Alerts</h3>

        <template v-if="!alertsStore.loading || alertsStore.alerts.length">
          <div v-if="alertsStore.alerts.length === 0" class="no-alerts">
            ✅ All clear – no alerts
          </div>
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
        </template>

        <!-- Skeleton -->
        <div v-else>
          <div v-for="n in 3" :key="n" class="alert-item-skeleton">
            <SkeletonLoader variant="circle" width="20" height="20" />
            <div style="flex: 1">
              <SkeletonLoader variant="text" width="90%" />
              <SkeletonLoader variant="text" width="40%" height="0.7rem" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Irrigation Status -->
    <div class="irrigation-card card">
      <h3>💧 Irrigation Status</h3>

      <div v-if="tankStore.tank" class="irrigation-grid">
        <div>
          <strong>Tank Level:</strong>
          <span :class="tankLevelClass">{{ tankPercentage }}%</span>
          <span>
            ({{ Math.round(tankStore.tank.level) }}L / {{ Math.round(tankStore.tank.capacity) }}L)
          </span>
          <span class="pump-indicator">
            {{ tankStore.tank.pumpStatus === 'on' ? '🟢 Pump ON' : '🔴 Pump OFF' }}
          </span>
        </div>
        <div><strong>Active Valves:</strong> {{ activeValves }}</div>
      </div>

      <!-- Skeleton -->
      <div v-else class="irrigation-grid">
        <SkeletonLoader variant="text" width="60%" height="1.2rem" />
        <SkeletonLoader variant="text" width="40%" height="1.2rem" />
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
        <button @click="refreshAll(true)" class="action-btn refresh-btn">
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
import SkeletonLoader from '../components/common/SkeletonLoader.vue'

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

// ✅ Helper: returns true if a store has no data AND is currently loading
const isLoading = (storeName) => {
  const map = {
    batches: () => batchesStore.loading && batchesStore.batches.length === 0,
    harvest: () => harvestStore.loading && harvestStore.harvests.length === 0,
    tasks: () => tasksStore.loading && tasksStore.tasks.length === 0,
  }
  return map[storeName]?.() ?? false
}

// ---- Computed metrics ----
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

// ---- Irrigation ----
const activeValves = computed(
  () => actuatorsStore.actuators.filter((a) => a.type === 'valve' && a.status === 'on').length,
)

const tankPercentage = computed(() => {
  const tank = tankStore.tank
  if (!tank || !tank.capacity) return 0
  return Math.round((tank.level / tank.capacity) * 100)
})

const tankLevelClass = computed(() => {
  const pct = tankPercentage.value
  if (pct < 20) return 'danger'
  if (pct < 40) return 'warning'
  return 'ok'
})

const tankStatus = computed(() => {
  const pct = tankPercentage.value
  if (pct < 20) return 'danger'
  if (pct < 40) return 'warning'
  return 'ok'
})

// ---- Health statuses ----
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

// ---- Weather icon ----
const weatherIcon = computed(() => {
  const condition = weatherStore.data?.condition?.toLowerCase() || ''
  if (condition.includes('sunny')) return '☀️'
  if (condition.includes('cloud')) return '☁️'
  if (condition.includes('rain')) return '🌧️'
  if (condition.includes('snow')) return '❄️'
  return '🌤️'
})

// ---- Alert helpers ----
const alertIcon = (type) => {
  const icons = { danger: '❌', warning: '⚠️', info: 'ℹ️', success: '✅' }
  return icons[type] || 'ℹ️'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

// ---- Refresh ----
const refreshAll = async (force = true) => {
  loading.value = true
  await Promise.allSettled([
    batchesStore.fetch(force),
    harvestStore.fetch(force),
    tasksStore.fetch(force),
    sensorsStore.fetch(force),
    weatherStore.fetch(force),
    alertsStore.fetch(force),
    tankStore.fetch(force),
    actuatorsStore.fetch(force),
  ])
  loading.value = false
}

onMounted(async () => {
  await refreshAll(false)
})
</script>

<style scoped>
/* ... (all existing styles from previous version stay the same) ... */
/* Only ADD the two new skeleton layout styles below: */

.weather-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.weather-current-skeleton {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0.8rem 0;
}

.alert-item-skeleton {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border-color);
}

.alert-item-skeleton:last-child {
  border-bottom: none;
}

/* ===== Keep all existing styles from the previous DashboardView ===== */
.dashboard {
  padding: 0 0.5rem;
}
.welcome {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}
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
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-top: 0.8rem;
}
.forecast-day {
  background: var(--bg-color);
  padding: 0.6rem 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-size: 0.85rem;
  text-align: center;
  min-width: 90px;
}
.forecast-temps {
  font-weight: 600;
  color: var(--primary);
  margin-top: 0.2rem;
}
.rain-chance {
  display: block;
  opacity: 0.7;
  margin-top: 0.2rem;
  font-size: 0.75rem;
}
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
.pump-indicator {
  margin-left: 0.8rem;
}
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
