const MOCK_RESPONSES = {
  default: {
    tasks: [
      { title: '完成任务', category: '工作', priority: '中', deadline: null, reminderTime: null, status: '未开始' }
    ]
  }
}

function generateMockResponse(text) {
  const segments = text.split(/[，,；;。\n]/).filter(s => s.trim())
  const tasks = segments.map(seg => {
    const trimmed = seg.trim()
    let category = '其他'
    let priority = '中'
    let deadline = null

    if (/学习|复习|背|读|写|作业|论文|考试|英语|单词|练习/.test(trimmed)) category = '学习'
    else if (/报告|PPT|文档|方案|代码|需求|提交|交|做完|完成/.test(trimmed)) category = '工作'
    else if (/会议|开会|组会|讨论|汇报/.test(trimmed)) category = '会议'
    else if (/吃饭|做饭|打扫|健身|运动|休息|睡觉/.test(trimmed)) category = '生活'
    else if (/买|购物|下单|取快递/.test(trimmed)) category = '购物'

    if (/紧急|重要|必须|尽快|务必/.test(trimmed)) priority = '高'
    else if (/有空|顺便|随意|可选/.test(trimmed)) priority = '低'

    if (/明天/.test(trimmed)) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      if (/上午|早上/.test(trimmed)) tomorrow.setHours(10, 0)
      else if (/下午/.test(trimmed)) tomorrow.setHours(14, 0)
      else if (/晚上/.test(trimmed)) tomorrow.setHours(20, 0)
      else tomorrow.setHours(9, 0)
      deadline = tomorrow.toISOString()
    } else if (/后天/.test(trimmed)) {
      const d = new Date()
      d.setDate(d.getDate() + 2)
      d.setHours(9, 0)
      deadline = d.toISOString()
    } else if (/周[一二三四五六日天]/.test(trimmed)) {
      const d = new Date()
      d.setDate(d.getDate() + 3)
      d.setHours(18, 0)
      deadline = d.toISOString()
    } else if (/晚上/.test(trimmed)) {
      const d = new Date()
      d.setHours(20, 0)
      if (d < new Date()) d.setDate(d.getDate() + 1)
      deadline = d.toISOString()
    } else if (/下午/.test(trimmed)) {
      const d = new Date()
      d.setHours(14, 0)
      if (d < new Date()) d.setDate(d.getDate() + 1)
      deadline = d.toISOString()
    }

    let title = trimmed
      .replace(/明天|后天|大后天|周[一二三四五六日天]|上午|下午|晚上|今晚|今天|\d+[点时:：]\d*分?|紧急|重要|必须|尽快/g, '')
      .trim()

    return {
      title: title || trimmed,
      description: trimmed,
      category,
      priority,
      deadline,
      reminderTime: deadline ? new Date(new Date(deadline).getTime() - 3600000).toISOString() : null,
      status: '未开始'
    }
  })

  return { tasks }
}

export function mockAIParse(text) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockResponse(text))
    }, 800 + Math.random() * 600)
  })
}

export function isMockEndpoint(endpoint) {
  return endpoint && (endpoint.includes('mock') || endpoint.includes('localhost:5173/api/mock'))
}