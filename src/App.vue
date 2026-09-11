<template>
  <div class="app-container">
    <TitleBar />
    <div class="app-body">
      <Sidebar />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <DesktopPet />
    </div>
    <ReminderToast />
  </div>
</template>

<script setup>
import TitleBar from './components/layout/TitleBar.vue'
import Sidebar from './components/layout/Sidebar.vue'
import DesktopPet from './components/pet/DesktopPet.vue'
import ReminderToast from './components/reminder/ReminderToast.vue'
import { useReminderStore } from './stores/reminderStore'
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

const reminderStore = useReminderStore()
const router = useRouter()

onMounted(() => {
  reminderStore.startChecking()

  // 监听Electron托盘导航
  if (window.electronAPI?.onNavigate) {
    window.electronAPI.onNavigate((path) => {
      router.push(path)
    })
  }
})

onUnmounted(() => {
  reminderStore.stopChecking()
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px 36px;
  background: var(--bg-primary);
}
</style>
