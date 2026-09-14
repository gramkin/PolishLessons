import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpeakButton from '~/components/content/SpeakButton.vue'
import { resetSpeech } from '~/composables/useSpeech'

class FakeUtterance {
  lang = ''
  rate = 1
  voice: unknown = null
  onend: (() => void) | null = null
  constructor(public text: string) {}
}

function installSpeech(voices: { lang: string; localService?: boolean }[]) {
  const synth = {
    getVoices: () => voices,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    speak: vi.fn(),
    cancel: vi.fn(),
  }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  return synth
}

beforeEach(() => resetSpeech())
afterEach(() => vi.unstubAllGlobals())

describe('SpeakButton', () => {
  it('renders nothing without a Polish voice', async () => {
    installSpeech([{ lang: 'en-US' }])
    const wrapper = await mountSuspended(SpeakButton, { props: { text: 'rzeka' } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('speaks Polish text at rate 0.9', async () => {
    const synth = installSpeech([{ lang: 'pl-PL', localService: true }])
    const wrapper = await mountSuspended(SpeakButton, { props: { text: 'rzeka' } })
    const button = wrapper.find('button')
    expect(button.attributes('aria-label')).toBe('Произнести: rzeka')

    await button.trigger('click')
    expect(synth.cancel).toHaveBeenCalled()
    const utterance = synth.speak.mock.calls[0]?.[0] as FakeUtterance
    expect(utterance.text).toBe('rzeka')
    expect(utterance.lang).toBe('pl-PL')
    expect(utterance.rate).toBe(0.9)
  })

  it('uses a custom label', async () => {
    installSpeech([{ lang: 'pl-PL' }])
    const wrapper = await mountSuspended(SpeakButton, {
      props: { text: 'Kot i mysz', label: 'Читать вслух' },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Читать вслух')
  })
})
