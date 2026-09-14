import { describe, expect, it } from 'vitest'
import type { ContentBundle } from '../../scripts/lib/load-content'
import { findComponentRefs, validateContent } from '../../scripts/lib/validate'

function validBundle(): ContentBundle {
  return {
    chapters: { path: 'chapters.yml', data: { chapters: [{ number: 1, title: 'Алфавит' }] } },
    patterns: {
      path: 'patterns.yml',
      data: { patterns: [{ id: 'rz-р', pl: 'rz', ru: 'р', rule: 'rz часто соответствует р' }] },
    },
    words: [
      {
        path: 'words/basics.yml',
        data: {
          words: [
            {
              id: 'rzeka',
              pl: 'rzeka',
              ru: 'река',
              pos: 'noun',
              gender: 'f',
              pron: 'жэ́ка',
              pattern: 'rz-р',
              topic: 'природа',
              chapter: 1,
            },
            {
              id: 'uroda',
              pl: 'uroda',
              ru: 'красота',
              pos: 'noun',
              gender: 'f',
              pron: 'уро́да',
              falseFriend: { ru: 'урод', meaning: 'красота' },
              topic: 'люди',
              chapter: 1,
            },
          ],
        },
      },
    ],
    stories: [
      {
        path: 'stories/kot.yml',
        data: {
          title: 'Kot i rzeka',
          titleRu: 'Кот и река',
          level: 'A1',
          sentences: [{ pl: 'Kot widzi rzekę.', ru: 'Кот видит реку.', words: { rzekę: 'rzeka' } }],
        },
      },
    ],
    lessons: [
      {
        path: 'lessons/01/01.md',
        frontmatter: { title: 'Буквы', chapter: 1, order: 1, level: 'A1', words: ['rzeka'] },
        body: 'Слово :pl-word{id="rzeka"}.\n\n::cognate-list{pattern="rz-р"}\n::\n\n:false-friend{id="uroda"}\n',
      },
    ],
    cheatsheet: {
      path: 'cheatsheet.md',
      frontmatter: { title: 'Шпаргалка' },
      body: ':pron{id="rzeka"}',
    },
  }
}

describe('findComponentRefs', () => {
  it('finds inline and block components with attributes', () => {
    const refs = findComponentRefs(':pl-word{id="rzeka"} and ::cognate-list{pattern="rz-р"}\n::')
    expect(refs).toEqual([
      { name: 'pl-word', attrs: { id: 'rzeka' } },
      { name: 'cognate-list', attrs: { pattern: 'rz-р' } },
    ])
  })

  it('ignores unrelated components', () => {
    expect(findComponentRefs('::quiz\n---\n---\n::')).toEqual([])
  })
})

describe('validateContent', () => {
  it('returns no errors for valid content', () => {
    expect(validateContent(validBundle())).toEqual([])
  })

  it('reports missing chapters and patterns files', () => {
    const bundle = { ...validBundle(), chapters: null, patterns: null }
    const errors = validateContent(bundle)
    expect(errors).toContain('chapters.yml: file is missing')
    expect(errors).toContain('patterns.yml: file is missing')
  })

  it('reports schema errors and unknown keys with file path', () => {
    const bundle = validBundle()
    const words = (bundle.words[0]!.data as { words: Record<string, unknown>[] }).words
    words[0]!.pos = 'thing'
    words[1]!.falsefriend = 'typo'
    const errors = validateContent(bundle)
    expect(errors.some((e) => e.startsWith('words/basics.yml: words.0.pos:'))).toBe(true)
    expect(
      errors.some((e) => e.startsWith('words/basics.yml: words.1:') && e.includes('falsefriend')),
    ).toBe(true)
  })

  it('reports duplicate word ids across files', () => {
    const bundle = validBundle()
    bundle.words.push({
      path: 'words/more.yml',
      data: {
        words: [
          {
            id: 'rzeka',
            pl: 'rzeka',
            ru: 'река',
            pos: 'noun',
            pron: 'жэ́ка',
            topic: 'x',
            chapter: 1,
          },
        ],
      },
    })
    expect(validateContent(bundle)).toContain(
      'words/more.yml: duplicate word id "rzeka" (first defined in words/basics.yml)',
    )
  })

  it('reports unknown pattern and missing pattern groups', () => {
    const bundle = validBundle()
    const words = (bundle.words[0]!.data as { words: Record<string, unknown>[] }).words
    words[0]!.pl = 'reka'
    words[1]!.pattern = 'nope'
    const errors = validateContent(bundle)
    expect(errors).toContain(
      'words/basics.yml: word "rzeka": group "rz" of pattern "rz-р" not found in "reka"',
    )
    expect(errors).toContain('words/basics.yml: word "uroda": unknown pattern "nope"')
  })

  it('reports unknown chapters for words and lessons', () => {
    const bundle = validBundle()
    const words = (bundle.words[0]!.data as { words: Record<string, unknown>[] }).words
    words[0]!.chapter = 9
    bundle.lessons[0]!.frontmatter.chapter = 7
    const errors = validateContent(bundle)
    expect(errors).toContain('words/basics.yml: word "rzeka": unknown chapter 9')
    expect(errors).toContain('lessons/01/01.md: unknown chapter 7')
  })

  it('reports duplicate chapter/order pairs', () => {
    const bundle = validBundle()
    bundle.lessons.push({ ...bundle.lessons[0]!, path: 'lessons/01/02.md' })
    expect(validateContent(bundle)).toContain(
      'lessons/01/02.md: duplicate chapter 1 order 1 (also lessons/01/01.md)',
    )
  })

  it('reports unknown word ids in lessons, components and stories', () => {
    const bundle = validBundle()
    bundle.lessons[0]!.frontmatter.words = ['ghost']
    bundle.lessons[0]!.body =
      ':pl-word{id="nope"} ::cognate-list{pattern="zz"}\n:false-friend{id="rzeka"}'
    const story = bundle.stories[0]!.data as { sentences: { words: Record<string, string> }[] }
    story.sentences[0]!.words = { rzekę: 'missing', kotek: 'rzeka' }
    const errors = validateContent(bundle)
    expect(errors).toContain('lessons/01/01.md: unknown word id "ghost" in frontmatter words')
    expect(errors).toContain('lessons/01/01.md: pl-word references unknown word id "nope"')
    expect(errors).toContain('lessons/01/01.md: cognate-list references unknown pattern "zz"')
    expect(errors).toContain('lessons/01/01.md: false-friend id "rzeka" is not a false friend')
    expect(errors).toContain('stories/kot.yml: sentence 1: unknown word id "missing"')
    expect(errors).toContain('stories/kot.yml: sentence 1: form "kotek" not found in Polish text')
  })

  it('reports lesson frontmatter schema errors', () => {
    const bundle = validBundle()
    delete bundle.lessons[0]!.frontmatter.title
    bundle.lessons[0]!.frontmatter.level = 'C1'
    const errors = validateContent(bundle)
    expect(errors.some((e) => e.startsWith('lessons/01/01.md: title:'))).toBe(true)
    expect(errors.some((e) => e.startsWith('lessons/01/01.md: level:'))).toBe(true)
  })
})
