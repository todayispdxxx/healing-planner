<template>
  <div class="task-card" :class="[`priority-${task.priority}`, { completed: task.status === '已完成' }]" @click="$emit('click', task)">
    <div class="task-header">
      <button class="check-btn" :class="{ checked: task.status === '已完成' }" @click.stop="$emit('complete', task.id)">
        <svg v-if="task.status === '已完成'" width="14" height="14" viewBox="0 0 14 14">
          <path d="M2 7L5.5 10.5L12 3.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="task-info">
        <h4 class="task-title" :class="{ 'line-through': task.status === '已完成' }">{{ task.title }}</h4>
        <div class="task-meta">
          <span class="category-tag" :class="`cat-${task.category}`">{{ task.category }}</span>
          <span class="priority-tag" :class="`pri-${task.priority}`">{{ task.priority }}优先</span>
          <span v-if="task.deadline" class="deadline-tag">📅 {{ formatDate(task.deadline) }}</span>
        </div>
      </div>
    </div>
    <div class="task-actions">
      <button class="action-btn" @click.stop="$emit('edit', task)" title="编辑">
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M8.5 2.5L11.5 5.5L4 13H1V10L8.5 2.5Z" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
      </button>
      <button class="action-btn" @click.stop="$emit('sticky', task)" title="添加到便利贴">
        <svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
      </button>
      <button class="action-btn delete" @click.stop="$emit('delete', task.id)" title="删除">
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 4H12M5 4V2.5H9V4M3.5 4L4 11.5H10L10.5 4" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  task: { type: Object, required: true }
})

defineEmits(['click', 'complete', 'edit', 'delete', 'sticky'])

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = (target - today) / (24 * 60 * 60 * 1000)

  if (diff === 0) return `今天 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  if (diff === 1) return `明天 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  if (diff > 0 && diff < 7) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${days[d.getDay()]} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.task-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border-light);
  border-left: 4px solid var(--accent);
  transition: all 0.25s ease;
  cursor: pointer;
}

.task-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
  border-color: var(--border-color);
}

.task-card.completed {
  opacity: 0.55;
  border-left-color: var(--text-muted);
}

.task-card.priority-高 { border-left-color: var(--priority-high-text); }
.task-card.priority-中 { border-left-color: var(--accent); }
.task-card.priority-低 { border-left-color: var(--priority-low-text); }

.task-header {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.check-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
  background: transparent;
}

.check-btn:hover {
  border-color: var(--accent);
  background: rgba(125, 184, 138, 0.08);
}

.check-btn.checked {
  background: var(--accent);
  border-color: var(--accent);
  animation: checkPop 0.3s ease;
}

@keyframes checkPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-title.line-through {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.category-tag, .priority-tag, .deadline-tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  font-weight: 500;
}

.category-tag { background: var(--color-other); color: var(--color-other-text); }
.category-tag.cat-学习 { background: var(--color-study); color: var(--color-study-text); }
.category-tag.cat-工作 { background: var(--color-work); color: var(--color-work-text); }
.category-tag.cat-会议 { background: var(--color-meeting); color: var(--color-meeting-text); }
.category-tag.cat-生活 { background: var(--color-life); color: var(--color-life-text); }
.category-tag.cat-购物 { background: var(--color-shopping); color: var(--color-shopping-text); }
.category-tag.cat-长期计划 { background: var(--color-longterm); color: var(--color-longterm-text); }

.priority-tag { background: var(--priority-medium-bg); color: var(--priority-medium-text); }
.priority-tag.pri-高 { background: var(--priority-high-bg); color: var(--priority-high-text); }
.priority-tag.pri-低 { background: var(--priority-low-bg); color: var(--priority-low-text); }

.deadline-tag {
  color: var(--text-secondary);
  background: var(--bg-secondary);
}

.task-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.action-btn.delete:hover {
  background: var(--priority-high-bg);
  color: var(--priority-high-text);
}
</style>
