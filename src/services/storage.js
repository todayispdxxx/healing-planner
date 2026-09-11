const DB_KEY = 'healing_planner_db'

function getDB() {
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) {
    const initial = {
      tasks: [],
      stickies: [],
      settings: {
        petName: '小团子',
        petType: 'dumpling',
        reminderEnabled: true,
        reminderSound: true,
        apiProvider: '',
        apiEndpoint: '',
        apiKey: '',
        apiModel: '',
        voiceMode: 'webapi',
        sttApiProvider: '',
        sttApiEndpoint: '',
        sttApiKey: '',
        sttApiModel: ''
      },
      petState: {
        mood: 'happy',
        lastMessage: '你好呀，今天也要加油哦~',
        totalCompleted: 0
      }
    }
    localStorage.setItem(DB_KEY, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(raw)
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export const storage = {
  getDB,

  getTasks() {
    return getDB().tasks
  },

  saveTasks(tasks) {
    const db = getDB()
    db.tasks = tasks
    saveDB(db)
  },

  addTask(task) {
    const db = getDB()
    db.tasks.push(task)
    saveDB(db)
    return task
  },

  updateTask(id, updates) {
    const db = getDB()
    const idx = db.tasks.findIndex(t => t.id === id)
    if (idx !== -1) {
      db.tasks[idx] = { ...db.tasks[idx], ...updates }
      saveDB(db)
      return db.tasks[idx]
    }
    return null
  },

  deleteTask(id) {
    const db = getDB()
    db.tasks = db.tasks.filter(t => t.id !== id)
    saveDB(db)
  },

  getStickies() {
    return getDB().stickies
  },

  saveStickies(stickies) {
    const db = getDB()
    db.stickies = stickies
    saveDB(db)
  },

  addSticky(sticky) {
    const db = getDB()
    db.stickies.push(sticky)
    saveDB(db)
    return sticky
  },

  deleteSticky(id) {
    const db = getDB()
    db.stickies = db.stickies.filter(s => s.id !== id)
    saveDB(db)
  },

  updateSticky(id, updates) {
    const db = getDB()
    const idx = db.stickies.findIndex(s => s.id === id)
    if (idx !== -1) {
      db.stickies[idx] = { ...db.stickies[idx], ...updates }
      saveDB(db)
    }
  },

  getSettings() {
    return getDB().settings
  },

  saveSettings(settings) {
    const db = getDB()
    db.settings = { ...db.settings, ...settings }
    saveDB(db)
  },

  getPetState() {
    return getDB().petState
  },

  savePetState(state) {
    const db = getDB()
    db.petState = { ...db.petState, ...state }
    saveDB(db)
  }
}