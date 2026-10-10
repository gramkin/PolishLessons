import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import Quiz from '~/components/content/Quiz.vue'
import Drill from '~/components/content/Drill.vue'
import MistakeSession from '~/components/MistakeSession.vue'
import { defaultProgress } from '~/utils/progress'
import { recordMistake, type Mistake } from '~/utils/mistakes'

const { patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('usePatterns', () => patternsApi)

const route = '/lessons/06-cases/01-accusative'
const questions = [
  { type: 'choice', q: 'Lubię ___. (herbata)', options: ['herbata', 'herbatę'], answer: 1 },
  { type: 'input', q: 'Czytam ___. (gazeta)', answer: 'gazetę' },
  {
    type: 'match',
    q: 'Соедините',
    pairs: [
      ['pies', 'psa'],
      ['okno', 'okno'],
    ],
  },
]

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
  ],
}))

// The progress plugin loads once in onNuxtReady, on an idle callback; let it land first.
beforeAll(() => new Promise((resolve) => setTimeout(resolve, 50)))

beforeEach(() => {
  const { replace, loaded } = useProgress()
  replace(defaultProgress())
  loaded.value = true
})

const mistakes = () => Object.values(useProgress().progress.value.mistakes)

describe('recording mistakes', () => {
  it('keeps a wrong choice and a wrong typed answer from a lesson quiz, but not a match', async () => {
    const wrapper = await mountSuspended(Quiz, { props: { questions }, route })
    await wrapper.findAll('.quiz-choice input[type="radio"]')[0]!.setValue(true)
    await wrapper.find('.quiz-text input').setValue('gazeta')
    await wrapper.find('form.quiz-text').trigger('submit')
    await wrapper.find('[data-left="pies"]').trigger('click')
    await wrapper.find('[data-right="okno"]').trigger('click')
    await wrapper.find('[data-left="okno"]').trigger('click')
    await wrapper.find('[data-right="psa"]').trigger('click')

    expect(
      mistakes()
        .map((m) => m.question.q)
        .sort(),
    ).toEqual(['Czytam ___. (gazeta)', 'Lubię ___. (herbata)'])
    expect(mistakes()[0]!.source).toMatchObject({ kind: 'lesson', path: route })
  })

  it('keeps nothing for right or almost-right answers', async () => {
    const wrapper = await mountSuspended(Quiz, {
      props: { questions: questions.slice(0, 2) },
      route,
    })
    await wrapper.findAll('.quiz-choice input[type="radio"]')[1]!.setValue(true)
    await wrapper.find('.quiz-text input').setValue('gazete')
    await wrapper.find('form.quiz-text').trigger('submit')
    expect(mistakes()).toEqual([])
  })

  it('does not record before saved progress has loaded', async () => {
    useProgress().loaded.value = false
    const wrapper = await mountSuspended(Quiz, {
      props: { questions: questions.slice(1, 2) },
      route,
    })
    await wrapper.find('.quiz-text input').setValue('nie wiem')
    await wrapper.find('form.quiz-text').trigger('submit')
    expect(mistakes()).toEqual([])
  })

  it('keeps a wrong drill answer with the word card it came from', async () => {
    const wrapper = await mountSuspended(Drill, { props: { id: 'noun-acc-sg' }, route })
    await wrapper.find('button').trigger('click')
    await flushPromises()
    await wrapper.find('form.quiz-text input').setValue('książka')
    await wrapper.find('form.quiz-text').trigger('submit')
    const [mistake] = mistakes()
    expect(mistake?.question).toMatchObject({
      type: 'input',
      q: 'Mam ___. (książka)',
      answer: 'książkę',
    })
    expect(mistake?.source).toMatchObject({ kind: 'drill', path: route, card: 'ksiazka' })
  })
})

describe('MistakeSession', () => {
  const items: Mistake[] = Object.values(
    recordMistake(
      {},
      { type: 'input', q: 'Czytam ___. (gazeta)', answer: 'gazetę', explain: 'ж. р.: -ę' },
      { kind: 'lesson', path: route, title: '6.1 Винительный падеж' },
      new Date(2026, 9, 1),
    ),
  )

  it('asks the question again, reports the result and links where it came from', async () => {
    const wrapper = await mountSuspended(MistakeSession, { props: { items } })
    await wrapper.find('.quiz-text input').setValue('gazetę')
    await wrapper.find('form.quiz-text').trigger('submit')
    expect(wrapper.emitted('review')).toEqual([[items[0]!.id, true]])
    expect(wrapper.find('.mistake-source a').attributes('href')).toBe(route)
    expect(wrapper.find('.mistake-summary').text()).toContain('1 из 1')

    await wrapper.find('.mistake-summary button').trigger('click')
    expect(wrapper.emitted('finish')).toEqual([[{ remembered: 1, forgotten: 0 }]])
  })
})
