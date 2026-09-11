import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '../services/storage'
import { smartParse } from '../services/taskParser'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref(storage.getTasks())

  function _save() {
    storage.saveTasks(tasks.value)
  }

  const todayTasks = computed(() => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
    return tasks.value.filter(t => {
      if (!t.deadline) return false
      const d = new Date(t.deadline)
      return d >= start && d < end
    })
  })

  const weekTasks = computed(() => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
    return tasks.value.filter(t => {
      if (!t.deadline) return false
      const d = new Date(t.deadline)
      return d >= start && d < end
    })
  })

  const todayCompleted = computed(() => {
    return todayTasks.value.filter(t => t.status === '已完成').length
  })

  const todayTotal = computed(() => todayTasks.value.length)

  const todayProgress = computed(() => {
    if (todayTotal.value === 0) return 0
    return Math.round((todayCompleted.value / todayTotal.value) * 100)
  })

  function parseAndAddTasks(input) {
    const parsed = smartParse(input)
    parsed.forEach(t => {
      tasks.value.push(t)
    })
    _save()
    return parsed
  }

  function addTask(task) {
    tasks.value.push(task)
    _save()
    return task
  }

  function updateTask(id, updates) {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...updates, updatedAt: new Date().toISOString() }
      _save()
      return tasks.value[idx]
    }
    return null
  }

  function deleteTask(id) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    _save()
  }

  function completeTask(id) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.status = '已完成'
      task.updatedAt = new Date().toISOString()
      _save()
    }
    return task
  }

  function getTasksByCategory(category) {
    return tasks.value.filter(t => t.category === category)
  }

  function getTasksByPriority(priority) {
    return tasks.value.filter(t => t.priority === priority)
  }

  function sortByPriority(taskList) {
    const order = { '高': 0, '中': 1, '低': 2 }
    return [...taskList].sort((a, b) => order[a.priority] - order[b.priority])
  }

  return {
    tasks,
    todayTasks,
    weekTasks,
    todayCompleted,
    todayTotal,
    todayProgress,
    parseAndAddTasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    getTasksByCategory,
    getTasksByPriority,
    sortByPriority
  }
})