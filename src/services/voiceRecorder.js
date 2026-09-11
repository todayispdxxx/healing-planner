class VoiceRecorderService {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.isRecording = false
    this.stream = null
  }

  async start(onStart, onStop, onError) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.audioChunks = []
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this._getSupportedMimeType()
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        this.isRecording = false
        const audioBlob = new Blob(this.audioChunks, { type: this._getSupportedMimeType() })
        this.stream?.getTracks().forEach(track => track.stop())
        this.stream = null
        onStop?.(audioBlob)
      }

      this.mediaRecorder.onerror = (event) => {
        this.isRecording = false
        this.stream?.getTracks().forEach(track => track.stop())
        this.stream = null
        onError?.(new Error('录音出错：' + (event.error?.message || '未知错误')))
      }

      this.mediaRecorder.start(1000)
      this.isRecording = true
      onStart?.()
    } catch (e) {
      this.isRecording = false
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        onError?.(new Error('请允许麦克风权限。点击浏览器地址栏左侧图标，将麦克风设为"允许"。'))
      } else if (e.name === 'NotFoundError') {
        onError?.(new Error('未检测到麦克风设备，请确认已连接麦克风。'))
      } else {
        onError?.(new Error('录音启动失败：' + e.message))
      }
    }
  }

  stop() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
    }
  }

  _getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type
    }
    return 'audio/webm'
  }

  getIsRecording() {
    return this.isRecording
  }
}

class STTService {
  async transcribeWithAPI(audioBlob, settings) {
    if (!settings.sttApiEndpoint || !settings.sttApiKey) {
      throw new Error('请先在设置页面配置语音转写 API')
    }

    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')
    formData.append('model', settings.sttApiModel || 'whisper-1')
    formData.append('language', 'zh')

    const response = await fetch(settings.sttApiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.sttApiKey}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`API 请求失败 (${response.status})`)
    }

    const data = await response.json()
    return data.text || data.result || data.transcription || ''
  }

  async transcribeWithBaiduAPI(audioBlob, settings) {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('format', 'webm')
    formData.append('rate', '16000')
    formData.append('channel', '1')
    formData.append('cuid', 'healing-planner')
    formData.append('token', settings.sttApiKey)

    const response = await fetch(settings.sttApiEndpoint, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error(`API 请求失败 (${response.status})`)
    const data = await response.json()
    return data.result?.map(r => r.word || r).join('') || ''
  }
}

export const voiceRecorder = new VoiceRecorderService()
export const sttService = new STTService()