class VoiceInputService {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.supported = false

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.lang = 'zh-CN'
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.maxAlternatives = 1
      this.supported = true
    }
  }

  start(onResult, onEnd, onError) {
    if (!this.supported) {
      onError?.(new Error('当前浏览器不支持语音识别，请使用 Chrome 浏览器'))
      return
    }

    if (this.isListening) return

    this.isListening = true
    let finalTranscript = ''

    this.recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interim += transcript
        }
      }
      onResult?.({
        final: finalTranscript,
        interim: interim,
        all: finalTranscript + interim
      })
    }

    this.recognition.onend = () => {
      this.isListening = false
      onEnd?.(finalTranscript)
    }

    this.recognition.onerror = (event) => {
      this.isListening = false
      let msg = '语音识别出错'
      if (event.error === 'not-allowed') msg = '请允许麦克风权限'
      else if (event.error === 'no-speech') msg = '没有检测到语音，请再试一次'
      else if (event.error === 'network') msg = '网络错误，请检查网络连接'
      onError?.(new Error(msg))
    }

    try {
      this.recognition.start()
    } catch (e) {
      this.isListening = false
      onError?.(e)
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  getIsListening() {
    return this.isListening
  }
}

export const voiceInput = new VoiceInputService()