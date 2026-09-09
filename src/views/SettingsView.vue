<template>
  <div>
    <h1>Settings</h1>
    <div class="card" style="max-width: 600px">
      <div class="form-group">
        <label>Refresh Interval (seconds)</label>
        <input v-model.number="settings.refreshInterval" type="number" min="5" max="300" />
      </div>
      <div class="form-group">
        <label>Low Soil Moisture Alert (%)</label>
        <input v-model.number="settings.lowMoisture" type="number" min="0" max="100" />
      </div>
      <div class="form-group">
        <label>High Temperature Alert (°C)</label>
        <input v-model.number="settings.highTemp" type="number" />
      </div>
      <button @click="saveSettings">Save Settings</button>
      <button class="secondary" @click="resetDefaults" style="margin-left: 0.5rem">
        Reset to Defaults
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'

const settings = reactive({
  refreshInterval: 30,
  lowMoisture: 40,
  highTemp: 35,
})

onMounted(() => {
  const saved = localStorage.getItem('appSettings')
  if (saved) Object.assign(settings, JSON.parse(saved))
})

const saveSettings = () => {
  localStorage.setItem('appSettings', JSON.stringify(settings))
  alert('Settings saved!')
}

const resetDefaults = () => {
  Object.assign(settings, { refreshInterval: 30, lowMoisture: 40, highTemp: 35 })
  saveSettings()
}
</script>
