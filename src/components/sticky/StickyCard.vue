<template>
  <div class="sticky-card" :class="[`sticky-${sticky.category}`, { completed: sticky.completed }]">
    <div class="sticky-header">
      <span class="sticky-priority" :class="`pri-${sticky.priority}`">{{ sticky.priority }}</span>
      <div class="sticky-actions">
        <button class="sticky-btn" @click="$emit('complete', sticky.id)" title="完成">✓</button>
        <button class="sticky-btn delete" @click="$emit('delete', sticky.id)" title="删除">×</button>
      </div>
    </div>
    <h4 class="sticky-title" :class="{ 'line-through': sticky.completed }">{{ sticky.title }}</h4>
    <div v-if="sticky.deadline" class="sticky-deadline">
      📅 {{ formatDate(sticky.deadline) }}
    </div>
    <div class="sticky-category">{{ sticky.category }}</div>
  </div>
</template>

<script setup>
defineProps({
  sticky: { type: Object, required: true }
})

defineEmits(['complete', 'delete'])

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.sticky-card {
  width: 210px;
  min-height: 150px;
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow-card);
  transition: all 0.25s ease;
  background: var(--color-other);
  border: 1px solid transparent;
}

.sticky-card:hover {
  transform: translateY(-3px) rotate(0.5deg);
  box-shadow: var(--shadow-elevated);
}

.sticky-card.completed {
  opacity: 0.5;
}

.sticky-学习 { background: var(--color-study); border-color: rgba(76, 175, 80, 0.15); }
.sticky-工作 { background: var(--color-work); border-color: rgba(21, 101, 192, 0.1); }
.sticky-会议 { background: var(--color-meeting); border-color: rgba(123, 31, 162, 0.1); }
.sticky-生活 { background: var(--color-life); border-color: rgba(230, 81, 0, 0.1); }
.sticky-购物 { background: var(--color-shopping); border-color: rgba(194, 24, 91, 0.1); }
.sticky-长期计划 { background: var(--color-longterm); border-color: rgba(0, 131, 143, 0.1); }

.sticky-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sticky-priority {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.6);
  color: #795548;
  font-weight: 500;
}

.sticky-priority.pri-高 { background: rgba(229,115,115,0.3); color: var(--priority-high-text); }
.sticky-priority.pri-低 { background: rgba(129,199,132,0.3); color: var(--priority-low-text); }

.sticky-actions {
  display: flex;
  gap: 4px;
}

.sticky-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: rgba(255,255,255,0.5);
  transition: all 0.15s;
}

.sticky-btn:hover {
  background: rgba(255,255,255,0.8);
  transform: scale(1.1);
}

.sticky-btn.delete:hover {
  background: var(--priority-high-bg);
}

.sticky-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.sticky-title.line-through {
  text-decoration: line-through;
  color: var(--text-muted);
}

.sticky-deadline {
  font-size: 12px;
  color: var(--text-secondary);
}

.sticky-category {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: auto;
  font-weight: 500;
}
</style>
