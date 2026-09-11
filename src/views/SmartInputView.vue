<template>
  <div class="smart-input-view">
    <div class="page-header">
      <h1 class="page-title">✨ 智能输入</h1>
      <p class="page-subtitle">用自然语言快速记录你的待办事项，支持语音和 AI 解析</p>
    </div>

    <div class="input-section">
      <div class="input-card">
        <div class="input-card-header">
          <span class="input-mode-label">{{ isListening ? '🎤 正在录音...' : '⌨️ 文本输入' }}</span>
          <div class="input-mode-switch">
            <button class="mode-pill" :class="{ active: !isListening }">文本</button>
            <button class="mode-pill" :class="{ active: isListening }" @click="toggleVoice">语音</button>
          </div>
        </div>

        <textarea
          v-model="inputText"
          class="smart-textarea"
          placeholder="在这里输入你要做的事情...&#10;&#10;例如：明天上午十点交软件工程报告，下午三点开组会，周五前把PPT做完，晚上背英语单词"
          rows="5"
          @keydown.ctrl.enter="handleParse"
        ></textarea>

        <div v-if="isListening" class="voice-status">
          <span class="voice-pulse"></span>
          <span>{{ recordingTimer > 0 ? `录音中 ${recordingTimer}s` : '正在录音...' }}</span>
          <button class="voice-stop-btn" @click="toggleVoice">停止录音</button>
        </div>

        <div v-if="isTranscribing" class="transcribe-status">
          <span class="transcribe-spinner"></span>
          <span>正在转写语音...</span>
        </div>

        <div class="input-toolbar">
          <div class="toolbar-left">
            <button
              class="tool-btn"
              :class="{ recording: isListening }"
              @click="toggleVoice"
            >
              <span class="tool-icon">{{ isListening ? '⏹' : '🎤' }}</span>
              <span>{{ isListening ? '停止' : '语音输入' }}</span>
              <span v-if="isListening" class="rec-dot"></span>
            </button>
            <button
              class="tool-btn ai-btn"
              @click="useAIParse"
              :disabled="!inputText.trim() || aiLoading"
            >
              <span class="tool-icon">🤖</span>
              <span>{{ aiLoading ? '解析中...' : 'AI 解析' }}</span>
            </button>
          </div>
          <button class="parse-btn" @click="handleParse" :disabled="!inputText.trim()">
            <span>解析任务</span>
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div class="voice-mode-card">
        <div class="vmc-header">
          <span class="vmc-title">🎙️ 语音输入模式</span>
          <div class="vmc-switch">
            <button class="vmc-pill" :class="{ active: voiceMode === 'webapi' }" @click="switchVoiceMode('webapi')">在线识别</button>
            <button class="vmc-pill" :class="{ active: voiceMode === 'record' }" @click="switchVoiceMode('record')">录音转写</button>
          </div>
        </div>
        <div class="vmc-desc" v-if="voiceMode === 'webapi'">
          <p>使用浏览器内置语音识别（Web Speech API）。<strong>需要 Chrome 浏览器 + 网络连接</strong>（国内可能需要代理）。</p>
        </div>
        <div class="vmc-desc" v-else>
          <p>先录音，再通过语音转写 API 将录音转为文字。<strong>国内网络可用</strong>，需在设置页配置转写 API。</p>
          <div class="vmc-config" v-if="!hasSTTConfig">
            <span class="vmc-warn">⚠️ 尚未配置语音转写 API</span>
            <router-link to="/settings" class="vmc-link">去配置 →</router-link>
          </div>
          <div class="vmc-config" v-else>
            <span class="vmc-ok">✅ 已配置 {{ sttProviderName }}</span>
          </div>
        </div>
      </div>

      <div class="ai-hint-card" v-if="!hasAPIConfig">
        <div class="hint-content">
          <span class="hint-icon">💡</span>
          <div class="hint-text">
            <p class="hint-title">试试 AI 智能解析</p>
            <p class="hint-desc">点击「AI 解析」使用内置模拟解析，或在设置页配置真实 API</p>
          </div>
        </div>
        <router-link to="/settings" class="hint-link">去配置 →</router-link>
      </div>
    </div>

    <div class="result-section" v-if="parsedTasks.length > 0">
      <div class="result-header">
        <h2 class="section-title">📋 解析结果</h2>
        <span class="result-badge">{{ parsedTasks.length }} 个任务</span>
      </div>
      <div class="parsed-tasks">
        <div v-for="(task, index) in parsedTasks" :key="task.id" class="parsed-task-card">
          <div class="parsed-task-header">
            <span class="task-index">#{{ index + 1 }}</span>
            <div class="parsed-task-tags">
              <span class="category-tag" :class="`cat-${task.category}`">{{ task.category }}</span>
              <span class="priority-tag" :class="`pri-${task.priority}`">{{ task.priority }}</span>
            </div>
          </div>
          <div class="parsed-task-body">
            <input v-model="task.title" class="parsed-input" placeholder="任务标题" />
            <div class="parsed-task-detail">
              <div class="detail-row">
                <label>截止时间</label>
                <input type="datetime-local" v-model="task.deadline" class="detail-input" />
              </div>
              <div class="detail-row">
                <label>提醒时间</label>
                <input type="datetime-local" v-model="task.reminderTime" class="detail-input" />
              </div>
              <div class="detail-row">
                <label>类别</label>
                <select v-model="task.category" class="detail-input">
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="detail-row">
                <label>优先级</label>
                <select v-model="task.priority" class="detail-input">
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="confirm-actions">
        <button class="btn-secondary" @click="parsedTasks = []">取消</button>
        <button class="btn-primary" @click="handleConfirm">
          <span>确认添加全部</span>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 8L6 12L14 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>

    <div class="tips-section" v-if="parsedTasks.length === 0">
      <h3 class="tips-title">💡 输入小贴士</h3>
      <div class="tips-grid">
        <div class="tip-card">
          <div class="tip-emoji">⏰</div>
          <p class="tip-text">包含时间信息效果更好</p>
          <span class="tip-example">"明天下午三点开会"</span>
        </div>
        <div class="tip-card">
          <div class="tip-emoji">📝</div>
          <p class="tip-text">可以一次输入多个任务</p>
          <span class="tip-example">"交报告，开组会，做PPT"</span>
        </div>
        <div class="tip-card">
          <div class="tip-emoji">🎤</div>
          <p class="tip-text">支持语音输入</p>
          <span class="tip-example">切换「录音转写」模式，国内可用</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../stores/taskStore'
