import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '../services/storage'

export const useStickyStore = defineStore('stickies', () => {
  const stickies = ref(storage.getStickies())

  function _save() {
    storage.saveStickies(stickies.value)
  }

  function createSticky(task) {
    const sticky = {
      id: 'sticky_' + task.id,
      taskId: task.id,
      title: task.title,
      deadline: task.deadline,
      priority: task.priority,
      category: task.category,
      completed: task.status === '已完成',
      createdAt: new Date().toISOString()
    }
    stickies.value.push(sticky)
    _save()
    return sticky
  }

  function deleteSticky(id) {
    stickies.value = stickies.value.filter(s => s.id !== id)
    _save()
  }

  function completeSticky(id) {
    const sticky = stickies.value.find(s => s.id === id)
    if (sticky) {
      sticky.completed = true
      _save()
    }
    return sticky
  }

  function updateSticky(id, updates) {
    const idx = stickies.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      stickies.value[idx] = { ...stickies.value[idx], ...updates }
      _save()
    }
  }

  function isTaskSticky(taskId) {
    return stickies.value.some(s => s.taskId === taskId)
  }

  return {
    stickies,
    createSticky,
    deleteSticky,
    completeSticky,
    updateSticky,
    isTaskSticky
  }
})