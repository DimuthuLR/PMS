<template>
  <div class="grid-3">
    <div class="card metric">
      <h4>Active Batches</h4>
      <p>{{ activeBatches }}</p>
    </div>
    <div class="card metric">
      <h4>Total Plants</h4>
      <p>{{ totalPlants }}</p>
    </div>
    <div class="card metric">
      <h4>Total Harvest (kg)</h4>
      <p>{{ totalHarvest }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBatchesStore } from '../../stores/batches'
import { useHarvestStore } from '../../stores/harvest'

const batchesStore = useBatchesStore()
const harvestStore = useHarvestStore()

const activeBatches = computed(
  () => batchesStore.batches.filter((b) => b.stage !== 'Decommissioned').length,
)
const totalPlants = computed(() =>
  batchesStore.batches.reduce((s, b) => s + (b.initialCount || 0), 0),
)
const totalHarvest = computed(() =>
  harvestStore.harvests.reduce((s, h) => s + (h.weightKg || 0), 0),
)
</script>

<style scoped>
.metric h4 {
  color: var(--text-color);
  opacity: 0.7;
  font-weight: 400;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}
.metric p {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary);
}
</style>
