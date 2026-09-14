<template>
  <div class="offline-view">
    <div class="offline-card">
      <div class="offline-icon">📡</div>
      <h1>You're offline</h1>
      <p>Don't worry — your data is still here. We'll sync once you're back online.</p>
      <button @click="retry" class="retry-btn">Try Again</button>
    </div>
  </div>
</template>

<script setup>
function retry() {
  window.location.reload()
}
</script>

<style scoped>
.offline-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.offline-card {
  text-align: center;
  padding: 2.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  max-width: 400px;
  box-shadow: var(--shadow-md);
}

.offline-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.offline-card h1 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.offline-card p {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.retry-btn {
  padding: 0.7rem 1.5rem;
  background: var(--primary);
  color: var(--primary-contrast);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}
</style>
