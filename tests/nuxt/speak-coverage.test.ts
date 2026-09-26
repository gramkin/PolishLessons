import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Related from '~/components/dictionary/Related.vue'
import PhraseList from '~/components/PhraseList.vue'
import { resetSpeech } from '~/composables/useSpeech'
import { cardSchema } from '../../shared/dictionary'

class FakeUtterance {
  lang = ''
  rate = 1
  voice: unknown = null
  constructor(public text: string) {}
}

function installSpeech() {
  vi.stubGlobal('speechSynthesis', {
    getVoices: () => [{ lang: 'pl-PL', localService: true }],
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    speak: vi.fn(),
    cancel: vi.fn(),
  })
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
}

const card = cardSchema.parse({
  id: 'dokad',
  format: 2,
  lemma: 'dokąd',
  rank: 900,
  pos: 'adv',
  pron: { cyr: 'до́конт' },
  senses: [
    {
      id: 'where',
      ru: 'куда',
      examples: [{ pl: 'Dokąd idziesz?', ru: 'Куда ты идёшь?', source: { kind: 'authored' } }],
    },
  ],
  collocations: [
    { pl: 'dokąd idziesz?', ru: 'куда ты идёшь?' },
    { pl: 'nie wiem dokąd', ru: 'не знаю куда' },
  ],
  // The first two repeat collocations, as they do on 93% of real cards.
  idioms: [
    { pl: 'dokąd idziesz?', ru: 'куда ты идёшь?' },
    { pl: 'nie wiem dokąd', ru: 'не знаю куда' },
    { pl: 'dokąd oczy poniosą', ru: 'куда глаза глядят' },
  ],
  family: [{ pl: 'skąd', ru: 'откуда', relation: 'root', id: null }],
  synonyms: ['gdzie'],
})

beforeEach(() => {
  resetSpeech()
  installSpeech()
})
afterEach(() => vi.unstubAllGlobals())

describe('listen buttons on Polish surfaces', () => {
  it('gives every collocation and idiom a listen button', async () => {
    const wrapper = await mountSuspended(Related, {
      props: { card, aspectPair: null, familyIds: [] },
    })
    const items = wrapper.findAll('#sochetaniya li')
    expect(items).toHaveLength(3)
    for (const item of items) {
      expect(item.find('button.speak-button').exists()).toBe(true)
    }
    expect(wrapper.find('#sochetaniya button.speak-button').attributes('aria-label')).toBe(
      'Произнести: dokąd idziesz?',
    )
  })

  it('lists a phrase once when it is both a collocation and an idiom', async () => {
    const wrapper = await mountSuspended(Related, {
      props: { card, aspectPair: null, familyIds: [] },
    })
    const texts = wrapper.findAll('#sochetaniya li').map((li) => li.text())
    expect(texts.filter((t) => t.includes('dokąd idziesz?'))).toHaveLength(1)
    expect(texts.filter((t) => t.includes('nie wiem dokąd'))).toHaveLength(1)
    expect(texts.some((t) => t.includes('dokąd oczy poniosą'))).toBe(true)
    // The surviving copy keeps the plain collocation styling, not the idiom italics.
    expect(wrapper.findAll('#sochetaniya li.idiom')).toHaveLength(1)
  })

  it('speaks related words and synonyms too', async () => {
    const wrapper = await mountSuspended(Related, {
      props: { card, aspectPair: null, familyIds: [] },
    })
    expect(wrapper.find('#rodstvennye li button.speak-button').attributes('aria-label')).toBe(
      'Произнести: skąd',
    )
    expect(wrapper.find('p.lexicon button.speak-button').attributes('aria-label')).toBe(
      'Произнести: gdzie',
    )
  })

  it('gives a saved phrase a listen button without disturbing its link', async () => {
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
    ]
    const wrapper = await mountSuspended(PhraseList, { props: { phrases } })
    expect(wrapper.find('button.speak-button').attributes('aria-label')).toBe(
      'Произнести: Zrobię to.',
    )
    expect(wrapper.find('a').attributes('href')).toBe('/slovo/zrobic')
  })
})
