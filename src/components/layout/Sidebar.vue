<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <div class="sidebar-date">
        <span class="date-day">{{ dateDay }}</span>
        <span class="date-week">{{ dateWeek }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">今日计划</span>
        <span v-if="taskStore.todayTotal > 0" class="nav-badge">{{ taskStore.todayTotal }}</span>
      </router-link>
      <router-link to="/input" class="nav-item" :class="{ active: $route.path === '/input' }">
        <span class="nav-icon">✨</span>
        <span class="nav-label">智能输入</span>
      </router-link>
      <router-link to="/tasks" class="nav-item" :class="{ active: $route.path === '/tasks' }">
        <span class="nav-icon">📋</span>
        <span class="nav-label">全部任务</span>
      </router-link>
      <router-link to="/stickies" class="nav-item" :class="{ active: $route.path === '/stickies' }">
        <span class="nav-icon">📌</span>
        <span class="nav-label">便利贴</span>
      </router-link>
      <router-link to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">设置</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="pet-mini" @click="petStore.triggerMessage('idle')">
        <div class="pet-mini-avatar">🧁</div>
        <span class="pet-mini-msg">{{ petStore.currentMessage }}</span>
      </div>
      <div class="progress-section">
        <div class="progress-label-row">
          <span class="progress-label">今日进度</span>
          <span class="progress-value">{{ taskStore.todayProgress }}%</span>
        </div>
        <div class="progress-bar-mini">
          <div class="progress-fill-mini" :style="{ width: taskStore.todayProgress + '%' }"></div>
        </div>
        <span class="progress-detail">{{ taskStore.todayCompleted }}/{{ taskStore.todayTotal }} 已完成</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { usePetStore } from '../../stores/petStore'

const taskStore = useTaskStore()
const petStore = usePetStore()

const dateDay = computed(() => {
  return new Date().getDate()
})

const dateWeek = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date().getDay()]
})
</script>

<style scoped>
.sidebar {
  width: 200px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  padding: 0;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar-top {
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border-light);
}

.sidebar-date {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.date-day {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.date-week {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 10px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
  position: relative;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateX(2px);
}

.nav-item.active {
  background: var(--bg-card);
  color: var(--accent);
  box-shadow: var(--shadow-soft);
  font-weight: 600;
}

.nav-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: var(--radius-full);
  background: var(--accent);
  color: white;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 14px 16px;
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pet-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-soft);
}

.pet-mini:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-card);
}

.pet-mini-avatar {
  font-size: 18px;
  flex-shrink: 0;
}

.pet-mini-msg {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.progress-value {
  font-size: 12px;
  color: var(--accent);
  font-weight: 600;
}

.progress-bar-mini {
  height: 5px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-green));
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.progress-detail {
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
}
</style>
