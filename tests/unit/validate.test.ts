import { describe, expect, it } from 'vitest'
import type { ContentBundle } from '../../scripts/lib/load-content'
import { findComponentRefs, validateContent } from '../../scripts/lib/validate'

const drill = {
  id: 'noun-acc-sg',
  title: 'Винительный падеж',
  instruction: 'Поставьте слово в винительный падеж.',
  pos: 'noun',
  cells: [{ table: 'Склонение', row: 'Винительный', column: 'Ед. ч.' }],
}

function validBundle(): ContentBundle {
  return {
    drills: { path: 'drills.yml', data: { drills: [drill] } },
    placement: null,
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
    books: [],
    stories: [
      {
        path: 'stories/kot.yml',
        data: {
          title: 'Kot i rzeka',
          titleRu: 'Кот и река',
          level: 'A1',
          chapter: 1,
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
    cards: [],
    forms: [],
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

  it('checks a story against its chapter and its questions', () => {
    const bundle = validBundle()
    bundle.chapters!.data = {
      chapters: [
        { number: 1, title: 'Алфавит' },
        { number: 2, title: 'Звуки' },
      ],
    }
    const words = bundle.words[0]!.data as { words: { id: string; chapter: number }[] }
    words.words.find((w) => w.id === 'rzeka')!.chapter = 2
    const story = bundle.stories[0]!.data as Record<string, unknown>
    story.questions = [{ type: 'choice', q: 'Что видит кот?', options: ['реку'], answer: 3 }]
    let errors = validateContent(bundle)
    expect(errors).toContain(
      'stories/kot.yml: sentence 1: "rzekę" (rzeka) is taught in chapter 2, after the story\'s chapter 1',
    )
    expect(errors).toContain('stories/kot.yml: questions.0.answer: answer index out of range')

    story.chapter = 7
    errors = validateContent(bundle)
    expect(errors).toContain('stories/kot.yml: unknown chapter 7')
  })

  it('checks the placement test: chapters exist and questions are valid', () => {
    const bundle = validBundle()
    bundle.placement = {
      path: 'placement.yml',
      data: {
        questions: [
          { chapter: 1, type: 'choice', q: 'rzeka?', options: ['река', 'рука'], answer: 0 },
          { chapter: 9, type: 'choice', q: '?', options: ['a', 'b'], answer: 0 },
          { chapter: 1, type: 'choice', q: '?', options: ['a', 'b'], answer: 5 },
        ],
      },
    }
    const errors = validateContent(bundle)
    expect(errors).toContain('placement.yml: question 2: unknown chapter 9')
    expect(errors).toContain('placement.yml: question 3: answer: answer index out of range')
    expect(errors.filter((e) => e.includes('question 1'))).toEqual([])
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

describe('books', () => {
  const source = {
    name: 'Wolne Lektury',
    url: 'https://wolnelektury.pl/',
    license: 'Licencja Wolnej Sztuki 1.3',
    licenseUrl: 'https://artlibre.org/licence/lal/pl/',
  }

  function withBook(paragraphs: unknown[], cards: { path: string; data: unknown }[] = []) {
    const bundle = validBundle()
    bundle.cards = cards
    bundle.books = [
      {
        path: 'books/alicja-01.yml',
        data: {
          title: 'Alicja w Krainie Czarów',
          titleRu: 'Алиса в Стране чудес',
          author: 'Lewis Carroll',
          translator: 'Jarek Westermark',
          source,
          chapter: 1,
          chapterTitle: 'W głąb króliczej nory',
          chapterTitleRu: 'Вниз по кроличьей норе',
          level: 'B1',
          paragraphs,
        },
      },
    ]
    return bundle
  }

  // The chunks carry the spacing that rebuilds the paragraph. Dropping it is
  // invisible in the data and only shows up as ")слово" once rendered.
  const good = {
    clean: 'Kot widzi rzekę.',
    chunks: [
      { pl: 'Kot widzi', ru: 'Кот видит' },
      { pl: ' rzekę.', ru: 'реку.', note: 'widzieć co — винительный падеж' },
    ],
  }

  it('accepts a book whose chunks rebuild the paragraph', () => {
    expect(validateContent(withBook([good]))).toEqual([])
  })

  it('rejects chunks that no longer rebuild the source text', () => {
    const stripped = {
      clean: 'Kot widzi rzekę.',
      chunks: [
        { pl: 'Kot widzi', ru: 'Кот видит' },
        { pl: 'rzekę.', ru: 'реку.' },
      ],
    }
    expect(validateContent(withBook([stripped]))).toContain(
      'books/alicja-01.yml: paragraph 1: chunks do not rebuild the source text',
    )
  })

  it('rejects a word link whose card does not exist', () => {
    const cards = [{ path: 'dictionary/rzeka.yml', data: { id: 'rzeka' } }]
    const bundle = withBook([{ ...good, words: { rzekę: 'nieistnieje' } }], cards)
    expect(validateContent(bundle)).toContain(
      'books/alicja-01.yml: paragraph 1: unknown card id "nieistnieje"',
    )
  })

  it('rejects a linked form that is absent from the paragraph', () => {
    const cards = [{ path: 'dictionary/rzeka.yml', data: { id: 'rzeka' } }]
    const bundle = withBook([{ ...good, words: { kaczka: 'rzeka' } }], cards)
    expect(validateContent(bundle)).toContain(
      'books/alicja-01.yml: paragraph 1: form "kaczka" not found in the text',
    )
  })
})

describe('drills', () => {
  it('accepts a lesson that uses a known drill', () => {
    const bundle = validBundle()
    bundle.lessons[0]!.body += '\n::drill{id="noun-acc-sg"}\n::\n'
    expect(validateContent(bundle)).toEqual([])
  })

  it('reports an unknown drill id', () => {
    const bundle = validBundle()
    bundle.lessons[0]!.body += '\n::drill{id="nope"}\n::\n'
    expect(validateContent(bundle)).toContainEqual(expect.stringContaining('unknown drill "nope"'))
  })

  it('rejects a duplicate id and an invalid require pattern', () => {
    const bundle = validBundle()
    bundle.drills = { path: 'drills.yml', data: { drills: [drill, { ...drill, require: '(' }] } }
    const errors = validateContent(bundle)
    expect(errors).toContainEqual(expect.stringContaining('duplicate drill id "noun-acc-sg"'))
    expect(errors).toContainEqual(expect.stringContaining('invalid require pattern'))
  })

  it('rejects an unknown key', () => {
    const bundle = validBundle()
    bundle.drills = { path: 'drills.yml', data: { drills: [{ ...drill, colour: 'red' }] } }
    expect(validateContent(bundle)).toContainEqual(expect.stringContaining('colour'))
  })
})

describe('quizzes', () => {
  const withQuiz = (yaml: string) => {
    const bundle = validBundle()
    bundle.lessons[0]!.body += `\n::quiz\n---\n${yaml}\n---\n::\n`
    return validateContent(bundle)
  }

  it('accepts translate and listen questions', () => {
    expect(
      withQuiz(
        'questions:\n  - type: translate\n    q: У меня нет времени.\n    answer: [Nie mam czasu., Czasu nie mam.]\n  - type: listen\n    text: rzeka',
      ),
    ).toEqual([])
  })

  it('accepts a write question and rejects one without a checklist', () => {
    expect(
      withQuiz(
        'questions:\n  - type: write\n    q: Напишите письмо.\n    model: Szanowni Państwo, piszę w sprawie zamówienia.\n    checklist: [обращение, просьба]',
      ),
    ).toEqual([])
    expect(
      withQuiz('questions:\n  - type: write\n    q: Напишите письмо.\n    model: Dzień dobry.'),
    ).toContainEqual(expect.stringContaining('quiz 1'))
  })

  it('reports an answer index past the options, an unknown type and broken YAML', () => {
    expect(
      withQuiz('questions:\n  - type: choice\n    q: X?\n    options: [a, b]\n    answer: 2'),
    ).toContainEqual(expect.stringContaining('quiz 1'))
    expect(withQuiz('questions:\n  - type: essay\n    q: X?')).toContainEqual(
      expect.stringContaining('quiz 1'),
    )
    expect(withQuiz('questions: [unclosed')).toContainEqual(expect.stringContaining('invalid YAML'))
    expect(withQuiz('questions: []\nfinall: true')).toContainEqual(
      expect.stringContaining('quiz 1'),
    )
  })
})
