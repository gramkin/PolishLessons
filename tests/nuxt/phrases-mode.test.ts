import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PhraseList from '~/components/PhraseList.vue'
import FlashcardSession from '~/components/FlashcardSession.vue'

const phrases = [
  {
    id: 't1',
    pl: 'Zrobię to.',
    ru: 'Я сделаю это.',
    from: 'zrobic',
    form: 'zrobię',
    box: 1,
    due: '2026-09-21',
    added: '2026-09-21',
  },
  {
    id: 'a2',
    pl: 'Zrób kawy.',
    ru: 'Сделай кофе.',
    from: 'zrobic',
    form: 'zrób',
    box: 2,
    due: '2026-09-22',
    added: '2026-09-21',
  },
]

describe('phrases mode', () => {
  it('lists saved phrases with a link back to the word and a remove button', async () => {
    const wrapper = await mountSuspended(PhraseList, { props: { phrases } })
    expect(wrapper.find('summary').text()).toBe('Сохранённые фразы (2)')
    expect(wrapper.text()).toContain('Zrobię to.')
    expect(wrapper.text()).toContain('Сделай кофе.')
    expect(wrapper.find('a').attributes('href')).toBe('/slovo/zrobic')
    await wrapper.findAll('button.remove')[0]!.trigger('click')
    expect(wrapper.emitted('remove')?.[0]).toEqual(['t1'])
  })

  it('flips a phrase card and reviews it by id', async () => {
    const wrapper = await mountSuspended(FlashcardSession, {
      props: {
        phrases: phrases.map(({ id, pl, ru, from }) => ({ id, pl, ru, from })),
        direction: 'pl-ru',
      },
    })
    expect(wrapper.text()).toContain('Zrobię to.')
    expect(wrapper.text()).not.toContain('Я сделаю это.')
    await wrapper.find('button.flip').trigger('click')
    expect(wrapper.text()).toContain('Я сделаю это.')
    await wrapper.find('button.remember').trigger('click')
    expect(wrapper.emitted('review')?.[0]).toEqual(['t1', true])
    expect(wrapper.text()).toContain('Zrób kawy.')
  })
})
