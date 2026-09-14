<template>
  <ConnectionBanner />
  <div id="app">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from './components/common/AppHeader.vue'
import AppSidebar from './components/common/AppSidebar.vue'
import ConnectionBanner from './components/common/ConnectionBanner.vue'

import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useDashboardStore } from './stores/dashboard'
import { useSensorsStore } from './stores/sensors'
import { useTankStore } from './stores/tank'
import { useActuatorsStore } from './stores/actuators'
import { useAlertsStore } from './stores/alerts'

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const sensorsStore = useSensorsStore()
const tankStore = useTankStore()
const actuatorsStore = useActuatorsStore()
const alertsStore = useAlertsStore()

onMounted(() => {
  // Reconnect socket if user was already logged in (persisted from localStorage)
  authStore.restoreSession()

  // Bind socket event listeners — each store guards against double-binding
  dashboardStore.bindSocketEvents()
  sensorsStore.bindSocketEvents()
  tankStore.bindSocketEvents()
  actuatorsStore.bindSocketEvents()
  alertsStore.bindSocketEvents()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html,
body {
  height: 100%;
  font-family: 'Segoe UI', sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
}
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-body {
  display: flex;
  flex: 1;
  min-height: 0;
}
.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: var(--bg-color);
}
</style>
