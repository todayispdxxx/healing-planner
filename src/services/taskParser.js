function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

const CATEGORY_KEYWORDS = {
  '学习': ['学习', '复习', '背', '读', '写', '作业', '论文', '考试', '预习', '笔记', '英语', '数学', '单词', '课程', '练习', '刷题'],
  '工作': ['工作', '报告', 'PPT', '文档', '方案', '代码', '需求', '上线', '部署', '测试', '提交', '交', '做完', '完成', '整理'],
  '会议': ['会议', '开会', '组会', '讨论', '汇报', '面试', '答辩', '见面'],
  '生活': ['生活', '吃饭', '做饭', '打扫', '洗', '健身', '运动', '散步', '休息', '睡觉', '起床', '洗澡', '理发'],
  '购物': ['买', '购物', '下单', '取快递', '超市', '商场'],
  '长期计划': ['计划', '目标', '养成', '坚持', '每天', '每周', '每月']
}

const PRIORITY_KEYWORDS = {
  '高': ['紧急', '重要', '必须', '尽快', '赶紧', '立刻', '马上', '务必', '一定'],
  '低': ['有空', '顺便', '随意', '可选', '尽量']
}

const TIME_PATTERNS = [
  { pattern: /明天上午(\d+)[点时:：](\d+)?分?/, handler: (m, now) => getNextDayTime(now, parseInt(m[1]), m[2] ? parseInt(m[2]) : 0) },
  { pattern: /明天下午(\d+)[点时:：](\d+)?分?/, handler: (m, now) => getNextDayTime(now, parseInt(m[1]) + 12, m[2] ? parseInt(m[2]) : 0) },
  { pattern: /明天晚上(\d+)[点时:：](\d+)?分?/, handler: (m, now) => getNextDayTime(now, parseInt(m[1]) + 12, m[2] ? parseInt(m[2]) : 0) },
  { pattern: /明天上午/, handler: (m, now) => getNextDayTime(now, 10, 0) },
  { pattern: /明天下午/, handler: (m, now) => getNextDayTime(now, 14, 0) },
  { pattern: /明天晚上/, handler: (m, now) => getNextDayTime(now, 20, 0) },
  { pattern: /明天/, handler: (m, now) => getNextDayTime(now, 9, 0) },
  { pattern: /后天/, handler: (m, now) => getDayAfterTomorrowTime(now, 9, 0) },
  { pattern: /大后天/, handler: (m, now) => getDaysLaterTime(now, 3, 9, 0) },
  { pattern: /(\d+)天后/, handler: (m, now) => getDaysLaterTime(now, parseInt(m[1]), 9, 0) },
  { pattern: /周([一二三四五六日天])/, handler: (m, now) => getNextWeekdayTime(now, m[1]) },
  { pattern: /本周([一二三四五六日天])/, handler: (m, now) => getThisWeekdayTime(now, m[1]) },
  { pattern: /下周一/, handler: (m, now) => getNextWeekdayTime(now, '一') },
  { pattern: /下周五/, handler: (m, now) => getNextWeekdayTime(now, '五') },
  { pattern: /周五?前/, handler: (m, now) => getThisWeekdayTime(now, '五') },
  { pattern: /周([一二三四五六日天])前/, handler: (m, now) => getThisWeekdayTime(now, m[1]) },
  { pattern: /上午(\d+)[点时:：](\d+)?分?/, handler: (m, now) => getTodayTime(now, parseInt(m[1]), m[2] ? parseInt(m[2]) : 0) },
  { pattern: /下午(\d+)[点时:：](\d+)?分?/, handler: (m, now) => getTodayTime(now, parseInt(m[1]) + 12, m[2] ? parseInt(m[2]) : 0) },
  { pattern: /晚上(\d+)[点时:：](\d+)?分?/, handler: (m, now) => getTodayTime(now, parseInt(m[1]) + 12, m[2] ? parseInt(m[2]) : 0) },
  { pattern: /(\d+)[点时:：](\d+)?分?/, handler: (m, now) => getTodayTime(now, parseInt(m[1]), m[2] ? parseInt(m[2]) : 0) },
  { pattern: /上午/, handler: (m, now) => getTodayTime(now, 10, 0) },
  { pattern: /下午/, handler: (m, now) => getTodayTime(now, 14, 0) },
  { pattern: /晚上/, handler: (m, now) => getTodayTime(now, 20, 0) },
  { pattern: /今天/, handler: (m, now) => getTodayTime(now, 9, 0) },
  { pattern: /今晚/, handler: (m, now) => getTodayTime(now, 20, 0) },
]

