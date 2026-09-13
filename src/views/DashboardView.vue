<template>
  <div class="dashboard">
    <h1>🌱 Dashboard</h1>
    <p class="welcome">Welcome back, {{ authStore.user?.username }}!</p>

    <!-- System Health -->
    <div class="system-health card">
      <h3>System Health</h3>
      <div class="health-indicators">
        <div class="health-item" :class="dash.sensorStatus">
          <span class="dot"></span> Sensors: {{ dash.sensorStatus }}
        </div>
        <div class="health-item ok"><span class="dot"></span> Actuators: ok</div>
        <div class="health-item" :class="dash.taskStatus">
          <span class="dot"></span> Tasks: {{ dash.taskStatus }}
        </div>
        <div class="health-item" :class="dash.tankStatus">
          <span class="dot"></span> Water Tank: {{ dash.tankStatus }}
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <div class="metric-card card">
        <h4>Active Batches</h4>
        <p v-if="!isInitialLoading">{{ dash.activeBatches }}</p>
        <SkeletonLoader v-else variant="text" width="60%" height="2.2rem" />
      </div>
      <div class="metric-card card">
        <h4>Total Plants</h4>
        <p v-if="!isInitialLoading">{{ dash.totalPlants }}</p>
        <SkeletonLoader v-else variant="text" width="60%" height="2.2rem" />
      </div>
      <div class="metric-card card">
        <h4>Today's Harvest</h4>
        <p v-if="!isInitialLoading">{{ dash.todayHarvest }} kg</p>
        <SkeletonLoader v-else variant="text" width="60%" height="2.2rem" />
      </div>
      <div class="metric-card card">
        <h4>Pending Tasks</h4>
        <p v-if="!isInitialLoading">{{ dash.pendingTasks }}</p>
        <SkeletonLoader v-else variant="text" width="60%" height="2.2rem" />
      </div>
    </div>

    <!-- Weather & Alerts -->
    <div class="two-col">
      <!-- Weather -->
      <div class="weather-section card">
        <h3>🌤️ Weather</h3>

        <div v-if="dash.weather">
          <div class="weather-current">
            <span class="weather-icon">{{ weatherIcon }}</span>
            <span class="weather-temp">{{ dash.weather.temp }}°C</span>
            <span class="weather-condition">{{ dash.weather.condition }}</span>
          </div>
          <p>Wind: {{ dash.weather.windSpeed }} km/h | Humidity: {{ dash.weather.humidity }}%</p>
          <div class="forecast">
            <div v-for="day in dash.weather.forecast" :key="day.day" class="forecast-day">
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

        <template v-if="!isInitialLoading">
          <div v-if="dash.alerts.length === 0" class="no-alerts">✅ All clear – no alerts</div>
          <div v-for="alert in dash.alerts" :key="alert.id" class="alert-item" :class="alert.type">
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

      <div v-if="dash.tank" class="irrigation-grid">
        <div>
          <strong>Tank Level:</strong>
          <span :class="dash.tankStatus">{{ dash.tankPercentage }}%</span>
          <span>
            ({{ Math.round(dash.tank.level) }}L / {{ Math.round(dash.tank.capacity) }}L)
          </span>
          <span class="pump-indicator">
            {{ dash.tank.pumpStatus === 'on' ? '🟢 Pump ON' : '🔴 Pump OFF' }}
          </span>
        </div>
        <div><strong>Active Valves:</strong> {{ dash.activeValves }}</div>
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
        <button @click="refresh(true)" class="action-btn refresh-btn">
          <font-awesome-icon icon="sync" /> Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDashboardStore } from '../stores/dashboard'
import SkeletonLoader from '../components/common/SkeletonLoader.vue'

const authStore = useAuthStore()
const dash = useDashboardStore()

// Show skeletons only on the very first load (no cached data yet)
const isInitialLoading = computed(() => dash.loading && !dash.data)

// ---- Weather icon ----
const weatherIcon = computed(() => {
  const condition = dash.weather?.condition?.toLowerCase() || ''
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
const refresh = (force = true) => {
  dash.fetch(force)
}

onMounted(() => {
  dash.fetch(false) // use cache if fresh, otherwise fetch
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

/* ---- System Health ---- */
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
  background: var(--success);
}
.health-item.warning .dot {
  background: var(--warning);
}
.health-item.danger .dot {
  background: var(--danger);
}

.health-item.ok {
  color: var(--success);
}
.health-item.warning {
  color: var(--warning);
}
.health-item.danger {
  color: var(--danger);
}

/* ---- Metrics ---- */
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

/* ---- Two column ---- */
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
  background: var(--bg-elevated);
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-sm);
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

/* ---- Alerts ---- */
.no-alerts {
  padding: 1rem;
  text-align: center;
  color: var(--success);
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

/* ---- Irrigation ---- */
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
  color: var(--success);
  font-weight: 700;
}

.pump-indicator {
  margin-left: 0.8rem;
}

/* ---- Quick Actions ---- */
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
  border-radius: var(--radius-md);
  background: var(--primary);
  color: var(--primary-contrast);
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: 0.2s;
}

.action-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.refresh-btn {
  background: var(--info);
  color: #ffffff;
}

.refresh-btn:hover {
  background: var(--info);
  opacity: 0.9;
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
