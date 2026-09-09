<template>
  <div class="sensors-container" v-if="sensorsStore.data">
    <h1>Environmental Sensors</h1>

    <div class="sensor-grid">
      <div class="card sensor-card">
        <h4>🌡️ Temperature</h4>
        <p class="value">{{ sensorsStore.data.temperature ?? '--' }} °C</p>
        <p class="updated">Updated: {{ formatDate(sensorsStore.data.lastUpdated) }}</p>
      </div>
      <div class="card sensor-card">
        <h4>💧 Humidity</h4>
        <p class="value">{{ sensorsStore.data.humidity ?? '--' }} %</p>
      </div>
      <div class="card sensor-card">
        <h4>🌱 Soil Moisture</h4>
        <p class="value">{{ sensorsStore.data.soilMoisture ?? '--' }} %</p>
      </div>
    </div>

    <div class="card weather-card">
      <h3>Weather</h3>
      <div v-if="weatherStore.data">
        <p class="weather-main">
          <strong>{{ weatherStore.data.condition }}</strong> – {{ weatherStore.data.temp }}°C
        </p>
        <p>
          Wind: {{ weatherStore.data.windSpeed }} km/h | Humidity: {{ weatherStore.data.humidity }}%
        </p>
        <div class="forecast">
          <div v-for="day in weatherStore.data.forecast" :key="day.day" class="forecast-item">
            <strong>{{ day.day }}</strong> {{ day.condition }} {{ day.temp }}°C
          </div>
        </div>
      </div>
      <div v-else>Loading weather...</div>
      <button @click="refreshSensors" :disabled="loading">Refresh</button>
    </div>
  </div>
  <div v-else class="loading">Loading sensors...</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useSensorsStore } from '../stores/sensors'
import { useWeatherStore } from '../stores/weather'

const sensorsStore = useSensorsStore()
const weatherStore = useWeatherStore()
const loading = ref(false)

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleString()
  } catch {
    return 'N/A'
  }
}

const refreshSensors = async () => {
  loading.value = true
  const newTemp = (20 + Math.random() * 10).toFixed(1)
  const newHumidity = Math.round(50 + Math.random() * 30)
  const newMoisture = Math.round(40 + Math.random() * 40)
  await sensorsStore.update({
    temperature: parseFloat(newTemp),
    humidity: newHumidity,
    soilMoisture: newMoisture,
  })
  await sensorsStore.fetch()
  loading.value = false
}

onMounted(async () => {
  await Promise.all([sensorsStore.fetch(), weatherStore.fetch()])
})
</script>

<style scoped>
.sensors-container {
  padding: 0 0.5rem;
}
.loading {
  padding: 2rem;
  text-align: center;
}
.sensor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.sensor-card {
  text-align: center;
  padding: 1.5rem;
}
.sensor-card h4 {
  font-size: 1rem;
  opacity: 0.7;
  margin-bottom: 0.5rem;
}
.value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
}
.updated {
  font-size: 0.7rem;
  opacity: 0.5;
  margin-top: 0.5rem;
}
.weather-card {
  padding: 1.5rem;
}
.weather-main {
  font-size: 1.2rem;
  margin: 0.5rem 0;
}
.forecast {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}
.forecast-item {
  background: var(--bg-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
}
</style>