import { usePetStore } from '../stores/petStore'
import { useSettingsStore } from '../stores/settingsStore'
import { smartParse } from '../services/taskParser'
import { voiceInput } from '../services/voiceInput'
import { voiceRecorder, sttService } from '../services/voiceRecorder'
import { mockAIParse } from '../services/mockAI'

const router = useRouter()
const taskStore = useTaskStore()
const petStore = usePetStore()
const settingsStore = useSettingsStore()

const inputText = ref('')
const parsedTasks = ref([])
const isListening = ref(false)
const isTranscribing = ref(false)
const aiLoading = ref(false)
const recordingTimer = ref(0)
let timerInterval = null

const categories = ['学习', '工作', '会议', '生活', '购物', '长期计划', '其他']

const voiceMode = computed(() => settingsStore.settings.voiceMode || 'webapi')

const hasAPIConfig = computed(() => {
  const s = settingsStore.settings
  return !!(s.apiEndpoint && s.apiKey && s.apiModel)
})

const hasSTTConfig = computed(() => {
  const s = settingsStore.settings
  return !!(s.sttApiEndpoint && s.sttApiKey)
})

const sttProviderName = computed(() => {
  const s = settingsStore.settings
  const providers = { openai: 'OpenAI Whisper', baidu: '百度语音', iflytek: '讯飞语音', aliyun: '阿里语音' }
  return providers[s.sttApiProvider] || s.sttApiProvider || '语音转写 API'
})

function switchVoiceMode(mode) {
  settingsStore.updateSettings({ voiceMode: mode })
}

async function toggleVoice() {
  if (isListening.value) {
    stopRecording()
    return
  }
  const mode = voiceMode.value
  if (mode === 'webapi') {
    await startWebAPI()
  } else {
    await startRecording()
  }
}

