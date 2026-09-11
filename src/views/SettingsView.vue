<template>
  <div class="settings-view">
    <div class="page-header">
      <h1 class="page-title">⚙️ 设置</h1>
    </div>

    <!-- AI 智能解析 -->
    <div class="settings-section">
      <div class="section-header-row">
        <h2 class="section-title">🤖 AI 智能解析</h2>
        <span class="section-badge" :class="apiConfigured ? 'configured' : 'not-configured'">
          {{ apiConfigured ? '已配置' : '未配置' }}
        </span>
      </div>
      <p class="section-desc">接入 AI 大模型，获得更精准的任务解析效果。支持 OpenAI 兼容接口。</p>

      <div class="api-provider-grid">
        <button
          v-for="provider in apiProviders"
          :key="provider.id"
          class="provider-card"
          :class="{ active: form.apiProvider === provider.id }"
          @click="selectProvider(provider)"
        >
          <span class="provider-icon">{{ provider.icon }}</span>
          <span class="provider-name">{{ provider.name }}</span>
        </button>
        <button
          class="provider-card"
          :class="{ active: form.apiProvider === 'custom' }"
          @click="selectProvider({ id: 'custom', icon: '🔧', name: '自定义', endpoint: '', model: '' })"
        >
          <span class="provider-icon">🔧</span>
          <span class="provider-name">自定义</span>
        </button>
      </div>

      <div class="form-group">
        <label class="form-label">
          API 地址
          <span class="form-hint" v-if="form.apiProvider && form.apiProvider !== 'custom'">已自动填充</span>
        </label>
        <input v-model="form.apiEndpoint" class="form-input" placeholder="例如：https://api.openai.com/v1/chat/completions" />
        <p class="form-tip">OpenAI 兼容格式的 Chat Completions 接口地址</p>
      </div>

      <div class="form-group">
        <label class="form-label">API Key</label>
        <div class="api-key-row">
          <input v-model="form.apiKey" class="form-input" :type="showApiKey ? 'text' : 'password'" placeholder="sk-..." />
          <button class="toggle-visibility" @click="showApiKey = !showApiKey">
            {{ showApiKey ? '🙈 隐藏' : '👁 显示' }}
          </button>
        </div>
        <p class="form-tip">你的 Key 仅保存在本地，不会上传到任何服务器</p>
      </div>

      <div class="form-group">
        <label class="form-label">模型名称</label>
        <input v-model="form.apiModel" class="form-input" placeholder="例如：gpt-3.5-turbo" />
      </div>

      <div class="api-actions">
        <button class="btn-test" @click="testAPI" :disabled="apiTesting">
          {{ apiTesting ? '测试中...' : '🔍 测试连接' }}
        </button>
        <button class="btn-save-api" @click="saveAPIConfig">保存配置</button>
      </div>

      <div v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'error'">
        {{ testResult.message }}
      </div>
    </div>

    <!-- 语音转写 API -->
    <div class="settings-section">
      <div class="section-header-row">
        <h2 class="section-title">🎙️ 语音转写 API</h2>
        <span class="section-badge" :class="sttConfigured ? 'configured' : 'not-configured'">
          {{ sttConfigured ? '已配置' : '未配置' }}
        </span>
      </div>
      <p class="section-desc">配置语音转文字服务，使「录音转写」模式可用。国内网络推荐使用百度语音或讯飞语音。</p>

      <div class="api-provider-grid">
        <button
          v-for="p in sttProviders"
          :key="p.id"
          class="provider-card"
          :class="{ active: sttForm.sttApiProvider === p.id }"
          @click="selectSTTProvider(p)"
        >
          <span class="provider-icon">{{ p.icon }}</span>
          <span class="provider-name">{{ p.name }}</span>
        </button>
      </div>

      <div class="form-group">
        <label class="form-label">转写 API 地址</label>
        <input v-model="sttForm.sttApiEndpoint" class="form-input" placeholder="例如：https://api.openai.com/v1/audio/transcriptions" />
        <p class="form-tip">Whisper 兼容格式的音频转写接口地址</p>
      </div>

      <div class="form-group">
        <label class="form-label">API Key / Token</label>
        <input v-model="sttForm.sttApiKey" class="form-input" type="password" placeholder="输入 API Key 或 Access Token" />
        <p class="form-tip">百度语音填 Access Token，其他填 API Key</p>
      </div>

      <div class="form-group">
        <label class="form-label">模型名称</label>
        <input v-model="sttForm.sttApiModel" class="form-input" placeholder="例如：whisper-1" />
        <p class="form-tip">OpenAI Whisper 填 whisper-1，百度/讯飞可留空</p>
      </div>

      <div class="api-actions">
        <button class="btn-save-api" @click="saveSTTConfig">保存语音配置</button>
      </div>
    </div>

    <!-- 桌宠设置 -->
    <div class="settings-section">
      <h2 class="section-title">🐾 桌宠设置</h2>
      <div class="setting-item">
        <label class="setting-label">桌宠名称</label>
        <input v-model="petName" class="setting-input" @change="saveSettings" />
      </div>
      <div class="setting-item">
        <label class="setting-label">桌宠类型</label>
        <select v-model="petType" class="setting-input" @change="saveSettings">
          <option value="dumpling">小团子</option>
          <option value="cat">小猫</option>
          <option value="bear">小熊</option>
          <option value="cloud">云朵</option>
        </select>
      </div>
    </div>

    <!-- 提醒设置 -->
    <div class="settings-section">
      <h2 class="section-title">🔔 提醒设置</h2>
      <div class="setting-item">
        <label class="setting-label">启用提醒</label>
        <label class="toggle">
          <input type="checkbox" v-model="reminderEnabled" @change="saveSettings" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="setting-item">
        <label class="setting-label">提醒音效</label>
        <label class="toggle">
          <input type="checkbox" v-model="reminderSound" @change="saveSettings" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- 桌面应用设置 -->
    <div class="settings-section" v-if="isElectron">
      <h2 class="section-title">�️ 桌面应用</h2>
      <div class="setting-item">
        <label class="setting-label">开机自启动</label>
        <label class="toggle">
          <input type="checkbox" v-model="autoLaunch" @change="saveAutoLaunch" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="setting-item">
        <label class="setting-label">关闭时最小化到托盘</label>
        <span class="setting-hint">已默认启用，关闭窗口时应用会最小化到系统托盘</span>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="settings-section">
      <h2 class="section-title">�💾 数据管理</h2>
      <div class="setting-item">
        <label class="setting-label">导出数据</label>
        <button class="setting-btn" @click="exportData">导出 JSON</button>
      </div>
      <div class="setting-item">
        <label class="setting-label">导入数据</label>
        <button class="setting-btn" @click="importData">导入 JSON</button>
        <input type="file" ref="importFileRef" accept=".json" style="display:none" @change="handleImport" />
      </div>
      <div class="setting-item">
        <label class="setting-label">清除所有数据</label>
        <button class="setting-btn danger" @click="clearData">清除数据</button>
      </div>
    </div>

    <!-- 关于 -->
    <div class="settings-section">
      <h2 class="section-title">💡 关于</h2>
      <div class="about-info">
        <p><strong>🌸 治愈计划</strong> v1.0.0</p>
        <p>一个治愈系的智能计划管理应用</p>
        <p>面向学生和上班族，帮助你轻松整理待办事项</p>
        <p class="about-footer">用温柔的方式，管理每一天 ✨</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settingsStore'

