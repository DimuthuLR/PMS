<template>
  <transition name="slide-down">
    <div v-if="showBanner" class="connection-banner" :class="statusClass">
      <span class="icon">{{ statusIcon }}</span>
      <span class="message">{{ statusMessage }}</span>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSocket } from '../../api/socket'

const connected = ref(true)

let socket = null

const showBanner = computed(() => !connected.value)

const statusClass = computed(() => (connected.value ? 'ok' : 'warning'))

const statusIcon = computed(() => (connected.value ? '🟢' : '⚠️'))

const statusMessage = computed(() => (connected.value ? 'Connected' : 'Reconnecting to server…'))

function bindSocket() {
  socket = getSocket()
  connected.value = socket.connected

  socket.on('connect', () => {
    connected.value = true
  })
  socket.on('disconnect', () => {
    connected.value = false
  })
}

onMounted(() => {
  bindSocket()
})
</script>

<style scoped>
.connection-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 0.5rem 1rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.connection-banner.warning {
  background: var(--warning);
  color: #1a1a1a;
}

.connection-banner.ok {
  background: var(--success);
  color: #ffffff;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