async function startWebAPI() {
  if (!voiceInput.supported) {
    alert('当前浏览器不支持在线语音识别。\n\n请尝试以下方案：\n1. 使用 Chrome 浏览器\n2. 切换到「录音转写」模式（国内网络可用）')
    return
  }
  isListening.value = true
  voiceInput.start(
    (result) => {
      if (result.final) {
        inputText.value = inputText.value ? inputText.value + result.final : result.final
      }
    },
    (finalText) => {
      isListening.value = false
      if (finalText && !inputText.value) inputText.value = finalText
    },
    (error) => {
      isListening.value = false
      if (error.message.includes('网络') || error.message.includes('network')) {
        alert('在线语音识别网络连接失败。\n\n建议切换到「录音转写」模式，配置国内语音转写 API 后即可使用。')
      } else if (error.message.includes('不允许') || error.message.includes('not-allowed')) {
        alert('麦克风权限被拒绝。\n\n请点击浏览器地址栏左侧图标，将麦克风权限设为"允许"，然后刷新页面重试。')
      } else {
        alert('语音识别出错：' + error.message)
      }
    }
  )
}

async function startRecording() {
  isListening.value = true
  recordingTimer.value = 0
  timerInterval = setInterval(() => { recordingTimer.value++ }, 1000)
  voiceRecorder.start(
    () => { },
    async (audioBlob) => {
      isListening.value = false
      clearInterval(timerInterval)
      recordingTimer.value = 0
      if (!hasSTTConfig.value) {
        alert('尚未配置语音转写 API。\n\n请前往设置页面配置语音转写服务。')
        return
      }
      isTranscribing.value = true
      try {
        const settings = settingsStore.settings
        let text = ''
        if (settings.sttApiProvider === 'baidu') {
          text = await sttService.transcribeWithBaiduAPI(audioBlob, settings)
        } else {
          text = await sttService.transcribeWithAPI(audioBlob, settings)
        }
        if (text) {
          inputText.value = inputText.value ? inputText.value + text : text
        } else {
          alert('语音转写返回为空，请尝试重新录音。')
        }
      } catch (e) {
        alert('语音转写失败：' + e.message)
      } finally {
        isTranscribing.value = false
      }
    },
    (error) => {
      isListening.value = false
      clearInterval(timerInterval)
      recordingTimer.value = 0
      alert(error.message)
    }
  )
}

function stopRecording() {
  if (voiceMode.value === 'webapi') {
    voiceInput.stop()
    isListening.value = false
  } else {
    voiceRecorder.stop()
  }
  clearInterval(timerInterval)
}

