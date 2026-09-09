<template>
  <div v-if="batch">
    <h1>{{ batch.cropType }} – {{ batch.variety }}</h1>
    <div class="grid-2">
      <div class="card">
        <h3>Details</h3>
        <p><strong>Plot:</strong> {{ plotName }}</p>
        <p><strong>Stage:</strong> {{ batch.stage }}</p>
        <p><strong>Plants:</strong> {{ batch.initialCount }}</p>
        <p><strong>Expected Yield:</strong> {{ batch.expectedYield }} kg</p>
        <p><strong>Start:</strong> {{ batch.startDate }}</p>
        <button @click="updateStage">Advance Stage</button>
      </div>
      <div class="card">
        <h3>Care Logs</h3>
        <div v-for="log in careLogs" :key="log.id" class="log-item">
          {{ log.product }} – {{ log.quantity }} ({{ log.date }})
        </div>
        <router-link :to="`/care?batch=${batch.id}`">Add Care Log</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBatchesStore } from '../stores/batches'
import { useCareStore } from '../stores/care'
import { usePlotsStore } from '../stores/plots'

const route = useRoute()
const batchesStore = useBatchesStore()
const careStore = useCareStore()
const plotsStore = usePlotsStore()

const batch = ref(null)
const careLogs = ref([])

const plotName = computed(
  () => plotsStore.plots.find((p) => p.id === batch.value?.plotId)?.name || '',
)

const stages = [
  'Sowing',
  'Germination',
  'Nursery',
  'Transplanting',
  'Vegetative',
  'Flowering',
  'Fruiting',
  'Harvesting',
  'Decommissioned',
]

onMounted(async () => {
  await batchesStore.fetch()
  await careStore.fetch()
  await plotsStore.fetch()
  batch.value = batchesStore.batches.find((b) => b.id === Number(route.params.id))
  careLogs.value = careStore.getByBatch(batch.value?.id)
})

const updateStage = async () => {
  if (!batch.value) return
  const idx = stages.indexOf(batch.value.stage)
  if (idx < stages.length - 1) {
    const newStage = stages[idx + 1]
    await batchesStore.update(batch.value.id, { stage: newStage })
    batch.value.stage = newStage
  }
}
</script>
