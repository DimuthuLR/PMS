<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome back, {{ authStore.user?.username }}!</p>
    <KeyMetrics v-if="loaded" />
    <div v-else>Loading...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usePlotsStore } from '../stores/plots'
import { useBatchesStore } from '../stores/batches'
import { useCareStore } from '../stores/care'
import { useHarvestStore } from '../stores/harvest'
import KeyMetrics from '../components/dashboard/KeyMetrics.vue'

const authStore = useAuthStore()
const plotsStore = usePlotsStore()
const batchesStore = useBatchesStore()
const careStore = useCareStore()
const harvestStore = useHarvestStore()
const loaded = ref(false)

onMounted(async () => {
  await Promise.all([
    plotsStore.fetch(),
    batchesStore.fetch(),
    careStore.fetch(),
    harvestStore.fetch(),
  ])
  loaded.value = true
})
</script>
