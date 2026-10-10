import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import Drill from '~/components/content/Drill.vue'
import type { DrillFile } from '~/utils/drill'

const { patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('usePatterns', () => patternsApi)

const items = Array.from({ length: 14 }, (_, i) => ({
  pl: `Czytam ___ numer ${i}.`,
  answer: 'książkę',
  hint: 'książka',
  ru: `Я читаю книгу номер ${i}.`,
  card: 'ksiazka',
}))
const file: DrillFile = {
  id: 'noun-acc-sg',
  title: 'Винительный падеж',
  instruction: 'Поставьте существительное в винительный падеж.',
  items,
}
registerEndpoint('/drills/noun-acc-sg.json', () => file)

async function answer(
  wrapper: Awaited<ReturnType<typeof mountSuspended>>,
  index: number,
  text: string,
) {
  const form = wrapper.findAll('form.quiz-text')[index]!
  await form.find('input').setValue(text)
  await form.trigger('submit')
}

describe('Drill', () => {
  it('shows only a start button until clicked', async () => {
    const wrapper = await mountSuspended(Drill, { props: { id: 'noun-acc-sg' } })
    expect(wrapper.text()).toContain('Тренажёр')
    expect(wrapper.findAll('form.quiz-text')).toHaveLength(0)
  })

  it('loads ten sentences, explains each answer and links the card', async () => {
    const wrapper = await mountSuspended(Drill, { props: { id: 'noun-acc-sg' } })
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Винительный падеж')
    expect(wrapper.findAll('form.quiz-text')).toHaveLength(10)
    expect(wrapper.find('label').text()).toMatch(/^Czytam ___ numer \d+\. \(książka\)$/)

    await answer(wrapper, 0, 'książka')
    expect(wrapper.text()).toContain('Правильный ответ: książkę')
    expect(wrapper.text()).toMatch(/Я читаю книгу номер \d+\./)
    expect(wrapper.find('a.drill-card').attributes('href')).toBe('/slovo/ksiazka')
  })

  it('scores a finished round and offers a new one', async () => {
    const wrapper = await mountSuspended(Drill, { props: { id: 'noun-acc-sg' } })
    await wrapper.find('button').trigger('click')
    await flushPromises()
    for (let i = 0; i < 10; i++) await answer(wrapper, i, i < 7 ? 'książkę' : 'nie wiem')
    expect(wrapper.find('.drill-summary').text()).toContain('7 из 10')

    await wrapper.find('.drill-summary button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.drill-summary').exists()).toBe(false)
    expect(wrapper.findAll('form.quiz-text')).toHaveLength(10)
  })

  it('says so when the file cannot be loaded', async () => {
    const wrapper = await mountSuspended(Drill, { props: { id: 'missing' } })
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Не удалось')
  })
})
