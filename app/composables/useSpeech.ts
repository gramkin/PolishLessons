import { pickPolishVoice } from '~/utils/speech'

const voice = shallowRef<SpeechSynthesisVoice | null>(null)
const speaking = ref(false)
let initialized = false

function refreshVoice() {
  voice.value = pickPolishVoice(window.speechSynthesis.getVoices())
}

function init() {
  if (initialized || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  initialized = true
  refreshVoice()
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoice)
}

export function resetSpeech() {
  if (initialized && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.removeEventListener('voiceschanged', refreshVoice)
  }
  initialized = false
  voice.value = null
  speaking.value = false
}

export function useSpeech() {
  onMounted(init)

  function speak(text: string) {
    if (!voice.value) return
    const synth = window.speechSynthesis
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pl-PL'
    utterance.rate = 0.9
    utterance.voice = voice.value
    utterance.onend = () => {
      speaking.value = false
    }
    speaking.value = true
    synth.speak(utterance)
  }

  function stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window)
      window.speechSynthesis.cancel()
    speaking.value = false
  }

  return { supported: computed(() => voice.value !== null), speaking, speak, stop }
}
