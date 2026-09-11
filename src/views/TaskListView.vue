<template>
  <div class="task-list-view">
    <div class="page-header">
      <h1 class="page-title">📋 全部任务</h1>
      <router-link to="/input" class="add-btn">
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 2V12M2 7H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        添加任务
      </router-link>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="filter-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="filter-group">
        <select v-model="filterCategory" class="filter-select">
          <option value="">全部类别</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="filterPriority" class="filter-select">
          <option value="">全部优先级</option>
          <option value="高">高优先级</option>
          <option value="中">中优先级</option>
          <option value="低">低优先级</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="">全部状态</option>
          <option value="未开始">未开始</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
          <option value="已延期">已延期</option>
        </select>
      </div>
    </div>

    <div class="task-list" v-if="filteredTasks.length > 0">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @complete="handleComplete"
        @edit="handleEdit"
        @delete="handleDelete"
        @sticky="handleSticky"
      />
    </div>
    <div class="empty-state" v-else>
      <div class="empty-icon">📭</div>
      <p class="empty-title">没有找到匹配的任务</p>
      <p class="empty-desc">试试调整筛选条件，或添加新任务</p>
    </div>

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

const activeTab = ref('all')
const filterCategory = ref('')
const filterPriority = ref('')
const filterStatus = ref('')
const showEditModal = ref(false)
const editingTask = ref(null)

const tabs = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'all', label: '全部' }
]

const categories = ['学习', '工作', '会议', '生活', '购物', '长期计划', '其他']

const filteredTasks = computed(() => {
  let list = []
  if (activeTab.value === 'today') list = taskStore.todayTasks
  else if (activeTab.value === 'week') list = taskStore.weekTasks
  else list = taskStore.tasks

  if (filterCategory.value) {
    list = list.filter(t => t.category === filterCategory.value)
  }
  if (filterPriority.value) {
    list = list.filter(t => t.priority === filterPriority.value)
  }
  if (filterStatus.value) {
    list = list.filter(t => t.status === filterStatus.value)
  }

  return taskStore.sortByPriority(list)
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
.task-list-view {
  max-width: 760px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
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
}

.add-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 6px;
}

.filter-btn {
  padding: 7px 18px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  transition: all 0.25s;
}

.filter-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-color);
}

.filter-btn.active {
  background: var(--accent);
  color: white;
  font-weight: 600;
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(125, 184, 138, 0.25);
}

.filter-select {
  padding: 7px 12px;
  font-size: 12px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
}

.filter-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(125, 184, 138, 0.12);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 24px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  border: 1px dashed var(--border-color);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
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
}
</style>
