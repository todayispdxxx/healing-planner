<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="quick-add-modal">
      <div class="modal-header">
        <h3 class="modal-title">✨ 快速添加任务</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <input
          v-model="title"
          class="quick-input"
          placeholder="输入任务名称..."
          ref="inputRef"
          @keydown.enter="handleAdd"
          autofocus
        />
        <div class="quick-options">
          <div class="option-group">
            <label class="option-label">类别</label>
            <div class="option-chips">
              <button
                v-for="cat in categories"
                :key="cat"
                class="chip"
                :class="{ active: category === cat, [`chip-${cat}`]: true }"
                @click="category = cat"
              >{{ cat }}</button>
            </div>
          </div>
          <div class="option-group">
            <label class="option-label">优先级</label>
            <div class="option-chips">
              <button class="chip" :class="{ active: priority === '高' }" @click="priority = '高'">🔴 高</button>
              <button class="chip" :class="{ active: priority === '中' }" @click="priority = '中'">🟡 中</button>
              <button class="chip" :class="{ active: priority === '低' }" @click="priority = '低'">🟢 低</button>
            </div>
          </div>
          <div class="option-row">
            <div class="option-field">
              <label class="option-label">截止时间</label>
              <input type="datetime-local" v-model="deadline" class="field-input" />
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">取消</button>
        <button class="btn-add" @click="handleAdd" :disabled="!title.trim()">添加任务</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const emit = defineEmits(['close', 'add'])

const title = ref('')
const category = ref('其他')
const priority = ref('中')
const deadline = ref('')
const inputRef = ref(null)

const categories = ['学习', '工作', '会议', '生活', '购物', '长期计划', '其他']

onMounted(async () => {
  await nextTick()
  inputRef.value?.focus()
})

function handleAdd() {
  if (!title.value.trim()) return
  emit('add', {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
    title: title.value.trim(),
    description: title.value.trim(),
    deadline: deadline.value ? new Date(deadline.value).toISOString() : null,
    reminderTime: deadline.value ? new Date(new Date(deadline.value).getTime() - 3600000).toISOString() : null,
    category: category.value,
    priority: priority.value,
    status: '未开始',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(93, 78, 55, 0.15);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.quick-add-modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  width: 460px;
  max-width: 90vw;
  box-shadow: var(--shadow-elevated);
  overflow: hidden;
  animation: fadeInUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 24px 0;
}

.modal-title {
  font-size: 17px;
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
  padding: 20px 24px;
}

.quick-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-input);
  margin-bottom: 18px;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.quick-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(125, 184, 138, 0.15);
}

.quick-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.03em;
}

.option-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 5px 14px;
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

.option-row {
  display: flex;
  gap: 12px;
}

.option-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-input {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-color);
  background: var(--bg-input);
}

.field-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(125, 184, 138, 0.15);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 22px;
  border-top: 1px solid var(--border-light);
}

.btn-cancel {
  padding: 9px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--bg-hover);
}

.btn-add {
  padding: 9px 24px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: var(--accent);
  color: white;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(125, 184, 138, 0.3);
}

.btn-add:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
