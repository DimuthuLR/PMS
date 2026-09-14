<template>
  <header class="header">
    <div class="header-left">
      <!-- ✅ Hamburger only shows on mobile -->
      <button class="menu-btn" @click="$emit('toggle-sidebar')" aria-label="Toggle menu">
        <font-awesome-icon icon="bars" />
      </button>

      <div class="logo">
        <img src="/favicon.svg" alt="HEX HIVE" class="logo-img" />
        <span class="logo-text">HEX HIVE</span>
      </div>
    </div>

    <div class="header-actions">
      <ThemeToggle />
      <span class="user-badge">{{ authStore.user?.username }}</span>
      <button @click="logout" class="logout-btn" aria-label="Logout">
        <font-awesome-icon icon="right-from-bracket" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'

defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  background: var(--sidebar-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--sidebar-text);
  position: relative;
  z-index: 101;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* ✅ Hidden by default (desktop); only shown on mobile */
.menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--sidebar-text);
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo-img {
  width: 32px;
  height: 32px;
  display: block;
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--sidebar-text);
  letter-spacing: 0.5px;
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
  color: var(--primary-contrast);
  font-size: 0.8rem;
  font-weight: 600;
}

.logout-btn {
  background: transparent;
  color: var(--sidebar-text);
  padding: 0.4rem;
  font-size: 1.2rem;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.logout-btn:hover {
  color: var(--danger);
}

.header :deep(button),
.header :deep(.theme-toggle),
.header :deep(svg),
.header :deep(i) {
  color: var(--sidebar-text) !important;
}

.header :deep(button:hover) {
  color: var(--primary-light) !important;
}

/* ✅ Show hamburger only on mobile */
@media (max-width: 768px) {
  .header {
    padding: 0 1rem;
  }
  .menu-btn {
    display: inline-flex;
  }
  .logo-text {
    font-size: 1.2rem;
  }
}
</style>
