import { describe, expect, it } from 'vitest'
import {
  buildFormsFile,
  referencedTatoebaIds,
  stableJson,
} from '../../scripts/dictionary/lib/build'
import type { Draft } from '../../scripts/dictionary/lib/draft'
import {
  buildIndex,
  buildPublishedCard,
  glossOf,
  mergeIndex,
  partialPublishBlocker,
} from '../../scripts/dictionary/lib/publish'
import { cardSchema, formsFileSchema, type Card } from '../../shared/dictionary'

const card: Card = cardSchema.parse({
  id: 'dom',
  format: 1,
  lemma: 'dom',
  rank: 120,
  pos: 'noun',
  pron: { cyr: 'дом' },
  senses: [
    {
      id: 'house',
      ru: 'дом, здание',
      examples: [
        {
          pl: 'Mój dom jest duży.',
          ru: 'Мой дом большой.',
          source: { kind: 'tatoeba', id: 348760 },
        },
        {
          pl: 'Spójrz na dom z czerwonym dachem.',
          ru: 'Посмотри на дом с красной крышей.',
          source: { kind: 'translated', id: 348626 },
        },
        { pl: 'To jest nasz dom.', ru: 'Это наш дом.', source: { kind: 'authored' } },
      ],
    },
    {
      id: 'home',
      ru: 'дом, родной очаг',
      examples: [
        { pl: 'Wracam do domu.', ru: 'Я возвращаюсь домой.', source: { kind: 'authored' } },
      ],
    },
  ],
})

const draft = {
  id: 'dom',
  lemma: 'dom',
  rank: 120,
  pos: 'noun',
  override: false,
  aspect: null,
  grammarLabel: 'мужской род, неодушевлённый',
  ipa: 'dɔm',
  audioFile: 'Pl-dom.ogg',
  allForms: ['dom', 'domu'],
  tables: [],
  mismatches: [],
  wiktionary: { found: true, senses: [], translationsRu: [], related: [] },
  candidates: [],
} satisfies Draft

const sentences = new Map([
  [348760, { id: 348760, pl: 'Mój dom jest duży.', ru: 'Мой дом большой.' }],
  [348626, { id: 348626, pl: 'Spójrz na dom z czerwonym dachem.', ru: null }],
])
const versions = { polimorf: '0.6.7', wiktionary: 'sha256:aaaa', tatoeba: 'sha256:bbbb' }
const audio = {
  file: 'Pl-dom.ogg',
  url: 'https://upload.wikimedia.org/x.ogg',
  license: 'Public domain',
  author: 'tsca',
}

describe('buildFormsFile', () => {
  it('collects referenced Tatoeba ids', () => {
    expect(referencedTatoebaIds(card)).toEqual([348626, 348760])
  })

  it('collects ids from form examples too', () => {
    const withForms: Card = {
      ...card,
      formExamples: [
        {
          form: 'domu',
          pl: 'Wracam do domu.',
          ru: 'Я иду домой.',
          source: { kind: 'tatoeba', id: 100 },
        },
        { form: 'dom', pl: 'To dom.', ru: 'Это дом.', source: { kind: 'authored' } },
      ],
    }
    expect(referencedTatoebaIds(withForms)).toEqual([100, 348626, 348760])
    const forms = buildFormsFile(
      withForms,
      draft,
      audio,
      new Map([...sentences, [100, { id: 100, pl: 'Wracam do domu.', ru: 'Я иду домой.' }]]),
      versions,
    )
    expect(forms.tatoeba['100']).toEqual({ pl: 'Wracam do domu.', ru: 'Я иду домой.' })
  })

  it('builds a valid generated forms file with a Tatoeba snapshot', () => {
    const forms = buildFormsFile(card, draft, audio, sentences, versions)
    expect(formsFileSchema.safeParse(forms).success).toBe(true)
    expect(forms.tatoeba).toEqual({
      '348626': { pl: 'Spójrz na dom z czerwonym dachem.', ru: null },
      '348760': { pl: 'Mój dom jest duży.', ru: 'Мой дом большой.' },
    })
    expect(forms.audio).toEqual(audio)
  })

  it('rejects unknown sentence ids and mismatched drafts', () => {
    expect(() => buildFormsFile(card, draft, null, new Map(), versions)).toThrow(/348626/)
    expect(() => buildFormsFile(card, { ...draft, id: 'mama' }, null, sentences, versions)).toThrow(
      /dom/,
    )
  })

  it('serializes deterministically', () => {
    const a = stableJson(buildFormsFile(card, draft, audio, sentences, versions))
    const b = stableJson(buildFormsFile(card, draft, audio, sentences, versions))
    expect(a).toBe(b)
    expect(a.endsWith('}\n')).toBe(true)
  })
})

