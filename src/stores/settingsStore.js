import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '../services/storage'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(storage.getSettings())

  function _save() {
    storage.saveSettings(settings.value)
  }

  function updateSettings(updates) {
    settings.value = { ...settings.value, ...updates }
    _save()
  }

  return {
    settings,
    updateSettings
  }
})