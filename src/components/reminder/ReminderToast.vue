<template>
  <div class="reminder-container">
    <transition-group name="slide">
      <div v-for="reminder in activeReminders" :key="reminder.id" class="reminder-toast">
        <div class="reminder-icon">🔔</div>
        <div class="reminder-content">
          <h4 class="reminder-title">{{ reminder.title }}</h4>
          <p class="reminder-message">{{ reminder.message }}</p>
        </div>
        <button class="reminder-close" @click="dismissReminder(reminder.id)">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useReminderStore } from '../../stores/reminderStore'

const reminderStore = useReminderStore()
const activeReminders = computed(() => reminderStore.activeReminders)

function dismissReminder(id) {
  reminderStore.dismissReminder(id)
}
</script>

<style scoped>
.reminder-container {
  position: fixed;
  top: 56px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reminder-toast {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  box-shadow: var(--shadow-card);
  border-left: 4px solid var(--accent-yellow);
  min-width: 300px;
  max-width: 380px;
  animation: slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid var(--border-light);
}

.reminder-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.reminder-content {
  flex: 1;
}

.reminder-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.reminder-message {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.4;
}

.reminder-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 16px;
  flex-shrink: 0;
  transition: all 0.15s;
}

.reminder-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
