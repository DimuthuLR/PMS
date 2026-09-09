<template>
  <button @click="toggleTheme" class="theme-toggle">
    <font-awesome-icon :icon="theme === 'dark' ? 'sun' : 'moon'" />
  </button>
</template>

<script setup>
import { useTheme } from '../../composables/useTheme'
const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle {
  background: transparent;
  color: var(--text-color);
  font-size: 1.2rem;
  padding: 0.3rem;
}
.theme-toggle:hover {
  opacity: 0.7;
}
</style>
