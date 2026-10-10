import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import QuizTranslate from '~/components/quiz/QuizTranslate.vue'
import QuizListen from '~/components/quiz/QuizListen.vue'
import Quiz from '~/components/content/Quiz.vue'
import Drill from '~/components/content/Drill.vue'
import { resetSpeech } from '~/composables/useSpeech'
import { defaultProgress } from '~/utils/progress'

const { patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('usePatterns', () => patternsApi)

const translate = {
  type: 'translate' as const,
  q: 'У меня нет времени.',
  answer: ['Nie mam czasu.', 'Czasu nie mam.'],
  explain: 'nie mam + родительный',
}
const listen = { type: 'listen' as const, q: 'Напишите, что услышите.', text: 'Mam kota.' }

function installVoice() {
  const synth = {
    getVoices: () => [{ lang: 'pl-PL', localService: true }],
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    speak: vi.fn(),
    cancel: vi.fn(),
  }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      lang = ''
      rate = 1
      voice: unknown = null
      onend: (() => void) | null = null
      constructor(public text: string) {}
    },
  )
  return synth
}

async function type(wrapper: Awaited<ReturnType<typeof mountSuspended>>, text: string) {
  await wrapper.find('form input').setValue(text)
  await wrapper.find('form').trigger('submit')
}

beforeAll(() => new Promise((resolve) => setTimeout(resolve, 50)))
beforeEach(() => {
  resetSpeech()
  const { replace, loaded } = useProgress()
  replace(defaultProgress())
  loaded.value = true
})
afterEach(() => vi.unstubAllGlobals())

describe('QuizTranslate', () => {
  it('accepts any listed version straight away', async () => {
    const wrapper = await mountSuspended(QuizTranslate, { props: { question: translate } })
    await type(wrapper, 'czasu nie mam')
    expect(wrapper.emitted('answered')).toEqual([['correct']])
  })

  it('asks the learner to judge an unlisted version against the reference before answering', async () => {
    const wrapper = await mountSuspended(QuizTranslate, { props: { question: translate } })
    await type(wrapper, 'Nie mam wolnego czasu.')
    expect(wrapper.emitted('answered')).toBeUndefined()
    expect(wrapper.find('.quiz-judge').text()).toContain('Nie mam czasu.')

    await wrapper.findAll('.quiz-judge button')[0]!.trigger('click')
    expect(wrapper.emitted('answered')).toEqual([['correct']])
    expect(wrapper.find('.quiz-feedback').text()).toContain('Верно')
  })

  it('records a mistake only when the learner says the version was wrong', async () => {
    const route = '/lessons/06-cases/03-genitive-negation'
    const yes = await mountSuspended(Quiz, { props: { questions: [translate] }, route })
    await type(yes, 'Nie mam chwili.')
    await yes.findAll('.quiz-judge button')[0]!.trigger('click')
    expect(Object.keys(useProgress().progress.value.mistakes)).toEqual([])

    const no = await mountSuspended(Quiz, { props: { questions: [translate] }, route })
    await type(no, 'Nie mam czas.')
    await no.findAll('.quiz-judge button')[1]!.trigger('click')
    expect(
      Object.values(useProgress().progress.value.mistakes).map((m) => m.question.type),
    ).toEqual(['translate'])
  })
})

describe('QuizListen', () => {
  it('plays the hidden text and checks what was typed', async () => {
    const synth = installVoice()
    const wrapper = await mountSuspended(QuizListen, { props: { question: listen } })
    expect(wrapper.text()).not.toContain('Mam kota')
    await wrapper.find('button.play').trigger('click')
    expect(synth.speak.mock.calls[0]?.[0]).toMatchObject({ text: 'Mam kota.' })

    await type(wrapper, 'mam kota')
    expect(wrapper.emitted('answered')).toEqual([['correct']])
  })

  it('offers a skip when there is no voice, and a skip counts neither way', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = await mountSuspended(QuizListen, { props: { question: listen } })
      vi.advanceTimersByTime(1500)
      await wrapper.vm.$nextTick()
      await wrapper.find('.quiz-no-audio button').trigger('click')
      expect(wrapper.emitted('answered')).toEqual([['skipped']])
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('Drill listening mode', () => {
  registerEndpoint('/drills/noun-acc-sg.json', () => ({
    id: 'noun-acc-sg',
    title: 'Винительный падеж',
    instruction: 'В винительный.',
    items: [
      {
        pl: 'Mam ___.',
        answer: 'książkę',
        hint: 'książka',
        ru: 'У меня есть книга.',
        card: 'ksiazka',
      },
      {
        pl: 'Wczoraj w końcu przeczytałem tę bardzo długą ___ do rana.',
        answer: 'książkę',
        hint: 'książka',
        ru: 'Длинное.',
        card: 'ksiazka',
      },
    ],
  }))

  it('dictates whole short sentences from the same pool', async () => {
    installVoice()
    const wrapper = await mountSuspended(Drill, { props: { id: 'noun-acc-sg' } })
    await wrapper.findAll('.drill-start button')[1]!.trigger('click')
    await flushPromises()
    // The 11-word sentence is too long to dictate; only «Mam książkę.» is asked.
    expect(wrapper.findAll('form.quiz-listen')).toHaveLength(1)
    await type(wrapper, 'Mam książkę')
    expect(wrapper.find('.drill-summary').text()).toContain('1 из 1')
  })
})
