import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import SpeakButton from '~/components/content/SpeakButton.vue'
import { resetSpeech } from '~/composables/useSpeech'
import { packRecordings } from '~/utils/recordings'

registerEndpoint('/dictionary/audio.json', () =>
  packRecordings([
    {
      lemma: 'mąż',
      audio: {
        file: 'Pl-mąż.ogg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Pl-m%C4%85%C5%BC.ogg',
        license: 'CC BY 2.5',
        author: 'Derbeth',
      },
    },
  ]),
)

class FakeAudio {
  static played: FakeAudio[] = []
  static fail = false
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  onplaying: (() => void) | null = null
  constructor(public src?: string) {}
  canPlayType() {
    return 'maybe'
  }
  play() {
    FakeAudio.played.push(this)
    return FakeAudio.fail ? Promise.reject(new Error('blocked')) : Promise.resolve()
  }
  pause() {}
}

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

beforeEach(() => {
  resetSpeech()
  FakeAudio.played = []
  FakeAudio.fail = false
})
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

  describe('with native recordings', () => {
    beforeEach(() => vi.stubGlobal('Audio', FakeAudio))

    it('plays the recording instead of the system voice', async () => {
      const synth = installSpeech([{ lang: 'pl-PL' }])
      const wrapper = await mountSuspended(SpeakButton, { props: { text: 'mąż' } })
      await flushPromises()
      const button = wrapper.find('button')
      expect(button.attributes('title')).toContain('Derbeth, CC BY 2.5')

      await button.trigger('click')
      expect(FakeAudio.played.map((a) => a.src)).toEqual([
        'https://upload.wikimedia.org/wikipedia/commons/7/70/Pl-m%C4%85%C5%BC.ogg',
      ])
      expect(synth.speak).not.toHaveBeenCalled()
    })

    it('falls back to the system voice when the recording will not play', async () => {
      FakeAudio.fail = true
      const synth = installSpeech([{ lang: 'pl-PL' }])
      const wrapper = await mountSuspended(SpeakButton, { props: { text: 'mąż' } })
      await flushPromises()
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect((synth.speak.mock.calls[0]?.[0] as FakeUtterance).text).toBe('mąż')
    })

    it('falls back to the system voice when the recording never starts', async () => {
      const synth = installSpeech([{ lang: 'pl-PL' }])
      const wrapper = await mountSuspended(SpeakButton, { props: { text: 'mąż' } })
      await flushPromises()
      vi.useFakeTimers()
      try {
        await wrapper.find('button').trigger('click')
        expect(synth.speak).not.toHaveBeenCalled()
        vi.advanceTimersByTime(4000)
        expect((synth.speak.mock.calls[0]?.[0] as FakeUtterance).text).toBe('mąż')
      } finally {
        vi.useRealTimers()
      }
    })

    it('keeps the recording once it starts playing', async () => {
      const synth = installSpeech([{ lang: 'pl-PL' }])
      const wrapper = await mountSuspended(SpeakButton, { props: { text: 'mąż' } })
      await flushPromises()
      vi.useFakeTimers()
      try {
        await wrapper.find('button').trigger('click')
        FakeAudio.played[0]?.onplaying?.()
        vi.advanceTimersByTime(4000)
        expect(synth.speak).not.toHaveBeenCalled()
      } finally {
        vi.useRealTimers()
      }
    })

    it('uses the system voice for text without a recording', async () => {
      const synth = installSpeech([{ lang: 'pl-PL' }])
      const wrapper = await mountSuspended(SpeakButton, { props: { text: 'żona' } })
      await flushPromises()
      expect(wrapper.find('button').attributes('title')).toBe('Произнести')
      await wrapper.find('button').trigger('click')
      expect(FakeAudio.played).toHaveLength(0)
      expect(synth.speak).toHaveBeenCalled()
    })

    it('shows the button for a recorded word even without a Polish voice', async () => {
      installSpeech([{ lang: 'en-US' }])
      const wrapper = await mountSuspended(SpeakButton, { props: { text: 'mąż' } })
      await flushPromises()
      expect(wrapper.find('button').exists()).toBe(true)
    })
  })
})
