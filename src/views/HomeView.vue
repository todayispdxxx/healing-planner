<template>
  <div class="home-view">
    <!-- 顶部问候 -->
    <div class="page-header">
      <div class="greeting-section">
        <h1 class="page-title">{{ greeting }} 🌿</h1>
        <p class="page-subtitle">{{ dateStr }}，{{ motivationText }}</p>
      </div>
      <router-link to="/input" class="add-btn">
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span>添加任务</span>
      </router-link>
    </div>

    <!-- 进度卡片 -->
    <div class="progress-section">
      <div class="progress-card">
        <div class="progress-header">
          <div class="progress-info">
            <span class="progress-emoji">{{ progressEmoji }}</span>
            <div>
              <span class="progress-label">今日进度</span>
              <span class="progress-numbers">{{ taskStore.todayCompleted }} / {{ taskStore.todayTotal }}</span>
            </div>
          </div>
          <div class="progress-ring-wrap">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border-color)" stroke-width="5"/>
              <circle cx="28" cy="28" r="22" fill="none" stroke="var(--accent)" stroke-width="5"
                :stroke-dasharray="ringCircumference"
                :stroke-dashoffset="ringCircumference - (taskStore.todayProgress / 100) * ringCircumference"
                stroke-linecap="round"
                transform="rotate(-90 28 28)"
                class="progress-ring-fill"/>
            </svg>
            <span class="ring-text">{{ taskStore.todayProgress }}%</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: taskStore.todayProgress + '%' }"></div>
        </div>
        <p class="progress-hint">
          <template v-if="taskStore.todayProgress === 100">🎉 太棒了，今日任务全部完成！好好休息吧~</template>
          <template v-else-if="taskStore.todayProgress >= 75">💪 快完成了，再加把劲~</template>
          <template v-else-if="taskStore.todayProgress >= 50">🌿 已经过半啦，继续加油~</template>
          <template v-else-if="taskStore.todayTotal > 0">🌱 慢慢来，一件一件完成~</template>
          <template v-else>☀️ 今天还没有任务，先添加一些吧~</template>
        </p>
      </div>
    </div>

    <!-- 今日任务 -->
    <div class="task-section">
      <div class="section-header">
        <h2 class="section-title">📝 今日任务</h2>
        <router-link to="/input" class="section-link">快速添加 →</router-link>
      </div>
      <div class="task-list" v-if="taskStore.todayTasks.length > 0">
        <TaskCard
          v-for="task in sortedTodayTasks"
          :key="task.id"
          :task="task"
          @complete="handleComplete"
          @edit="handleEdit"
          @delete="handleDelete"
          @sticky="handleSticky"
        />
      </div>
      <div class="empty-state" v-else>
        <div class="empty-illustration">
          <span class="empty-icon">🌱</span>
          <div class="empty-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
        <p class="empty-title">今天还没有任务</p>
        <p class="empty-desc">点击下方按钮，开始规划你的一天吧~</p>
        <router-link to="/input" class="empty-btn">
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 2V12M2 7H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          添加第一个任务
        </router-link>
      </div>
    </div>

    <!-- 即将到来 -->
    <div class="task-section" v-if="upcomingTasks.length > 0">
      <div class="section-header">
        <h2 class="section-title">🕐 即将到来</h2>
        <router-link to="/tasks" class="section-link">查看全部 →</router-link>
      </div>
      <div class="task-list">
        <TaskCard
          v-for="task in upcomingTasks"
          :key="task.id"
          :task="task"
          @complete="handleComplete"
          @edit="handleEdit"
          @delete="handleDelete"
          @sticky="handleSticky"
        />
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <TaskEditModal
      v-if="showEditModal"
      :task="editingTask"
      :is-edit="true"
      @close="showEditModal = false"
      @save="handleSaveEdit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useStickyStore } from '../stores/stickyStore'
import { usePetStore } from '../stores/petStore'
import TaskCard from '../components/task/TaskCard.vue'
import TaskEditModal from '../components/task/TaskEditModal.vue'

const taskStore = useTaskStore()
const stickyStore = useStickyStore()
const petStore = usePetStore()

const showEditModal = ref(false)
const editingTask = ref(null)
const ringCircumference = 2 * Math.PI * 22

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const dateStr = computed(() => {
  const d = new Date()
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 星期${days[d.getDay()]}`
})

const motivationText = computed(() => {
  const texts = [
    '每一步都算数',
    '慢慢来，比较快',
    '今天也要温柔地对待自己',
    '你正在变得更好',
    '深呼吸，一切都会好的'
  ]
  return texts[new Date().getDate() % texts.length]
})

const progressEmoji = computed(() => {
  const p = taskStore.todayProgress
  if (p === 100) return '🎉'
  if (p >= 75) return '💪'
  if (p >= 50) return '🌿'
  if (p > 0) return '🌱'
  return '☀️'
})

const sortedTodayTasks = computed(() => {
  return taskStore.sortByPriority(taskStore.todayTasks)
})

const upcomingTasks = computed(() => {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const end = new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000)
  return taskStore.tasks.filter(t => {
    if (!t.deadline || t.status === '已完成') return false
    const d = new Date(t.deadline)
    return d >= start && d < end
  }).slice(0, 5)
})

function handleComplete(id) {
  taskStore.completeTask(id)
  petStore.triggerMessage('completeTask')
}

function handleEdit(task) {
  editingTask.value = { ...task }
  showEditModal.value = true
}

function handleDelete(id) {
  taskStore.deleteTask(id)
}

function handleSticky(task) {
  if (!stickyStore.isTaskSticky(task.id)) {
    stickyStore.createSticky(task)
  }
}

function handleSaveEdit(data) {
  if (editingTask.value) {
    taskStore.updateTask(editingTask.value.id, data)
    showEditModal.value = false
  }
}
</script>

<style scoped>
.home-view {
  max-width: 760px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  background: var(--accent);
  color: white;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s;
  box-shadow: 0 2px 12px rgba(125, 184, 138, 0.3);
  flex-shrink: 0;
}

.add-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(125, 184, 138, 0.4);
}

/* 进度卡片 */
.progress-section {
  margin-bottom: 32px;
}

.progress-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 24px 28px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.progress-emoji {
  font-size: 32px;
}

.progress-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-numbers {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.progress-ring-wrap {
  position: relative;
  width: 56px;
  height: 56px;
}

.progress-ring-fill {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
}

.progress-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-green));
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.progress-hint {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 12px;
  line-height: 1.5;
}

/* 任务区域 */
.task-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-link {
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.section-link:hover {
  color: var(--accent-hover);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  border: 1px dashed var(--border-color);
}

.empty-illustration {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.empty-icon {
  font-size: 48px;
  display: block;
}

.empty-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
}

.empty-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--border-color);
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
