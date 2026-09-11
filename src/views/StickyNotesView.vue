<template>
  <div class="sticky-notes-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">📌 便利贴</h1>
        <p class="page-subtitle">将重要任务固定在便利贴上，随时可见</p>
      </div>
    </div>

    <div class="stickies-grid" v-if="stickyStore.stickies.length > 0">
      <StickyCard
        v-for="sticky in stickyStore.stickies"
        :key="sticky.id"
        :sticky="sticky"
        @complete="handleComplete"
        @delete="handleDelete"
      />
    </div>
    <div class="empty-state" v-else>
      <div class="empty-illustration">
        <span class="empty-icon">📌</span>
      </div>
      <p class="empty-title">还没有便利贴</p>
      <p class="empty-desc">在任务列表中点击便利贴按钮，将任务固定到这里</p>
      <router-link to="/tasks" class="empty-btn">去看看任务 →</router-link>
    </div>
  </div>
</template>

<script setup>
import { useStickyStore } from '../stores/stickyStore'
import { useTaskStore } from '../stores/taskStore'
import { usePetStore } from '../stores/petStore'
import StickyCard from '../components/sticky/StickyCard.vue'

const stickyStore = useStickyStore()
const taskStore = useTaskStore()
const petStore = usePetStore()

function handleComplete(id) {
  stickyStore.completeSticky(id)
  const sticky = stickyStore.stickies.find(s => s.id === id)
  if (sticky) {
    taskStore.completeTask(sticky.taskId)
    petStore.triggerMessage('completeTask')
  }
}

function handleDelete(id) {
  stickyStore.deleteSticky(id)
}
</script>

<style scoped>
.sticky-notes-view {
  max-width: 960px;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.stickies-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  padding: 8px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 24px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  border: 1px dashed var(--border-color);
}

.empty-illustration {
  margin-bottom: 16px;
}

.empty-icon {
  font-size: 48px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  background: var(--accent);
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.25s;
  box-shadow: 0 2px 12px rgba(125, 184, 138, 0.3);
}

.empty-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}
</style>