describe('publish', () => {
  it('builds the index sorted by rank with the first sense as gloss', () => {
    const second = { ...card, id: 'mama', lemma: 'mama', rank: 101 }
    expect(glossOf(card)).toBe('дом, здание')
    expect(buildIndex([card, second]).map((e) => e.id)).toEqual(['mama', 'dom'])
  })

  it('pairs card and forms, and resolves what the page would otherwise need the index for', () => {
    const forms = buildFormsFile(card, draft, audio, sentences, versions)
    const earlier = { ...card, id: 'mama', lemma: 'mama', rank: 101 }
    const later = { ...card, id: 'zrobic', lemma: 'zrobić', rank: 140 }
    const withFamily = {
      ...card,
      aspectPair: 'zrobic',
      family: [
        { pl: 'zrobić', ru: 'сделать', relation: 'aspect' as const, id: 'zrobic' },
        { pl: 'domek', ru: 'домик', relation: 'derived' as const, id: 'domek' },
        { pl: 'domowy', ru: 'домашний', relation: 'derived' as const, id: null },
      ],
    }
    const index = buildIndex([withFamily, earlier, later])
    const published = buildPublishedCard(withFamily, forms, index)

    expect(published.card).toEqual(withFamily)
    expect(published.forms).toEqual(forms)
    expect(published.prev).toEqual({ id: 'mama', lemma: 'mama', rank: 101 })
    expect(published.next).toEqual({ id: 'zrobic', lemma: 'zrobić', rank: 140 })
    expect(published.aspectPair).toEqual({ id: 'zrobic', lemma: 'zrobić', rank: 140 })
    // domek has no card and domowy has no id: neither can be linked.
    expect(published.familyIds).toEqual(['zrobic'])
  })

  it('leaves the ends of the ranking without a neighbour', () => {
    const forms = buildFormsFile(card, draft, audio, sentences, versions)
    const other = { ...card, id: 'mama', lemma: 'mama', rank: 101 }
    const index = buildIndex([card, other])
    expect(buildPublishedCard(other, forms, index).prev).toBeNull()
    expect(buildPublishedCard(card, forms, index).next).toBeNull()
  })
})

describe('partial publish', () => {
  const row = (id: string, rank: number, lemma = id, gloss = 'x') =>
    ({ id, lemma, rank, pos: 'noun', gloss }) as const
  const current = [row('dom', 1), row('kot', 2)]
  const same = (entry: ReturnType<typeof row>) => ({
    entry,
    recordingUrl: null,
    publishedRecordingUrl: null,
  })

  it('allows an edit that keeps id, lemma, rank and recording', () => {
    expect(
      partialPublishBlocker(current, ['kot', 'dom'], [same(row('kot', 2, 'kot', 'y'))]),
    ).toBeNull()
  })

  it('falls back when another card could see the change', () => {
    expect(partialPublishBlocker(current, ['dom', 'kot', 'pies'], [])).toBe(
      'cards were added or removed',
    )
    expect(partialPublishBlocker(current, ['dom'], [])).toBe('cards were added or removed')
    expect(partialPublishBlocker(current, ['dom', 'kot'], [same(row('kot', 2, 'kotek'))])).toBe(
      'kot changed its lemma',
    )
    expect(partialPublishBlocker(current, ['dom', 'kot'], [same(row('kot', 3))])).toBe(
      'kot changed its rank',
    )
    expect(
      partialPublishBlocker(
        current,
        ['dom', 'kot'],
        [{ entry: row('kot', 2), recordingUrl: 'https://x/kot.ogg', publishedRecordingUrl: null }],
      ),
    ).toBe('kot changed its recording')
  })

  it('replaces only the updated rows, keeping order', () => {
    expect(mergeIndex(current, [row('dom', 1, 'dom', 'дом')])).toEqual([
      row('dom', 1, 'dom', 'дом'),
      row('kot', 2),
    ])
  })
})
