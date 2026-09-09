<template>
  <div id="app">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from './components/common/AppHeader.vue'
import AppSidebar from './components/common/AppSidebar.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html,
body {
  height: 100%;
  font-family: 'Segoe UI', sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
}
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-body {
  display: flex;
  flex: 1;
  min-height: 0;
}
.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: var(--bg-color);
}
</style>
