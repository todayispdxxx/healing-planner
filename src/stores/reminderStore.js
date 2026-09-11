import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTaskStore } from './taskStore'

const GENTLE_REMINDERS = [
  '温馨提示：{task} 快到时间啦~',
  '别忘了哦，{task} 马上就要到了~',
  '小提醒：{task} 的时间快到了，准备一下~',
  '{task} 即将开始，深呼吸，你可以的~',
  '温柔地提醒你，{task} 的时间到了哦~'
]

export const useReminderStore = defineStore('reminder', () => {
  const activeReminders = ref([])
  let checkInterval = null

  function getGentleReminder(task) {
    const template = GENTLE_REMINDERS[Math.floor(Math.random() * GENTLE_REMINDERS.length)]
    return template.replace('{task}', task.title)
  }

  function checkReminders() {
    const taskStore = useTaskStore()
    const now = new Date()

    taskStore.tasks.forEach(task => {
      if (task.status === '已完成') return
      if (!task.reminderTime) return

      const reminderTime = new Date(task.reminderTime)
      const diff = now - reminderTime

      if (diff >= 0 && diff < 60000) {
        const alreadyReminded = activeReminders.value.find(r => r.taskId === task.id)
        if (!alreadyReminded) {
          const reminder = {
            id: 'reminder_' + Date.now(),
            taskId: task.id,
            title: '温馨提醒',
            message: getGentleReminder(task),
            time: new Date().toISOString(),
            dismissed: false
          }
          activeReminders.value.push(reminder)

          if (window.electronAPI) {
            window.electronAPI.showNotification(reminder.title, reminder.message)
          }
        }
      }
    })
  }

  function dismissReminder(id) {
    const r = activeReminders.value.find(r => r.id === id)
    if (r) r.dismissed = true
    activeReminders.value = activeReminders.value.filter(r => !r.dismissed)
  }

  function startChecking() {
    if (checkInterval) clearInterval(checkInterval)
    checkInterval = setInterval(checkReminders, 30000)
    checkReminders()
  }

  function stopChecking() {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  return {
    activeReminders,
    dismissReminder,
    startChecking,
    stopChecking
  }
})