const settingsStore = useSettingsStore()

const petName = ref('小团子')
const petType = ref('dumpling')
const reminderEnabled = ref(true)
const reminderSound = ref(true)
const showApiKey = ref(false)
const apiTesting = ref(false)
const testResult = ref(null)
const autoLaunch = ref(false)
const importFileRef = ref(null)

const isElectron = computed(() => !!window.electronAPI)

const form = reactive({
  apiProvider: '',
  apiEndpoint: '',
  apiKey: '',
  apiModel: ''
})

const apiProviders = [
  { id: 'mock', icon: '🧪', name: '模拟测试', endpoint: 'mock', model: 'mock-ai' },
  { id: 'openai', icon: '🟢', name: 'OpenAI', endpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-3.5-turbo' },
  { id: 'deepseek', icon: '🔵', name: 'DeepSeek', endpoint: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' },
  { id: 'zhipu', icon: '🟣', name: '智谱 AI', endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash' },
  { id: 'moonshot', icon: '🌙', name: 'Moonshot', endpoint: 'https://api.moonshot.cn/v1/chat/completions', model: 'moonshot-v1-8k' },
  { id: 'qwen', icon: '🟠', name: '通义千问', endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen-turbo' }
]

const apiConfigured = computed(() => {
  return !!(form.apiEndpoint && form.apiKey && form.apiModel)
})

const sttForm = reactive({
  sttApiProvider: '',
  sttApiEndpoint: '',
  sttApiKey: '',
  sttApiModel: ''
})

const sttProviders = [
  { id: 'openai', icon: '🟢', name: 'Whisper', endpoint: 'https://api.openai.com/v1/audio/transcriptions', model: 'whisper-1' },
  { id: 'deepseek', icon: '🔵', name: 'DeepSeek', endpoint: 'https://api.deepseek.com/v1/audio/transcriptions', model: 'deepseek-speech' },
  { id: 'baidu', icon: '🔴', name: '百度语音', endpoint: 'https://vop.baidu.com/server_api', model: '' },
  { id: 'aliyun', icon: '🟠', name: '阿里语音', endpoint: 'https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/asr', model: '' },
  { id: 'custom', icon: '🔧', name: '自定义', endpoint: '', model: '' }
]

const sttConfigured = computed(() => {
  return !!(sttForm.sttApiEndpoint && sttForm.sttApiKey)
})

function selectSTTProvider(p) {
  sttForm.sttApiProvider = p.id
  if (p.endpoint) sttForm.sttApiEndpoint = p.endpoint
  if (p.model) sttForm.sttApiModel = p.model
}

function saveSTTConfig() {
  settingsStore.updateSettings({
    sttApiProvider: sttForm.sttApiProvider,
    sttApiEndpoint: sttForm.sttApiEndpoint,
    sttApiKey: sttForm.sttApiKey,
    sttApiModel: sttForm.sttApiModel
  })
  testResult.value = { success: true, message: '✅ 语音转写配置已保存！' }
  setTimeout(() => { testResult.value = null }, 3000)
}

function selectProvider(provider) {
  form.apiProvider = provider.id
  if (provider.id === 'mock') {
    form.apiEndpoint = 'mock'
    form.apiKey = 'mock-key'
    form.apiModel = 'mock-ai'
  } else {
    if (provider.endpoint) form.apiEndpoint = provider.endpoint
    if (provider.model) form.apiModel = provider.model
  }
}

onMounted(async () => {
  const s = settingsStore.settings
  petName.value = s.petName || '小团子'
  petType.value = s.petType || 'dumpling'
  reminderEnabled.value = s.reminderEnabled !== false
  reminderSound.value = s.reminderSound !== false
  form.apiProvider = s.apiProvider || ''
  form.apiEndpoint = s.apiEndpoint || ''
  form.apiKey = s.apiKey || ''
  form.apiModel = s.apiModel || ''
  sttForm.sttApiProvider = s.sttApiProvider || ''
  sttForm.sttApiEndpoint = s.sttApiEndpoint || ''
  sttForm.sttApiKey = s.sttApiKey || ''
  sttForm.sttApiModel = s.sttApiModel || ''

  // 获取开机自启状态
  if (window.electronAPI?.getAutoLaunch) {
    autoLaunch.value = await window.electronAPI.getAutoLaunch()
  }
})

function saveSettings() {
  settingsStore.updateSettings({
    petName: petName.value,
    petType: petType.value,
    reminderEnabled: reminderEnabled.value,
    reminderSound: reminderSound.value
  })
}

async function saveAutoLaunch() {
  if (window.electronAPI?.setAutoLaunch) {
    window.electronAPI.setAutoLaunch(autoLaunch.value)
  }
}

function saveAPIConfig() {
  settingsStore.updateSettings({
    apiProvider: form.apiProvider,
    apiEndpoint: form.apiEndpoint,
    apiKey: form.apiKey,
    apiModel: form.apiModel
  })
  testResult.value = { success: true, message: '✅ 配置已保存' }
  setTimeout(() => { testResult.value = null }, 3000)
}

async function testAPI() {
  if (form.apiEndpoint === 'mock' || form.apiProvider === 'mock') {
    testResult.value = { success: true, message: '✅ 模拟测试模式已启用！在智能输入页点击「AI 解析」即可使用内置模拟解析。' }
    saveAPIConfig()
    return
  }

  if (!form.apiEndpoint || !form.apiKey) {
    testResult.value = { success: false, message: '❌ 请填写 API 地址和 Key' }
    return
  }

  apiTesting.value = true
  testResult.value = null

  try {
    const response = await fetch(form.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${form.apiKey}` },
      body: JSON.stringify({
        model: form.apiModel || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: '你好，请回复"连接成功"' }],
        max_tokens: 20
      })
    })

    if (response.ok) {
      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || ''
      testResult.value = { success: true, message: `✅ 连接成功！模型回复：${reply.slice(0, 50)}` }
      saveAPIConfig()
    } else {
      const err = await response.text().catch(() => '')
      testResult.value = { success: false, message: `❌ 连接失败 (${response.status})：${err.slice(0, 100)}` }
    }
  } catch (e) {
    testResult.value = { success: false, message: `❌ 网络错误：${e.message}` }
  } finally {
    apiTesting.value = false
    setTimeout(() => { testResult.value = null }, 8000)
  }
}

function exportData() {
  const data = localStorage.getItem('healing_planner_db')
  if (!data) return
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `healing-planner-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importData() {
  importFileRef.value?.click()
}

function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.tasks && data.settings) {
        localStorage.setItem('healing_planner_db', JSON.stringify(data))
        alert('✅ 数据导入成功！页面将刷新。')
        window.location.reload()
      } else {
        alert('❌ 文件格式不正确，请选择正确的备份文件。')
      }
    } catch {
      alert('❌ 文件解析失败，请确认文件格式正确。')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

function clearData() {
  if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
    localStorage.removeItem('healing_planner_db')
    window.location.reload()
  }
}
</script>

<style scoped>
.settings-view {
  max-width: 680px;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.settings-section {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 24px 28px;
  margin-bottom: 18px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border-light);
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.section-header-row .section-title {
  margin-bottom: 0;
}

.section-badge {
  font-size: 11px;
  padding: 3px 12px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.section-badge.configured {
  background: var(--color-study);
  color: var(--color-study-dark);
}

.section-badge.not-configured {
  background: var(--color-life);
  color: var(--color-life-dark);
}

.section-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.api-provider-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 22px;
}

.provider-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 2px solid transparent;
  transition: all 0.25s;
  cursor: pointer;
}

.provider-card:hover {
  background: var(--bg-hover);
}

.provider-card.active {
  border-color: var(--accent);
  background: rgba(125, 184, 138, 0.08);
}

.provider-icon {
  font-size: 22px;
}

.provider-name {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-hint {
  font-size: 11px;
  color: var(--accent);
  font-weight: 400;
}

.form-input {
  width: 100%;
  padding: 10px 16px;
  font-size: 13px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-color);
  background: var(--bg-input);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(125, 184, 138, 0.15);
}

.form-tip {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}

.api-key-row {
  display: flex;
  gap: 8px;
}

.api-key-row .form-input {
  flex: 1;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 12px;
}

.toggle-visibility {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  white-space: nowrap;
  transition: all 0.2s;
}

.toggle-visibility:hover {
  background: var(--bg-hover);
}

.api-actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.btn-test {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-primary);
  background: var(--bg-secondary);
  font-weight: 500;
  transition: all 0.2s;
}

.btn-test:hover:not(:disabled) {
  background: var(--bg-hover);
}

.btn-test:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save-api {
  padding: 10px 22px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--accent);
  color: white;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(125, 184, 138, 0.25);
}

.btn-save-api:hover {
  background: var(--accent-hover);
}

.test-result {
  margin-top: 14px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  line-height: 1.5;
  animation: fadeIn 0.2s ease;
}

.test-result.success {
  background: var(--color-study);
  color: var(--color-study-dark);
}

.test-result.error {
  background: var(--priority-high-bg);
  color: var(--priority-high-text);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-light);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.setting-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.setting-input {
  width: 160px;
  padding: 8px 12px;
  font-size: 13px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-color);
  background: var(--bg-input);
}

.setting-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(125, 184, 138, 0.12);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--border-color);
  border-radius: 26px;
  transition: 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.toggle input:checked + .toggle-slider {
  background: var(--accent);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

.setting-btn {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 500;
  transition: all 0.2s;
}

.setting-btn:hover {
  background: var(--bg-hover);
}

.setting-btn.danger {
  color: var(--priority-high-text);
}

.setting-btn.danger:hover {
  background: var(--priority-high-bg);
}

.about-info {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 2;
}

.about-footer {
  color: var(--accent);
  font-weight: 500;
  margin-top: 4px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
