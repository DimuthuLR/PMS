<template>
  <aside class="sidebar">
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

      <!-- Financial: only Admin & Manager -->
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

      <!-- Users: Admin only -->
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
import { useAuthStore } from '../../stores/auth'
const authStore = useAuthStore()
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

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 1.5rem;
  color: var(--sidebar-text); /* ✅ mint on dark — visible in both themes */
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

/* Hover — subtle overlay that works on both light and dark sidebars */
.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border-left-color: var(--primary-light, var(--primary));
}

.nav-link:hover :deep(svg) {
  opacity: 1;
}

/* Active route — bold + brand-colored left accent */
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

/* Custom thin scrollbar for the sidebar */
.sidebar::-webkit-scrollbar {
  width: 6px;
}
.sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

/* Responsive: hide on mobile (you can later add a slide-out drawer) */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