async function useAIParse() {
  if (!inputText.value.trim()) return
  const settings = settingsStore.settings
  if (settings.apiEndpoint === 'mock' || settings.apiProvider === 'mock' || !settings.apiKey || !settings.apiEndpoint) {
    aiLoading.value = true
    try {
      const result = await mockAIParse(inputText.value)
      if (result?.tasks) {
        parsedTasks.value = result.tasks.map(t => ({
          id: t.id || Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
          title: t.title || '', description: t.description || t.title || '',
          deadline: t.deadline ? formatForInput(t.deadline) : '',
          reminderTime: t.reminderTime ? formatForInput(t.reminderTime) : '',
          category: t.category || '其他', priority: t.priority || '中',
          status: t.status || '未开始', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        }))
      }
    } catch (e) { alert('AI 解析失败：' + e.message) }
    finally { aiLoading.value = false }
    return
  }
  aiLoading.value = true
  try {
    const response = await fetch(settings.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` },
      body: JSON.stringify({
        model: settings.apiModel || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '你是一个任务解析助手，只返回JSON格式结果。' },
          { role: 'user', content: `请将以下自然语言文本拆分为多个任务，返回JSON格式。每个任务包含字段：title(标题), description(描述), deadline(截止时间ISO格式), reminderTime(提醒时间ISO格式), category(类别：学习/工作/会议/生活/购物/长期计划/其他), priority(优先级：高/中/低), status(状态：未开始)。\n\n文本：${inputText.value}\n\n请只返回JSON，格式为：{"tasks": [...]}` }
        ], temperature: 0.3
      })
    })
    if (!response.ok) throw new Error(`API 请求失败 (${response.status})`)
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || data.result || data.text
    if (!content) throw new Error('API 返回内容为空')
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content)
    if (result.tasks) {
      parsedTasks.value = result.tasks.map(t => ({
        id: t.id || Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        title: t.title || '', description: t.description || t.title || '',
        deadline: t.deadline ? formatForInput(t.deadline) : '',
        reminderTime: t.reminderTime ? formatForInput(t.reminderTime) : '',
        category: t.category || '其他', priority: t.priority || '中',
        status: t.status || '未开始', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      }))
    }
  } catch (e) { alert('AI 解析失败：' + (e.message || '请检查 API 配置')) }
  finally { aiLoading.value = false }
}

function handleParse() {
  if (!inputText.value.trim()) return
  const results = smartParse(inputText.value)
  parsedTasks.value = results.map(t => ({
    ...t,
    deadline: t.deadline ? formatForInput(t.deadline) : '',
    reminderTime: t.reminderTime ? formatForInput(t.reminderTime) : ''
  }))
}

function formatForInput(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function handleConfirm() {
  parsedTasks.value.forEach(task => {
    const data = { ...task }
    data.deadline = data.deadline ? new Date(data.deadline).toISOString() : null
    data.reminderTime = data.reminderTime ? new Date(data.reminderTime).toISOString() : null
    taskStore.addTask(data)
  })
  petStore.triggerMessage('addTask')
  petStore.checkTaskStatus()
  parsedTasks.value = []
  inputText.value = ''
  router.push('/')
}

onUnmounted(() => {
  if (isListening.value) { voiceInput.stop(); voiceRecorder.stop() }
  clearInterval(timerInterval)
})
</script>

<style scoped>
.smart-input-view { max-width: 760px; }
.page-header { margin-bottom: 28px; }
.page-title { font-size: 26px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.page-subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 4px; line-height: 1.5; }

.input-card {
  background: var(--bg-card); border-radius: var(--radius-xl);
  padding: 22px 24px; box-shadow: var(--shadow-card); border: 1px solid var(--border-light);
}
.input-card-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
}
.input-mode-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.input-mode-switch {
  display: flex; background: var(--bg-secondary); border-radius: var(--radius-full); padding: 3px;
}
.mode-pill {
  padding: 5px 16px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600;
  color: var(--text-muted); transition: all 0.25s;
}
.mode-pill.active {
  background: var(--bg-card); color: var(--accent); box-shadow: var(--shadow-soft);
}

.smart-textarea {
  width: 100%; border: none; background: transparent; resize: none;
  font-size: 15px; line-height: 1.8; color: var(--text-primary); padding: 0;
}
.smart-textarea:focus { border: none; box-shadow: none; outline: none; }
.smart-textarea::placeholder { color: var(--text-muted); }

.voice-status {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px; margin-top: 12px;
  background: linear-gradient(135deg, #FFE3E3 0%, #FFCDD2 100%);
  border-radius: var(--radius-md); font-size: 13px; color: var(--priority-high-text); font-weight: 500;
}
.voice-pulse {
  width: 10px; height: 10px; background: #E57373; border-radius: 50%; position: relative;
}
.voice-pulse::after {
  content: ''; position: absolute; inset: -4px; border-radius: 50%;
  border: 2px solid #E57373; animation: pulse-ring 1s ease infinite;
}
.voice-stop-btn {
  margin-left: auto; padding: 4px 14px; border-radius: var(--radius-full);
  background: rgba(229,115,115,0.15); color: var(--priority-high-text);
  font-size: 12px; font-weight: 600; transition: background 0.15s;
}
.voice-stop-btn:hover { background: rgba(229,115,115,0.25); }

.transcribe-status {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px; margin-top: 12px;
  background: linear-gradient(135deg, #D0EBFF 0%, #C5F6FA 100%);
  border-radius: var(--radius-md); font-size: 13px; color: var(--color-work-dark); font-weight: 500;
}
.transcribe-spinner {
  width: 14px; height: 14px; border: 2px solid rgba(21,100,171,0.2);
  border-top-color: var(--color-work-dark); border-radius: 50%; animation: spin 0.8s linear infinite;
}

.input-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-light);
}
.toolbar-left { display: flex; gap: 8px; }
.tool-btn {
  display: flex; align-items: center; gap: 5px; padding: 7px 16px; border-radius: var(--radius-full);
  font-size: 12px; font-weight: 500; color: var(--text-secondary);
  background: var(--bg-secondary); transition: all 0.2s;
}
.tool-btn:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-primary); }
.tool-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tool-btn.recording { background: var(--priority-high-bg); color: var(--priority-high-text); }
.tool-btn.ai-btn:hover:not(:disabled) { background: var(--color-meeting); color: var(--color-meeting-dark); }
.rec-dot {
  width: 6px; height: 6px; background: currentColor; border-radius: 50%;
  animation: blink 0.8s ease infinite;
}
.parse-btn {
  display: flex; align-items: center; gap: 6px; padding: 9px 22px;
  background: var(--accent); color: white; border-radius: var(--radius-full);
  font-size: 14px; font-weight: 600; transition: all 0.25s;
  box-shadow: 0 2px 12px rgba(125, 184, 138, 0.3);
}
.parse-btn:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
.parse-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

.voice-mode-card {
  margin-top: 16px; background: var(--bg-card); border-radius: var(--radius-lg);
  padding: 18px 22px; box-shadow: var(--shadow-soft); border: 1px solid var(--border-light);
}
.vmc-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
}
.vmc-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.vmc-switch {
  display: flex; background: var(--bg-secondary); border-radius: var(--radius-full); padding: 2px;
}
.vmc-pill {
  padding: 4px 14px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600;
  color: var(--text-muted); transition: all 0.2s;
}
.vmc-pill.active {
  background: var(--bg-card); color: var(--accent); box-shadow: var(--shadow-soft);
}
.vmc-desc p { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
.vmc-config {
  display: flex; align-items: center; gap: 10px; margin-top: 10px;
  padding-top: 10px; border-top: 1px solid var(--border-light);
}
.vmc-warn { font-size: 12px; color: var(--priority-high-text); font-weight: 500; }
.vmc-ok { font-size: 12px; color: var(--accent); font-weight: 500; }
.vmc-link {
  font-size: 12px; color: var(--accent); text-decoration: none; font-weight: 600;
}

.ai-hint-card {
  margin-top: 16px; background: var(--bg-card); border-radius: var(--radius-lg);
  padding: 16px 22px; box-shadow: var(--shadow-soft); border: 1px solid var(--border-light);
  display: flex; justify-content: space-between; align-items: center;
}
.hint-content { display: flex; align-items: center; gap: 12px; }
.hint-icon { font-size: 22px; }
.hint-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.hint-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.hint-link { font-size: 13px; color: var(--accent); text-decoration: none; font-weight: 600; white-space: nowrap; }

.result-section { margin-top: 32px; }
.result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-title { font-size: 17px; font-weight: 600; color: var(--text-primary); }
.result-badge { font-size: 12px; padding: 4px 12px; border-radius: var(--radius-full); background: var(--accent); color: white; font-weight: 600; }

.parsed-tasks { display: flex; flex-direction: column; gap: 12px; }
.parsed-task-card {
  background: var(--bg-card); border-radius: var(--radius-lg); padding: 18px;
  box-shadow: var(--shadow-soft); border: 1px solid var(--border-light);
}
.parsed-task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.task-index { font-size: 14px; font-weight: 700; color: var(--accent); }
.parsed-task-tags { display: flex; gap: 6px; }
.category-tag, .priority-tag { font-size: 11px; padding: 3px 10px; border-radius: var(--radius-full); font-weight: 600; }
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

.parsed-input {
  width: 100%; font-size: 14px; font-weight: 500; border: none;
  border-bottom: 2px solid var(--border-color); border-radius: 0;
  padding: 6px 0; background: transparent;
}
.parsed-input:focus { border-bottom-color: var(--accent); box-shadow: none; outline: none; }
.parsed-task-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; margin-top: 12px; }
.detail-row { display: flex; align-items: center; gap: 8px; }
.detail-row label { font-size: 12px; color: var(--text-muted); white-space: nowrap; min-width: 52px; font-weight: 500; }
.detail-input { flex: 1; font-size: 12px; padding: 6px 10px; border-radius: var(--radius-sm); border: 1.5px solid var(--border-color); background: var(--bg-input); }
.detail-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(125, 184, 138, 0.12); }

.confirm-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.btn-secondary {
  padding: 10px 22px; border-radius: var(--radius-sm); font-size: 14px;
  color: var(--text-secondary); font-weight: 500; transition: all 0.15s;
}
.btn-secondary:hover { background: var(--bg-hover); }
.btn-primary {
  display: flex; align-items: center; gap: 6px; padding: 10px 24px;
  border-radius: var(--radius-sm); font-size: 14px; background: var(--accent);
  color: white; font-weight: 600; transition: all 0.15s;
  box-shadow: 0 2px 12px rgba(125, 184, 138, 0.3);
}
.btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }

.tips-section { margin-top: 36px; }
.tips-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--text-primary); }
.tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.tip-card {
  background: var(--bg-card); border-radius: var(--radius-lg); padding: 24px;
  box-shadow: var(--shadow-soft); text-align: center; transition: all 0.25s;
  border: 1px solid var(--border-light);
}
.tip-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-card); }
.tip-emoji { font-size: 32px; margin-bottom: 12px; }
.tip-text { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.tip-example { font-size: 11px; color: var(--text-muted); }

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
