<template>
  <header class="header">
    <div class="logo">
      <span>🌱 PMS</span>
    </div>
    <div class="header-actions">
      <ThemeToggle />
      <span class="user-badge">{{ authStore.user?.username }}</span>
      <button @click="logout" class="logout-btn"><font-awesome-icon icon="sign-out-alt" /></button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.user-badge {
  background: var(--primary);
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  color: #fff;
  font-size: 0.8rem;
}
.logout-btn {
  background: transparent;
  color: var(--text-color);
  padding: 0.4rem;
  font-size: 1.2rem;
}
.logout-btn:hover {
  color: var(--danger);
}
</style>
