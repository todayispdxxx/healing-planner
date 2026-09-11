import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '../services/storage'
import { useTaskStore } from './taskStore'

const PET_MESSAGES = {
  greet: ['你好呀，今天也要加油哦~', '新的一天，慢慢来~', '今天想做些什么呢？'],
  addTask: ['我帮你记下啦~', '又多了一件要做的事呢~', '好的，已经帮你记好了！'],
  completeTask: ['太棒了，又完成一件小事~', '辛苦啦，你真棒！', '慢慢来，你已经在前进了~', '今天也推进了一小步，很棒~'],
  manyTasks: ['今天任务有点多，可以先做最重要的三件~', '别着急，一件一件来~', '深呼吸，慢慢做就好~'],
  overdue: ['没关系，我们重新安排一下~', '别灰心，调整一下计划吧~', '晚一点也没关系，继续前进~'],
  idle: ['休息一下也不错哦~', '要不要看看今天的计划？', '喝杯水吧~']
}

function randomMessage(type) {
  const msgs = PET_MESSAGES[type] || PET_MESSAGES.idle
  return msgs[Math.floor(Math.random() * msgs.length)]
}

export const usePetStore = defineStore('pet', () => {
  const petState = ref(storage.getPetState())
  const currentMessage = ref(petState.value.lastMessage || '你好呀，今天也要加油哦~')
  const petMood = ref(petState.value.mood || 'happy')

  function _save() {
    storage.savePetState({
      mood: petMood.value,
      lastMessage: currentMessage.value,
      totalCompleted: petState.value.totalCompleted
    })
  }

  function triggerMessage(type) {
    currentMessage.value = randomMessage(type)
    switch (type) {
      case 'completeTask':
        petMood.value = 'excited'
        petState.value.totalCompleted = (petState.value.totalCompleted || 0) + 1
        break
      case 'addTask':
        petMood.value = 'happy'
        break
      case 'manyTasks':
        petMood.value = 'worried'
        break
      case 'overdue':
        petMood.value = 'sad'
        break
      default:
        petMood.value = 'happy'
    }
    _save()
  }

  function checkTaskStatus() {
    const taskStore = useTaskStore()
    if (taskStore.todayTotal >= 6) {
      triggerMessage('manyTasks')
    }
  }

  return {
    currentMessage,
    petMood,
    petState,
    triggerMessage,
    checkTaskStatus
  }
})