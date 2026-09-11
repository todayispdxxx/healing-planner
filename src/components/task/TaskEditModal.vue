<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEdit ? '✏️ 编辑任务' : '✨ 新建任务' }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">任务标题</label>
          <input v-model="form.title" placeholder="输入任务标题..." class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">任务描述</label>
          <textarea v-model="form.description" rows="2" placeholder="任务描述（可选）" class="form-textarea"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">截止时间</label>
            <input type="datetime-local" v-model="form.deadline" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">提醒时间</label>
            <input type="datetime-local" v-model="form.reminderTime" class="form-input" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">类别</label>
            <div class="chip-group">
              <button
                v-for="cat in categories"
                :key="cat"
                class="chip"
                :class="[`chip-${cat}`, { active: form.category === cat }]"
                @click="form.category = cat"
              >{{ cat }}</button>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">优先级</label>
            <div class="chip-group">
              <button class="chip pri-chip" :class="{ active: form.priority === '高', 'pri-high': form.priority === '高' }" @click="form.priority = '高'">🔴 高</button>
              <button class="chip pri-chip" :class="{ active: form.priority === '中', 'pri-medium': form.priority === '中' }" @click="form.priority = '中'">🟡 中</button>
              <button class="chip pri-chip" :class="{ active: form.priority === '低', 'pri-low': form.priority === '低' }" @click="form.priority = '低'">🟢 低</button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">状态</label>
            <select v-model="form.status" class="form-input">
              <option value="未开始">未开始</option>
              <option value="进行中">进行中</option>
              <option value="已完成">已完成</option>
              <option value="已延期">已延期</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">取消</button>
        <button class="btn-save" @click="handleSave">
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  task: { type: Object, default: null },
  isEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

const categories = ['学习', '工作', '会议', '生活', '购物', '长期计划', '其他']

const form = reactive({
  title: '',
  description: '',
  deadline: '',
  reminderTime: '',
  category: '其他',
  priority: '中',
  status: '未开始'
})

watch(() => props.task, (val) => {
  if (val) {
    form.title = val.title || ''
    form.description = val.description || ''
    form.deadline = val.deadline ? formatForInput(val.deadline) : ''
    form.reminderTime = val.reminderTime ? formatForInput(val.reminderTime) : ''
    form.category = val.category || '其他'
    form.priority = val.priority || '中'
    form.status = val.status || '未开始'
  }
}, { immediate: true })

function formatForInput(dateStr) {
  const d = new Date(dateStr)
  return d.toISOString().slice(0, 16)
}

function handleSave() {
  const data = { ...form }
  if (data.deadline) data.deadline = new Date(data.deadline).toISOString()
  if (data.reminderTime) data.reminderTime = new Date(data.reminderTime).toISOString()
  else data.reminderTime = null
  emit('save', data)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(93, 78, 55, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(6px);
}

.modal-content {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  width: 540px;
  max-width: 90vw;
  box-shadow: var(--shadow-elevated);
  overflow: hidden;
  animation: fadeInUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 28px 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 20px 28px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-color);
  background: var(--bg-input);
  color: var(--text-primary);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.form-input:focus, .form-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(125, 184, 138, 0.15);
}

.form-row {
  display: flex;
  gap: 14px;
}

.form-row .form-group {
  flex: 1;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all 0.2s;
  border: 1.5px solid transparent;
}

.chip:hover {
  background: var(--bg-hover);
}

.chip.active {
  border-color: var(--accent);
  background: rgba(125, 184, 138, 0.1);
  color: var(--accent);
}

.chip-学习.active { border-color: var(--color-study-text); background: var(--color-study); color: var(--color-study-dark); }
.chip-工作.active { border-color: var(--color-work-text); background: var(--color-work); color: var(--color-work-dark); }
.chip-会议.active { border-color: var(--color-meeting-text); background: var(--color-meeting); color: var(--color-meeting-dark); }
.chip-生活.active { border-color: var(--color-life-text); background: var(--color-life); color: var(--color-life-dark); }
.chip-购物.active { border-color: var(--color-shopping-text); background: var(--color-shopping); color: var(--color-shopping-dark); }
.chip-长期计划.active { border-color: var(--color-longterm-text); background: var(--color-longterm); color: var(--color-longterm-dark); }

.pri-chip.pri-high.active { border-color: var(--priority-high-text); background: var(--priority-high-bg); color: var(--priority-high-text); }
.pri-chip.pri-medium.active { border-color: var(--priority-medium-text); background: var(--priority-medium-bg); color: var(--priority-medium-text); }
.pri-chip.pri-low.active { border-color: var(--priority-low-text); background: var(--priority-low-bg); color: var(--priority-low-text); }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 28px 22px;
  border-top: 1px solid var(--border-light);
}

.btn-cancel {
  padding: 9px 22px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--bg-hover);
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 24px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: var(--accent);
  color: white;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(125, 184, 138, 0.3);
}

.btn-save:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
