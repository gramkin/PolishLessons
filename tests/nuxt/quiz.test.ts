import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import Quiz from '~/components/content/Quiz.vue'
import { defaultProgress } from '~/utils/progress'

const { patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('usePatterns', () => patternsApi)

const questions = [
  { type: 'choice', q: 'Как по-польски «река»?', options: ['reka', 'rzeka'], answer: 1 },
  { type: 'pattern', q: 'Русское «берег» → по-польски?', pattern: 'rz-р', answer: 'brzeg' },
  {
    type: 'match',
    q: 'Соедините',
    pairs: [
      ['rzeka', 'река'],
      ['brzeg', 'берег'],
    ],
  },
]

const route = '/lessons/02-sounds/01-rz'

beforeEach(() => {
  useProgress().replace(defaultProgress())
})

async function answerAll(wrapper: Awaited<ReturnType<typeof mountSuspended>>, choiceIndex: number) {
  await wrapper.findAll('.quiz-choice input[type="radio"]')[choiceIndex]!.setValue(true)
  await wrapper.find('.quiz-text input').setValue('brzeg')
  await wrapper.find('.quiz-text form, form.quiz-text').trigger('submit')
  await wrapper.find('[data-left="rzeka"]').trigger('click')
  await wrapper.find('[data-right="река"]').trigger('click')
  await wrapper.find('[data-left="brzeg"]').trigger('click')
  await wrapper.find('[data-right="берег"]').trigger('click')
}

describe('Quiz', () => {
  it('gives immediate feedback for a choice question', async () => {
    const wrapper = await mountSuspended(Quiz, { props: { questions }, route })
    await wrapper.findAll('.quiz-choice input[type="radio"]')[1]!.setValue(true)
    expect(wrapper.find('.quiz-choice .quiz-feedback').text()).toContain('Верно!')
    expect(wrapper.findAll('.quiz-choice input:disabled')).toHaveLength(2)
  })

  it('shows the pattern hint and accepts a diacritics-free answer as almost', async () => {
    const almost = [{ type: 'input', q: '«зуб»', answer: 'ząb' }, ...questions.slice(1, 2)]
    const wrapper = await mountSuspended(Quiz, { props: { questions: almost }, route })
    expect(wrapper.findAll('.quiz-hint')).toHaveLength(1)
    expect(wrapper.find('.quiz-hint').text()).toContain('rz ↔ р')

    await wrapper.find('.quiz-text input').setValue('zab')
    await wrapper.find('form.quiz-text').trigger('submit')
    expect(wrapper.find('.quiz-feedback').classes()).toContain('is-almost')
    expect(wrapper.find('.quiz-feedback').text()).toContain('ząb')
  })

  it('checks a match question once all pairs are chosen', async () => {
    const wrapper = await mountSuspended(Quiz, { props: { questions: [questions[2]] }, route })
    await wrapper.find('[data-left="rzeka"]').trigger('click')
    await wrapper.find('[data-right="берег"]').trigger('click')
    await wrapper.find('[data-left="brzeg"]').trigger('click')
    await wrapper.find('[data-right="река"]').trigger('click')
    expect(wrapper.find('.quiz-match .quiz-feedback').classes()).toContain('is-wrong')
  })

  it('summarizes, records the final score and allows a retry', async () => {
    const wrapper = await mountSuspended(Quiz, { props: { questions, final: true }, route })
    expect(wrapper.find('.quiz-summary').exists()).toBe(false)

    await answerAll(wrapper, 0)
    expect(wrapper.find('.quiz-summary').text()).toContain('2 из 3')
    expect(useProgress().progress.value.lessons[route]).toMatchObject({
      completed: false,
      bestScore: 67,
    })

    await wrapper.find('.quiz-summary button').trigger('click')
    expect(wrapper.find('.quiz-summary').exists()).toBe(false)
    expect(wrapper.findAll('.quiz-feedback')).toHaveLength(0)

    await answerAll(wrapper, 1)
    expect(wrapper.find('.quiz-summary').text()).toContain('3 из 3')
    expect(useProgress().progress.value.lessons[route]).toMatchObject({
      completed: true,
      bestScore: 100,
    })
  })

  it('does not record scores for non-final quizzes', async () => {
    const wrapper = await mountSuspended(Quiz, { props: { questions }, route })
    await answerAll(wrapper, 1)
    expect(useProgress().progress.value.lessons[route]).toBeUndefined()
  })

  it('reports invalid questions in dev', async () => {
    const wrapper = await mountSuspended(Quiz, {
      props: { questions: [{ type: 'choice', q: '?', options: ['a'], answer: 0 }] },
      route,
    })
    expect(wrapper.find('section.quiz').exists()).toBe(false)
    if (import.meta.dev) expect(wrapper.find('.quiz-error').exists()).toBe(true)
  })
})
