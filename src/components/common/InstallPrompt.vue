<template>
  <transition name="slide-up">
    <div v-if="showPrompt" class="install-prompt">
      <div class="prompt-content">
        <span class="prompt-icon">📱</span>
        <div class="prompt-text">
          <strong>Install PMS</strong>
          <p>Add to your home screen for quick access and offline use.</p>
        </div>
      </div>
      <div class="prompt-actions">
        <button @click="dismiss" class="btn-secondary">Not now</button>
        <button @click="install" class="btn-primary">Install</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showPrompt = ref(false)
let deferredPrompt = null

function handleBeforeInstall(e) {
  // Chrome fires this when the app is installable
  e.preventDefault()
  deferredPrompt = e
  // Only show if user hasn't dismissed before
  if (!localStorage.getItem('pms-install-dismissed')) {
    showPrompt.value = true
  }
}

async function install() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') {
    localStorage.setItem('pms-install-dismissed', '1')
  }
  deferredPrompt = null
  showPrompt.value = false
}

function dismiss() {
  localStorage.setItem('pms-install-dismissed', '1')
  showPrompt.value = false
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstall)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
})
</script>

<style scoped>
.install-prompt {
  position: fixed;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  max-width: 90vw;
  z-index: 9998;
}

.prompt-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.prompt-icon {
  font-size: 1.8rem;
}

.prompt-text strong {
  display: block;
  color: var(--text-color);
}

.prompt-text p {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.prompt-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-primary {
  background: var(--primary);
  color: var(--primary-contrast);
}

.btn-secondary {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}

@media (max-width: 600px) {
  .install-prompt {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}
</style>
