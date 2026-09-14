<template>
  <ConnectionBanner />
  <div id="app">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="app-body">
      <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
      <div v-if="sidebarOpen" class="sidebar-backdrop" @click="sidebarOpen = false"></div>
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from './components/common/AppHeader.vue'
import AppSidebar from './components/common/AppSidebar.vue'
import ConnectionBanner from './components/common/ConnectionBanner.vue'

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

// ✅ Default open on desktop, closed on mobile
const sidebarOpen = ref(!window.matchMedia('(max-width: 768px)').matches)

onMounted(() => {
  authStore.restoreSession()
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
  position: relative;
}
.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: var(--bg-color);
}
.sidebar-backdrop {
  display: none;
}

@media (max-width: 768px) {
  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }
  .main-content {
    padding: 1rem;
  }
}
</style>
