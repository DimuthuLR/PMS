<template>
  <aside class="sidebar" :class="{ open }">
    <button class="close-btn" @click="$emit('close')" aria-label="Close menu">
      <font-awesome-icon icon="times" />
    </button>

    <nav>
      <router-link to="/dashboard" class="nav-link">
        <font-awesome-icon icon="home" /> <span>Dashboard</span>
      </router-link>
      <router-link to="/plots" class="nav-link">
        <font-awesome-icon icon="map" /> <span>Plots</span>
      </router-link>
      <router-link to="/batches" class="nav-link">
        <font-awesome-icon icon="seedling" /> <span>Batches</span>
      </router-link>
      <router-link to="/care" class="nav-link">
        <font-awesome-icon icon="syringe" /> <span>Care Logs</span>
      </router-link>
      <router-link to="/harvest" class="nav-link">
        <font-awesome-icon icon="tractor" /> <span>Harvest</span>
      </router-link>
      <router-link
        v-if="authStore.role === 'admin' || authStore.role === 'manager'"
        to="/financial"
        class="nav-link"
      >
        <font-awesome-icon icon="coins" /> <span>Financial</span>
      </router-link>
      <router-link to="/pest" class="nav-link">
        <font-awesome-icon icon="bug" /> <span>Pest</span>
      </router-link>
      <router-link to="/tasks" class="nav-link">
        <font-awesome-icon icon="tasks" /> <span>Tasks</span>
      </router-link>
      <router-link to="/sensors" class="nav-link">
        <font-awesome-icon icon="thermometer-half" /> <span>Sensors</span>
      </router-link>
      <router-link to="/actuators" class="nav-link">
        <font-awesome-icon icon="water" /> <span>Irrigation</span>
      </router-link>
      <router-link v-if="authStore.role === 'admin'" to="/users" class="nav-link">
        <font-awesome-icon icon="users" /> <span>Users</span>
      </router-link>
      <router-link to="/settings" class="nav-link">
        <font-awesome-icon icon="cog" /> <span>Settings</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

defineProps({ open: Boolean })
const emit = defineEmits(['close'])

const authStore = useAuthStore()
const route = useRoute()

watch(
  () => route.path,
  () => emit('close'),
)
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-width: 220px;
  flex-shrink: 0;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  border-right: 1px solid var(--border-color);
  padding: 1rem 0;
  overflow-y: auto;
}

/* Desktop: hide when closed */
@media (min-width: 769px) {
  .sidebar:not(.open) {
    display: none;
  }
}

.close-btn {
  display: none;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 1.5rem;
  color: var(--sidebar-text);
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;
  border-left: 3px solid transparent;
  font-size: 0.95rem;
}

.nav-link :deep(svg) {
  width: 16px;
  opacity: 0.85;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border-left-color: var(--primary-light, var(--primary));
}

.nav-link.router-link-active {
  background: var(--sidebar-active-bg);
  color: var(--primary-light, var(--primary));
  border-left-color: var(--primary);
  font-weight: 600;
}

.nav-link.router-link-active :deep(svg) {
  opacity: 1;
  color: var(--primary-light, var(--primary));
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}
.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

/* Mobile: overlay drawer */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: var(--shadow-lg);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .close-btn {
    display: block;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: none;
    color: var(--sidebar-text);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.4rem;
  }
}
</style>
