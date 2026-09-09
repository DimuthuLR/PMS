// src/api/mockService.js
// Temporary mock service for modules not yet implemented in backend

const generateId = () => Date.now() + Math.random() * 1000

// Mock data
const sensorsData = {
  temperature: 24.5,
  humidity: 65,
  soilMoisture: 72,
  lastUpdated: new Date().toISOString(),
}

const weatherData = {
  condition: 'Sunny',
  temp: 26,
  windSpeed: 12,
  humidity: 60,
  icon: 'sun',
  forecast: [
    { day: 'Mon', temp: 25, condition: 'Sunny' },
    { day: 'Tue', temp: 22, condition: 'Cloudy' },
  ],
}

const tankData = {
  level: 65,
  capacity: 1000,
  pumpStatus: 'off',
  autoMode: true,
  lowLevelThreshold: 20,
  fillLevelThreshold: 80,
}

const actuators = [
  {
    id: 1,
    name: 'Valve Zone A',
    type: 'valve',
    zone: 'North Greenhouse',
    status: 'off',
    mode: 'manual',
    autoThreshold: 40,
  },
  {
    id: 2,
    name: 'Valve Zone B',
    type: 'valve',
    zone: 'South Field',
    status: 'off',
    mode: 'auto',
    autoThreshold: 35,
  },
  { id: 3, name: 'Main Pump', type: 'pump', zone: 'Water Tank', status: 'off', mode: 'auto' },
]

const alerts = [
  // will be generated dynamically
]

export const mockApi = {
  // Sensors
  getSensors: () => Promise.resolve({ ...sensorsData }),
  updateSensors: (payload) => {
    Object.assign(sensorsData, payload, { lastUpdated: new Date().toISOString() })
    return Promise.resolve({ ...sensorsData })
  },

  // Weather
  getWeather: () => Promise.resolve({ ...weatherData }),
  updateWeather: (payload) => {
    Object.assign(weatherData, payload)
    return Promise.resolve({ ...weatherData })
  },

  // Tank
  getTank: () => Promise.resolve({ ...tankData }),
  updateTank: (payload) => {
    Object.assign(tankData, payload)
    return Promise.resolve({ ...tankData })
  },

  // Actuators
  getActuators: () => Promise.resolve([...actuators]),
  updateActuator: (id, payload) => {
    const idx = actuators.findIndex((a) => a.id === id)
    if (idx === -1) return Promise.reject('Not found')
    actuators[idx] = { ...actuators[idx], ...payload }
    return Promise.resolve(actuators[idx])
  },
  toggleActuator: (id) => {
    const act = actuators.find((a) => a.id === id)
    if (!act) return Promise.reject('Not found')
    act.status = act.status === 'on' ? 'off' : 'on'
    return Promise.resolve(act)
  },
  runAutoLogic: () => {
    // Simple mock: turn on valves if soil moisture low
    const moisture = sensorsData.soilMoisture || 0
    actuators.forEach((a) => {
      if (a.type === 'valve' && a.mode === 'auto') {
        a.status = moisture < (a.autoThreshold || 40) ? 'on' : 'off'
      }
    })
    // Pump auto logic
    if (tankData.autoMode) {
      if (tankData.level <= tankData.lowLevelThreshold) {
        tankData.pumpStatus = 'on'
      } else if (tankData.level >= tankData.fillLevelThreshold) {
        tankData.pumpStatus = 'off'
      }
    }
    return Promise.resolve({ actuators: [...actuators], tank: { ...tankData } })
  },

  // Alerts
  getAlerts: () => {
    const alertsList = []
    if (sensorsData.temperature > 35) {
      alertsList.push({
        id: 'alert-temp',
        type: 'danger',
        message: `High temperature: ${sensorsData.temperature}°C`,
        timestamp: new Date().toISOString(),
      })
    }
    if (sensorsData.soilMoisture < 30) {
      alertsList.push({
        id: 'alert-moisture',
        type: 'warning',
        message: `Low soil moisture: ${sensorsData.soilMoisture}%`,
        timestamp: new Date().toISOString(),
      })
    }
    if (tankData.level < tankData.lowLevelThreshold) {
      alertsList.push({
        id: 'alert-tank',
        type: 'danger',
        message: `Tank level low: ${tankData.level}%`,
        timestamp: new Date().toISOString(),
      })
    }
    return Promise.resolve(alertsList.slice(0, 5))
  },
}
