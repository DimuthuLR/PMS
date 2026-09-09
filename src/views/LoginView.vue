<template>
  <div class="login-container">
    <div class="login-card card">
      <h1>🌱 Plant Management</h1>
      <p class="sub">Sign in to your account</p>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="admin / manager / worker" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="admin123 / manager123 / worker123"
            required
          />
        </div>
        <button type="submit" :disabled="loading">Sign In</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username.value, password.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
.login-card {
  max-width: 420px;
  width: 100%;
  padding: 2.5rem;
}
.sub {
  margin-bottom: 1.5rem;
  color: var(--text-color);
  opacity: 0.7;
}
.error {
  color: var(--danger);
  margin-top: 0.8rem;
}
</style>
