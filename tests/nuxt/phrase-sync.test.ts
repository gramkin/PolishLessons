import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { usePhraseSync } from '~/composables/usePhraseSync'
import { useProgress } from '~/composables/useProgress'
import { defaultProgress } from '~/utils/progress'

const full =
  'Тома было не узнать: он был гладко выбрит, с приличной причёской, носил сшитый на заказ костюм.'
const pl = 'Tom był nie do poznania.'

registerEndpoint('/dictionary/cards/porzadny.json', () => ({
  card: {
    senses: [
      {
        id: 's',
        ru: 'x',
        examples: [{ pl, ru: full, source: { kind: 'translated', id: 10483258 } }],
      },
    ],
    formExamples: [],
  },
}))

const saved = (id: string, from: string, ru: string) => ({
  id,
  pl,
  ru,
  from,
  form: null,
  box: 3,
  due: '2026-10-12',
  added: '2026-09-25',
})

const Probe = defineComponent({
  setup() {
    usePhraseSync()
    return () => h('div')
  },
})

// The progress plugin loads once in onNuxtReady, on an idle callback; let it land first.
beforeAll(() => new Promise((resolve) => setTimeout(resolve, 50)))

beforeEach(() => {
  const { progress, loaded } = useProgress()
  progress.value = {
    ...defaultProgress(),
    phrases: {
      t10483258: saved(
        't10483258',
        'porzadny',
        'Тома было не узнать: гладко выбрит, в приличном костюме.',
      ),
      t1: saved('t1', 'missing-card', 'старый текст'),
    },
  }
  loaded.value = false
})

describe('usePhraseSync', () => {
  it('waits for progress, then copies the current card text into a stale phrase', async () => {
    const { progress, loaded } = useProgress()
    await mountSuspended(Probe)
    await flushPromises()
    expect(progress.value.phrases.t10483258?.ru).toContain('в приличном костюме')

    loaded.value = true
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 20))
    const phrase = progress.value.phrases.t10483258!
    expect(phrase.ru).toBe(full)
    expect(phrase.box).toBe(3)
    expect(phrase.due).toBe('2026-10-12')
  })

  it('leaves phrases whose card cannot be fetched as they are', async () => {
    const { progress, loaded } = useProgress()
    loaded.value = true
    await mountSuspended(Probe)
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(progress.value.phrases.t1?.ru).toBe('старый текст')
  })
})
