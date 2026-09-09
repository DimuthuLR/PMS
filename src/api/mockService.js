// src/api/mockService.js
// Pure JavaScript – no HTML!

// Helper to generate unique IDs
const generateId = () => Date.now() + Math.random() * 1000

// In-memory data store
let data = {
  plots: [
    { id: 1, name: 'North Greenhouse', gridRef: 'A1', dimensions: '10x20m', soilType: 'Loam' },
    { id: 2, name: 'South Field', gridRef: 'B3', dimensions: '30x50m', soilType: 'Sandy' },
  ],
  batches: [
    {
      id: 1,
      plotId: 1,
      cropType: 'Tomato',
      variety: 'Roma',
      startDate: '2026-01-10',
      initialCount: 200,
      expectedYield: 500,
      stage: 'Vegetative',
      notes: '',
    },
    {
      id: 2,
      plotId: 2,
      cropType: 'Chili',
      variety: 'Habanero',
      startDate: '2026-02-01',
      initialCount: 150,
      expectedYield: 300,
      stage: 'Flowering',
      notes: '',
    },
  ],
  careLogs: [
    {
      id: 1,
      batchId: 1,
      type: 'organic',
      product: 'Compost Tea',
      quantity: '20L',
      method: 'Drench',
      cost: 15,
      date: '2026-01-20',
      nextDue: '2026-02-10',
    },
  ],
  harvests: [{ id: 1, batchId: 1, date: '2026-03-01', weightKg: 45, grade: 'A', revenue: 90 }],
  financials: [
    {
      id: 1,
      batchId: 1,
      category: 'Seeds',
      costAmount: 50,
      date: '2026-01-05',
      description: 'Tomato seeds',
    },
    {
      id: 2,
      batchId: 1,
      category: 'Fertilizer',
      costAmount: 30,
      date: '2026-01-15',
      description: 'Compost',
    },
  ],
  pests: [
    {
      id: 1,
      batchId: 1,
      symptom: 'Yellow spots on leaves',
      severity: 3,
      date: '2026-02-01',
      imageUrl: '',
      resolved: false,
    },
  ],
  tasks: [
    {
      id: 1,
      batchId: 1,
      title: 'Prune tomato plants',
      assignedTo: 'John',
      deadline: '2026-03-05',
      status: 'pending',
      hoursLogged: 0,
      laborCost: 0,
    },
  ],
  sensors: {
    temperature: 24.5,
    humidity: 65,
    soilMoisture: 72,
    lastUpdated: new Date().toISOString(),
  },
  weather: {
    condition: 'Sunny',
    temp: 26,
    windSpeed: 12,
    humidity: 60,
    icon: 'sun',
    forecast: [
      { day: 'Mon', temp: 25, condition: 'Sunny' },
      { day: 'Tue', temp: 22, condition: 'Cloudy' },
    ],
  },
}

// ---- Generic helpers ----
const getCollection = (entity) => data[entity] || []
const setCollection = (entity, arr) => {
  data[entity] = arr
}

