import { describe, expect, it } from 'vitest'
import type { ContentBundle } from '../../scripts/lib/load-content'
import {
  buildSearchDocs,
  lessonPath,
  plainText,
  splitSections,
} from '../../scripts/lib/search-docs'

const words = [
  { id: 'rzeka', pl: 'rzeka', ru: 'река', pos: 'noun', pron: 'жэ́ка', topic: 'природа', chapter: 1 },
  { id: 'zab', pl: 'ząb', ru: 'зуб', pos: 'noun', pron: 'зомп', topic: 'тело', chapter: 1 },
]

const bundle: ContentBundle = {
  drills: null,
  placement: null,
  chapters: { path: 'chapters.yml', data: { chapters: [{ number: 1, title: 'Алфавит' }] } },
  patterns: {
    path: 'patterns.yml',
    data: { patterns: [{ id: 'x', pl: 'x', ru: 'х', rule: 'r' }] },
  },
  words: [{ path: 'words/a.yml', data: { words } }],
  books: [],
  stories: [
    {
      path: 'stories/kot.yml',
      data: {
        title: 'Kot',
        titleRu: 'Кот',
        level: 'A1',
        chapter: 1,
        sentences: [{ pl: 'Kot pije wodę.', ru: 'Кот пьёт воду.' }],
      },
    },
  ],
  lessons: [
    {
      path: 'lessons/01-alphabet/01-letters.md',
      frontmatter: { title: 'Буквы', chapter: 1, order: 1, level: 'A1' },
      body: [
        'Вступление про **алфавит**.',
        '',
        '## Особые буквы',
        '',
        '| Буква | Пример |',
        '|---|---|',
        '| ą | :pl-word{id="zab"} |',
        '',
        '::quiz',
        '---',
        'questions:',
        '  - type: input',
        '    q: секрет',
        '    answer: x',
        '---',
        '::',
      ].join('\n'),
    },
  ],
  cheatsheet: {
    path: 'cheatsheet.md',
    frontmatter: { title: 'Шпаргалка' },
    body: 'Ударение на предпоследний слог.',
  },
  cards: [],
  forms: [],
}

describe('helpers', () => {
  it('builds lesson paths from file paths', () => {
    expect(lessonPath('lessons/01-alphabet/01-letters.md')).toBe('/lessons/01-alphabet/01-letters')
  })

  it('splits sections on ## and ### headings', () => {
    const sections = splitSections('intro\n## A\ntext a\n### B\ntext b')
    expect(sections.map((s) => s.heading)).toEqual([null, 'A', 'B'])
    expect(sections[1]!.body.trim()).toBe('text a')
  })

  it('turns Markdown with components into plain text', () => {
    const map = new Map(words.map((w) => [w.id, w as never]))
    expect(plainText('**Слово** :pl-word{id="zab"} и [ссылка](/x).', map)).toBe(
      'Слово ząb и ссылка.',
    )
    expect(plainText('::quiz\n---\nq: секрет\n---\n::\nпосле', map)).toBe('после')
  })
})

describe('buildSearchDocs', () => {
  const docs = buildSearchDocs(bundle)

  it('creates lesson section documents with labels', () => {
    const lessonDocs = docs.filter((d) => d.type === 'lesson' && d.url.startsWith('/lessons'))
    expect(lessonDocs.map((d) => d.title)).toEqual(['1.1 Буквы', '1.1 Буквы › Особые буквы'])
    expect(lessonDocs[1]!.text).toContain('ząb')
    expect(lessonDocs[1]!.text).not.toContain('секрет')
    expect(lessonDocs[0]!.url).toBe('/lessons/01-alphabet/01-letters')
  })

  it('indexes the cheat sheet', () => {
    expect(docs.find((d) => d.url === '/cheatsheet')?.text).toContain('предпоследний')
  })

  it('creates word documents linking to the vocabulary', () => {
    expect(docs.find((d) => d.id === 'word:zab')).toEqual({
      id: 'word:zab',
      type: 'word',
      title: 'ząb — зуб',
      text: 'ząb зуб',
      url: '/vocabulary#zab',
    })
  })

  it('creates story title and sentence documents', () => {
    const storyDocs = docs.filter((d) => d.type === 'story')
    expect(storyDocs.map((d) => d.id)).toEqual(['story:kot', 'story:kot:0'])
    expect(storyDocs[1]).toMatchObject({
      text: 'Kot pije wodę. Кот пьёт воду.',
      url: '/stories/kot',
    })
  })
})

describe('card documents', () => {
  it('keeps the inflected forms out of the gloss text, in a field of their own', () => {
    const withCard = {
      ...bundle,
      cards: [
        {
          path: 'dictionary/zab.yml',
          data: {
            id: 'zab',
            format: 1,
            lemma: 'ząb',
            rank: 900,
            pos: 'noun',
            pron: { cyr: 'зомп' },
            senses: [
              {
                id: 'tooth',
                ru: 'зуб',
                examples: [
                  { pl: 'Boli mnie ząb.', ru: 'У меня болит зуб.', source: { kind: 'authored' } },
                ],
              },
            ],
          },
        },
      ],
      forms: [
        {
          path: 'forms/zab.json',
          data: {
            generated: true,
            sources: { polimorf: '0.6.7', wiktionary: 'w', tatoeba: 't' },
            id: 'zab',
            lemma: 'ząb',
            pos: 'noun',
            grammarLabel: null,
            ipa: null,
            audio: null,
            allForms: ['ząb', 'zęba', 'zęby'],
            tables: [],
            tatoeba: {},
          },
        },
      ],
    }
    const docs = buildSearchDocs(withCard)
    expect(docs.find((d) => d.id === 'card:zab')).toEqual({
      id: 'card:zab',
      type: 'word',
      title: 'ząb — зуб',
      // The forms live in their own field: searching a prefix across an
      // inflection table ranks by how many forms share it, not by relevance.
      text: 'ząb зуб',
      forms: 'ząb zęba zęby',
      url: '/slovo/zab',
    })
    expect(docs.some((d) => d.id === 'word:zab')).toBe(false)
  })
})
