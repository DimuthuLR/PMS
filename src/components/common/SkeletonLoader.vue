<template>
  <div
    class="skeleton"
    :class="[`skeleton-${variant}`, { 'skeleton-pulse': animated }]"
    :style="style"
  ></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'text', // 'text' | 'card' | 'circle' | 'button'
  },
  width: {
    type: [String, Number],
    default: null,
  },
  height: {
    type: [String, Number],
    default: null,
  },
  animated: {
    type: Boolean,
    default: true,
  },
})

const style = computed(() => {
  const s = {}
  if (props.width) s.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  if (props.height) s.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  return s
})
</script>

<style scoped>
.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--border-color) 25%,
    var(--card-bg, rgba(255, 255, 255, 0.08)) 50%,
    var(--border-color) 75%
  );
  background-size: 200% 100%;
  border-radius: 6px;
}

.skeleton-text {
  height: 1em;
  width: 100%;
  margin-bottom: 0.4rem;
}

.skeleton-card {
  height: 100px;
  width: 100%;
  border-radius: 12px;
}

.skeleton-circle {
  border-radius: 50%;
  height: 40px;
  width: 40px;
}

.skeleton-button {
  height: 36px;
  width: 120px;
  border-radius: 8px;
}

.skeleton-pulse {
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
