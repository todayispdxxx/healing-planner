<template>
  <div
    class="desktop-pet"
    :class="[petMood, { dragging: isDragging, 'click-effect': clickEffect }]"
    :style="{ left: posX + 'px', top: posY + 'px' }"
    @mousedown="startDrag"
    @click="handlePetClick"
  >
    <div class="pet-avatar">
      <div class="pet-body">
        <div class="pet-face">
          <div class="pet-eyes">
            <span class="eye left" :class="{ closed: petMood === 'happy', wink: isWinking }"></span>
            <span class="eye right" :class="{ closed: petMood === 'happy', wink: isWinking }"></span>
          </div>
          <div class="pet-mouth" :class="petMood"></div>
          <div v-if="petMood === 'excited' || isWinking" class="pet-blush">
            <span class="blush left"></span>
            <span class="blush right"></span>
          </div>
        </div>
      </div>
      <div v-if="showHearts" class="hearts-container">
        <span v-for="i in 3" :key="i" class="heart" :style="{ animationDelay: (i * 0.15) + 's' }">❤</span>
      </div>
    </div>
    <div class="pet-message" v-if="showMessage">
      <div class="message-bubble">
        <p>{{ petStore.currentMessage }}</p>
      </div>
    </div>
    <div class="pet-progress">
      <div class="progress-ring">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="3"/>
          <circle cx="20" cy="20" r="16" fill="none" stroke="var(--accent)" stroke-width="3"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="circumference - (taskStore.todayProgress / 100) * circumference"
            stroke-linecap="round"
            transform="rotate(-90 20 20)"/>
        </svg>
        <span class="progress-num">{{ taskStore.todayProgress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePetStore } from '../../stores/petStore'
import { useTaskStore } from '../../stores/taskStore'

const petStore = usePetStore()
const taskStore = useTaskStore()

const petMood = computed(() => petStore.petMood)
const circumference = 2 * Math.PI * 16

const posX = ref(window.innerWidth - 140)
const posY = ref(window.innerHeight - 220)
const isDragging = ref(false)
const isWinking = ref(false)
const clickEffect = ref(false)
const showHearts = ref(false)
const showMessage = ref(true)

let dragOffsetX = 0
let dragOffsetY = 0
let hasMoved = false

const INTERACTION_MESSAGES = [
  '你在摸我吗？好舒服~',
  '嘿嘿，被发现了~',
  '今天也要加油哦！',
  '累了就休息一下吧~',
  '要不要看看今天的任务？',
  '我一直在陪着你哦~',
  '点我干嘛~',
  '好无聊，快去完成任务吧~',
  '你是最好的！',
  '咕噜咕噜~',
  '今天的你也很棒哦~',
  '慢慢来，不着急~',
  '喝杯水吧，要照顾好自己~'
]

function startDrag(e) {
  if (e.button !== 0) return
  isDragging.value = true
  hasMoved = false
  dragOffsetX = e.clientX - posX.value
  dragOffsetY = e.clientY - posY.value
  e.preventDefault()
}

function onDrag(e) {
  if (!isDragging.value) return
  hasMoved = true
  posX.value = e.clientX - dragOffsetX
  posY.value = e.clientY - dragOffsetY
}

function stopDrag() {
  if (!isDragging.value) return
  isDragging.value = false
  posX.value = Math.max(0, Math.min(posX.value, window.innerWidth - 100))
  posY.value = Math.max(0, Math.min(posY.value, window.innerHeight - 180))
}

function handlePetClick() {
  if (hasMoved) return

  clickEffect.value = true
  setTimeout(() => { clickEffect.value = false }, 300)

  isWinking.value = true
  setTimeout(() => { isWinking.value = false }, 400)

  showHearts.value = true
  setTimeout(() => { showHearts.value = false }, 900)

  const msg = INTERACTION_MESSAGES[Math.floor(Math.random() * INTERACTION_MESSAGES.length)]
  petStore.currentMessage = msg
  showMessage.value = true

  clearTimeout(messageTimer)
  messageTimer = setTimeout(() => {
    showMessage.value = false
  }, 4000)
}

let messageTimer = null

onMounted(() => {
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)

  showMessage.value = true
  messageTimer = setTimeout(() => {
    showMessage.value = false
  }, 5000)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  clearTimeout(messageTimer)
})
</script>

<style scoped>
.desktop-pet {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 100;
  cursor: grab;
  user-select: none;
  transition: filter 0.2s;
}

.desktop-pet:active {
  cursor: grabbing;
}

.desktop-pet.dragging {
  filter: drop-shadow(0 8px 24px rgba(139, 109, 70, 0.15));
}

.desktop-pet.click-effect .pet-body {
  transform: scale(0.9);
}

.pet-avatar {
  position: relative;
}

.pet-body {
  width: 68px;
  height: 68px;
  background: linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(255, 183, 77, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  position: relative;
}

.pet-body::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 14px;
  width: 16px;
  height: 10px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: rotate(-20deg);
}

.desktop-pet.excited .pet-body {
  background: linear-gradient(135deg, #FFCC80 0%, #FFB74D 100%);
  animation: bounce 0.5s ease;
}

.desktop-pet.worried .pet-body {
  background: linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%);
  box-shadow: 0 4px 20px rgba(129, 199, 132, 0.3);
}

.desktop-pet.sad .pet-body {
  background: linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%);
  box-shadow: 0 4px 20px rgba(100, 181, 246, 0.3);
}

.pet-face {
  position: relative;
  width: 42px;
  height: 42px;
}

.pet-eyes {
  display: flex;
  justify-content: space-between;
  padding: 9px 4px 0;
}

.eye {
  width: 7px;
  height: 7px;
  background: #5D4037;
  border-radius: 50%;
  transition: all 0.2s;
}

.eye.closed {
  height: 2px;
  border-radius: 2px;
  margin-top: 3px;
}

.eye.wink {
  height: 2px;
  border-radius: 2px;
  margin-top: 3px;
  width: 8px;
}

.pet-mouth {
  width: 8px;
  height: 4px;
  border-radius: 0 0 4px 4px;
  background: #8D6E63;
  margin: 6px auto 0;
  transition: all 0.3s;
}

.pet-mouth.excited {
  width: 10px;
  height: 6px;
  border-radius: 0 0 5px 5px;
}

.pet-mouth.worried {
  border-radius: 4px 4px 0 0;
  height: 3px;
  background: #8D6E63;
}

.pet-mouth.sad {
  border-radius: 4px 4px 0 0;
  height: 3px;
  margin-top: 7px;
}

.pet-blush {
  position: absolute;
  top: 18px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
}

.blush {
  width: 8px;
  height: 4px;
  background: #F48FB1;
  border-radius: 50%;
  opacity: 0.5;
}

.hearts-container {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
}

.heart {
  font-size: 12px;
  animation: heartFloat 0.8s ease forwards;
  opacity: 0;
}

@keyframes heartFloat {
  0% { transform: translateY(0) scale(0.5); opacity: 1; }
  100% { transform: translateY(-24px) scale(1); opacity: 0; }
}

.pet-message {
  max-width: 180px;
  animation: fadeInUp 0.3s ease;
}

.message-bubble {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  box-shadow: 0 2px 16px rgba(139, 109, 70, 0.08);
  position: relative;
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.5;
  text-align: center;
  border: 1px solid var(--border-light);
}

.message-bubble::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(255, 255, 255, 0.95);
}

.pet-progress {
  display: flex;
  justify-content: center;
}

.progress-ring {
  position: relative;
  width: 40px;
  height: 40px;
}

.progress-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: var(--text-secondary);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