export const mockApi = {
  // ---- PLOTS ----
  getPlots: () => Promise.resolve([...data.plots]),
  getPlot: (id) => Promise.resolve(data.plots.find((p) => p.id === id)),
  createPlot: (payload) => {
    const item = { id: generateId(), ...payload }
    data.plots.push(item)
    return Promise.resolve(item)
  },
  updatePlot: (id, payload) => {
    const idx = data.plots.findIndex((p) => p.id === id)
    if (idx === -1) return Promise.reject('Not found')
    data.plots[idx] = { ...data.plots[idx], ...payload }
    return Promise.resolve(data.plots[idx])
  },
  deletePlot: (id) => {
    data.plots = data.plots.filter((p) => p.id !== id)
    return Promise.resolve()
  },

  // ---- BATCHES ----
  getBatches: () => Promise.resolve([...data.batches]),
  getBatch: (id) => Promise.resolve(data.batches.find((b) => b.id === id)),
  createBatch: (payload) => {
    const item = { id: generateId(), stage: 'Sowing', ...payload }
    data.batches.push(item)
    return Promise.resolve(item)
  },
  updateBatch: (id, payload) => {
    const idx = data.batches.findIndex((b) => b.id === id)
    if (idx === -1) return Promise.reject('Not found')
    data.batches[idx] = { ...data.batches[idx], ...payload }
    return Promise.resolve(data.batches[idx])
  },
  deleteBatch: (id) => {
    data.batches = data.batches.filter((b) => b.id !== id)
    return Promise.resolve()
  },

  // ---- CARE LOGS ----
  getCareLogs: () => Promise.resolve([...data.careLogs]),
  getCareLogsByBatch: (batchId) =>
    Promise.resolve(data.careLogs.filter((c) => c.batchId === batchId)),
  createCareLog: (payload) => {
    const item = { id: generateId(), ...payload }
    data.careLogs.push(item)
    return Promise.resolve(item)
  },
  updateCareLog: (id, payload) => {
    const idx = data.careLogs.findIndex((c) => c.id === id)
    if (idx === -1) return Promise.reject('Not found')
    data.careLogs[idx] = { ...data.careLogs[idx], ...payload }
    return Promise.resolve(data.careLogs[idx])
  },
  deleteCareLog: (id) => {
    data.careLogs = data.careLogs.filter((c) => c.id !== id)
    return Promise.resolve()
  },

  // ---- HARVESTS ----
  getHarvests: () => Promise.resolve([...data.harvests]),
  getHarvestsByBatch: (batchId) =>
    Promise.resolve(data.harvests.filter((h) => h.batchId === batchId)),
  createHarvest: (payload) => {
    const item = { id: generateId(), ...payload }
    data.harvests.push(item)
    return Promise.resolve(item)
  },
  updateHarvest: (id, payload) => {
    const idx = data.harvests.findIndex((h) => h.id === id)
    if (idx === -1) return Promise.reject('Not found')
    data.harvests[idx] = { ...data.harvests[idx], ...payload }
    return Promise.resolve(data.harvests[idx])
  },
  deleteHarvest: (id) => {
    data.harvests = data.harvests.filter((h) => h.id !== id)
    return Promise.resolve()
  },

  // ---- FINANCIAL ----
  getFinancials: () => Promise.resolve([...data.financials]),
  getFinancialsByBatch: (batchId) =>
    Promise.resolve(data.financials.filter((f) => f.batchId === batchId)),
  createFinancial: (payload) => {
    const item = { id: generateId(), ...payload }
    data.financials.push(item)
    return Promise.resolve(item)
  },
  updateFinancial: (id, payload) => {
    const idx = data.financials.findIndex((f) => f.id === id)
    if (idx === -1) return Promise.reject('Not found')
    data.financials[idx] = { ...data.financials[idx], ...payload }
    return Promise.resolve(data.financials[idx])
  },
  deleteFinancial: (id) => {
    data.financials = data.financials.filter((f) => f.id !== id)
    return Promise.resolve()
  },

  // ---- PEST ----
  getPests: () => Promise.resolve([...data.pests]),
  getPestsByBatch: (batchId) => Promise.resolve(data.pests.filter((p) => p.batchId === batchId)),
  createPest: (payload) => {
    const item = { id: generateId(), resolved: false, ...payload }
    data.pests.push(item)
    return Promise.resolve(item)
  },
  updatePest: (id, payload) => {
    const idx = data.pests.findIndex((p) => p.id === id)
    if (idx === -1) return Promise.reject('Not found')
    data.pests[idx] = { ...data.pests[idx], ...payload }
    return Promise.resolve(data.pests[idx])
  },
  deletePest: (id) => {
    data.pests = data.pests.filter((p) => p.id !== id)
    return Promise.resolve()
  },

  // ---- TASKS ----
  getTasks: () => Promise.resolve([...data.tasks]),
  getTasksByBatch: (batchId) => Promise.resolve(data.tasks.filter((t) => t.batchId === batchId)),
  createTask: (payload) => {
    const item = { id: generateId(), status: 'pending', hoursLogged: 0, laborCost: 0, ...payload }
    data.tasks.push(item)
    return Promise.resolve(item)
  },
  updateTask: (id, payload) => {
    const idx = data.tasks.findIndex((t) => t.id === id)
    if (idx === -1) return Promise.reject('Not found')
    data.tasks[idx] = { ...data.tasks[idx], ...payload }
    return Promise.resolve(data.tasks[idx])
  },
  deleteTask: (id) => {
    data.tasks = data.tasks.filter((t) => t.id !== id)
    return Promise.resolve()
  },

  // ---- SENSORS ----
  getSensors: () => Promise.resolve({ ...data.sensors }),
  updateSensors: (payload) => {
    data.sensors = { ...data.sensors, ...payload, lastUpdated: new Date().toISOString() }
    return Promise.resolve(data.sensors)
  },

  // ---- WEATHER ----
  getWeather: () => Promise.resolve({ ...data.weather }),
  updateWeather: (payload) => {
    data.weather = { ...data.weather, ...payload }
    return Promise.resolve(data.weather)
  },
}
