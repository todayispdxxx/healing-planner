<template>
  <div class="title-bar">
    <div class="title-bar-drag">
      <div class="app-brand">
        <span class="brand-icon">🌸</span>
        <span class="brand-text">治愈计划</span>
      </div>
    </div>
    <div class="title-bar-controls">
      <button class="control-btn minimize" @click="minimize" title="最小化到托盘">
        <svg width="14" height="14" viewBox="0 0 14 14"><rect y="6" width="14" height="1.5" rx="0.75" fill="currentColor"/></svg>
      </button>
      <button class="control-btn maximize" @click="maximize" :title="isMaximized ? '还原' : '最大化'">
        <svg v-if="!isMaximized" width="14" height="14" viewBox="0 0 14 14"><rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>
        <svg v-else width="14" height="14" viewBox="0 0 14 14"><rect x="3.5" y="0.5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/><rect x="1.5" y="3.5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="var(--bg-secondary)"/></svg>
      </button>
      <button class="control-btn close" @click="close" title="关闭到托盘">
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isMaximized = ref(false)

function minimize() {
  if (window.electronAPI) window.electronAPI.minimizeWindow()
}
async function maximize() {
  if (window.electronAPI) {
    window.electronAPI.maximizeWindow()
    // 延迟获取状态，等窗口动画完成
    setTimeout(async () => {
      if (window.electronAPI?.isMaximized) {
        isMaximized.value = await window.electronAPI.isMaximized()
      }
    }, 200)
  }
}
function close() {
  if (window.electronAPI) window.electronAPI.closeWindow()
}

onMounted(async () => {
  if (window.electronAPI?.isMaximized) {
    isMaximized.value = await window.electronAPI.isMaximized()
  }
  // 监听窗口大小变化
  window.addEventListener('resize', async () => {
    if (window.electronAPI?.isMaximized) {
      isMaximized.value = await window.electronAPI.isMaximized()
    }
  })
})
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  -webkit-app-region: drag;
  padding-right: 4px;
}

.title-bar-drag {
  flex: 1;
  padding-left: 20px;
  display: flex;
  align-items: center;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  font-size: 16px;
  animation: gentleBounce 3s ease-in-out infinite;
}

.brand-text {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.title-bar-controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.control-btn {
  width: 44px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.2s ease;
  border-radius: 0;
}

.control-btn:hover {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.control-btn.close:hover {
  background: var(--accent-pink);
  color: white;
  border-radius: 0;
}

@keyframes gentleBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
</style>