function getNextDayTime(now, hour, minute) {
  const d = new Date(now)
  d.setDate(d.getDate() + 1)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function getDayAfterTomorrowTime(now, hour, minute) {
  const d = new Date(now)
  d.setDate(d.getDate() + 2)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function getDaysLaterTime(now, days, hour, minute) {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function getTodayTime(now, hour, minute) {
  const d = new Date(now)
  d.setHours(hour, minute, 0, 0)
  if (d < now) d.setDate(d.getDate() + 1)
  return d.toISOString()
}

const WEEKDAY_MAP = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 }

function getNextWeekdayTime(now, weekday) {
  const target = WEEKDAY_MAP[weekday]
  const d = new Date(now)
  d.setHours(9, 0, 0, 0)
  const current = d.getDay()
  let diff = target - current
  if (diff <= 0) diff += 7
  d.setDate(d.getDate() + diff)
  return d.toISOString()
}

function getThisWeekdayTime(now, weekday) {
  const target = WEEKDAY_MAP[weekday]
  const d = new Date(now)
  d.setHours(18, 0, 0, 0)
  const current = d.getDay()
  let diff = target - current
  if (diff < 0) diff += 7
  if (diff === 0 && d < now) diff = 7
  d.setDate(d.getDate() + diff)
  return d.toISOString()
}

function extractTime(text) {
  const now = new Date()
  for (const { pattern, handler } of TIME_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      return handler(match, now)
    }
  }
  return null
}

function detectCategory(text) {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return category
    }
  }
  return '其他'
}

function detectPriority(text) {
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return priority
    }
  }
  return '中'
}

function splitTasks(text) {
  const separators = /[，,；;。\n]/
  const parts = text.split(separators).filter(p => p.trim().length > 0)
  return parts.map(p => p.trim())
}

function calculateReminderTime(deadline, category) {
  if (!deadline) return null
  const d = new Date(deadline)
  if (category === '会议') {
    return new Date(d.getTime() - 30 * 60 * 1000).toISOString()
  }
  if (category === '工作' || category === '学习') {
    return new Date(d.getTime() - 24 * 60 * 60 * 1000).toISOString()
  }
  return new Date(d.getTime() - 60 * 60 * 1000).toISOString()
}

export function parseNaturalLanguage(input) {
  const parts = splitTasks(input)
  return parts.map(part => {
    const deadline = extractTime(part)
    const category = detectCategory(part)
    const priority = detectPriority(part)
    const reminderTime = calculateReminderTime(deadline, category)

    let title = part
    const timePatterns = /明天|后天|大后天|周[一二三四五六日天]|本周|下周|上午|下午|晚上|今晚|今天|\d+天后|\d+[点时:：]\d*分?/
    title = title.replace(timePatterns, '').trim()
    title = title.replace(/^[的了吗呢吧啊呀哦]+/, '').trim()

    return {
      id: generateId(),
      title: title || part,
      description: part,
      deadline: deadline,
      reminderTime: reminderTime,
      category: category,
      priority: priority,
      status: '未开始',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  })
}

export function smartParse(input) {
  return parseNaturalLanguage(input)
}

export { detectCategory, detectPriority, extractTime, calculateReminderTime }