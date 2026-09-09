<template>
  <aside class="sidebar">
    <nav>
      <router-link to="/dashboard" class="nav-link"
        ><font-awesome-icon icon="home" /> Dashboard</router-link
      >
      <router-link to="/plots" class="nav-link"><font-awesome-icon icon="map" /> Plots</router-link>
      <router-link to="/batches" class="nav-link"
        ><font-awesome-icon icon="seedling" /> Batches</router-link
      >
      <router-link to="/care" class="nav-link"
        ><font-awesome-icon icon="syringe" /> Care Logs</router-link
      >
      <router-link to="/harvest" class="nav-link"
        ><font-awesome-icon icon="tractor" /> Harvest</router-link
      >
      <router-link to="/financial" class="nav-link"
        ><font-awesome-icon icon="coins" /> Financial</router-link
      >
      <router-link to="/pest" class="nav-link"><font-awesome-icon icon="bug" /> Pest</router-link>
      <router-link to="/tasks" class="nav-link"
        ><font-awesome-icon icon="tasks" /> Tasks</router-link
      >
      <router-link to="/sensors" class="nav-link"
        ><font-awesome-icon icon="thermometer-half" /> Sensors</router-link
      >
      <router-link to="/settings" class="nav-link"
        ><font-awesome-icon icon="cog" /> Settings</router-link
      >
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  min-width: 220px;
  flex-shrink: 0;
  background: var(--sidebar-bg, var(--card-bg));
  border-right: 1px solid var(--border-color);
  padding: 1rem 0;
  overflow-y: auto;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 1.5rem;
  color: var(--text-color);
  text-decoration: none;
  transition: 0.2s;
  border-left: 3px solid transparent;
}
.nav-link:hover {
  background: var(--bg-color);
}
.nav-link.router-link-active {
  border-left-color: var(--primary);
  background: var(--bg-color);
  color: var(--primary);
  font-weight: 600;
}
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
