import { pickPolishVoice } from '~/utils/speech'
import { findRecording, type Recording, type RecordingsFile } from '~/utils/recordings'

const voice = shallowRef<SpeechSynthesisVoice | null>(null)
// Native-speaker recordings beat any system voice, so a recorded word plays its file.
const recordings = shallowRef<RecordingsFile | null>(null)
const speaking = ref(false)
let initialized = false
let player: HTMLAudioElement | null = null
const RECORDING_START_TIMEOUT_MS = 4000

function refreshVoice() {
  voice.value = pickPolishVoice(window.speechSynthesis.getVoices())
}

function canPlayOgg(): boolean {
  return typeof Audio !== 'undefined' && new Audio().canPlayType('audio/ogg') !== ''
}

function init(baseURL: string) {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  if ('speechSynthesis' in window) {
    refreshVoice()
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoice)
  }
  if (canPlayOgg()) {
    $fetch<RecordingsFile>(`${baseURL.replace(/\/$/, '')}/dictionary/audio.json`)
      .then((file) => {
        recordings.value = file
      })
      .catch(() => {})
  }
}

function stopPlayback() {
  if (player) {
    player.onended = player.onerror = player.onplaying = null
    player.pause()
    player = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
  speaking.value = false
}

export function resetSpeech() {
  stopPlayback()
  if (initialized && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.removeEventListener('voiceschanged', refreshVoice)
  }
  initialized = false
  voice.value = null
  recordings.value = null
}

function recordingFor(text: string): Recording | null {
  return recordings.value ? findRecording(recordings.value, text) : null
}

function speakWithVoice(text: string) {
  if (!voice.value) {
    speaking.value = false
    return
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pl-PL'
  utterance.rate = 0.9
  utterance.voice = voice.value
  utterance.onend = () => {
    speaking.value = false
  }
  speaking.value = true
  window.speechSynthesis.speak(utterance)
}

function playRecording(recording: Recording, text: string) {
  const audio = new Audio(recording.url)
  player = audio
  // A recording that cannot load (offline, blocked, too slow) falls back to the system voice.
  const fallback = () => {
    clearTimeout(stalled)
    if (player !== audio) return
    audio.pause()
    player = null
    speakWithVoice(text)
  }
  const stalled = setTimeout(fallback, RECORDING_START_TIMEOUT_MS)
  audio.onplaying = () => clearTimeout(stalled)
  audio.onended = () => {
    clearTimeout(stalled)
    if (player === audio) player = null
    speaking.value = false
  }
  audio.onerror = fallback
  speaking.value = true
  audio.play().catch(fallback)
}

export function useSpeech() {
  const { app } = useRuntimeConfig()
  onMounted(() => init(app.baseURL))

  function speak(text: string) {
    stopPlayback()
    const recording = recordingFor(text)
    if (recording) playRecording(recording, text)
    else speakWithVoice(text)
  }

  return {
    supported: computed(() => voice.value !== null),
    speaking,
    speak,
    stop: stopPlayback,
    recordingFor,
  }
}
