import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BookReader from '~/components/BookReader.vue'
import { bookSchema } from '../../shared/schemas'

const book = bookSchema.parse({
  title: 'Alicja w Krainie Czarów',
  titleRu: 'Алиса в Стране чудес',
  author: 'Lewis Carroll',
  translator: 'Jarek Westermark',
  source: {
    name: 'Wolne Lektury',
    url: 'https://wolnelektury.pl/',
    license: 'Licencja Wolnej Sztuki 1.3',
    licenseUrl: 'https://artlibre.org/licence/lal/pl/',
  },
  chapter: 1,
  chapterTitle: 'W głąb króliczej nory',
  chapterTitleRu: 'Вниз по кроличьей норе',
  level: 'B1',
  paragraphs: [
    {
      clean: 'Królicza nora przypominała tunel.',
      chunks: [
        { pl: 'Królicza nora', ru: 'Кроличья нора' },
        {
          pl: ' przypominała tunel.',
          ru: ' напоминала туннель',
          note: 'przypominać coś — напоминать что-л., с винительным без предлога',
        },
      ],
      words: { nora: 'nora', tunel: 'tunel' },
    },
  ],
})

describe('BookReader', () => {
  it('runs the Polish on continuously with each gloss bracketed after its chunk', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book } })
    const text = wrapper.find('p.glossed').text().replace(/\s+/g, ' ')
    expect(text).toContain('Królicza nora (Кроличья нора)')
    expect(text).toContain('przypominała tunel. (напоминала туннель;')
    expect(wrapper.findAll('li.chunk')).toHaveLength(0)
  })

  it('keeps the space between a closing bracket and the next chunk', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book } })
    // Chunks carry the spacing that rebuilds the source, so the glossed flow must
    // read ") przypominała", never ")przypominała". Collapsing whitespace before
    // asserting would hide exactly this bug, so only newlines are normalised.
    const text = wrapper.find('p.glossed').text().replace(/\n+/g, ' ')
    expect(text).toContain(') przypominała')
    expect(text).not.toMatch(/\)\S/)
  })

  it('carries the usage note inside the bracket', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book } })
    const note = wrapper.find('p.glossed i.note')
    expect(note.exists()).toBe(true)
    expect(note.text()).toContain('przypominać coś')
  })

  it('repeats the paragraph clean, with the glosses left out', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book } })
    const clean = wrapper.find('p.clean')
    expect(clean.attributes('lang')).toBe('pl')
    expect(clean.text()).toContain('Królicza nora przypominała tunel.')
    expect(clean.text()).not.toContain('Кроличья нора')
  })

  it('links known words in the clean pass to their dictionary card', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book } })
    const links = wrapper.findAll('p.clean a.book-word')
    expect(links).toHaveLength(2)
    expect(links.map((a) => a.attributes('href')).sort()).toEqual(['/slovo/nora', '/slovo/tunel'])
  })

  it('opens dictionary links in a new tab, without handing over the opener', () => {
    // Reading should not be interrupted: looking a word up must not navigate the
    // reader away from the page they are in the middle of.
    return mountSuspended(BookReader, { props: { book } }).then((wrapper) => {
      for (const link of wrapper.findAll('p.clean a.book-word')) {
        expect(link.attributes('target')).toBe('_blank')
        expect(link.attributes('rel')).toContain('noopener')
      }
    })
  })

  it('hides the gloss until asked in tap mode', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book, initialMode: 'tap' } })
    expect(wrapper.find('.gloss').exists()).toBe(false)
    await wrapper.find('button.reveal').trigger('click')
    expect(wrapper.find('.gloss').text()).toContain('Кроличья нора')
  })

  it('drops the glosses entirely in hide mode, leaving plain Polish', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book, initialMode: 'hide' } })
    expect(wrapper.find('.gloss').exists()).toBe(false)
    expect(wrapper.find('button.reveal').exists()).toBe(false)
    expect(wrapper.find('p.glossed').text()).toContain('Królicza nora przypominała tunel.')
  })
})

describe('verse', () => {
  const poem = bookSchema.parse({
    title: 'Alicja',
    titleRu: 'Алиса',
    author: 'Lewis Carroll',
    source: {
      name: 'Project Gutenberg',
      url: 'https://www.gutenberg.org/ebooks/11',
      license: 'Public domain',
      licenseUrl: 'https://www.gutenberg.org/policy/permission.html',
    },
    chapter: 2,
    chapterTitle: 'Jezioro łez',
    chapterTitleRu: 'Море слёз',
    level: 'B1',
    paragraphs: [
      {
        clean: 'Pierwszy wers\nDrugi wers',
        verse: true,
        chunks: [
          { pl: 'Pierwszy wers', ru: 'Первый стих' },
          { pl: '\nDrugi wers', ru: 'Второй стих' },
        ],
      },
      {
        clean: 'Zwykły akapit.',
        chunks: [{ pl: 'Zwykły akapit.', ru: 'Обычный абзац.' }],
      },
    ],
  })

  it('keeps the line breaks of a poem instead of running them together', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book: poem } })
    const paras = wrapper.findAll('p.clean')
    expect(paras[0]!.classes()).toContain('verse')
    expect(paras[0]!.text()).toContain('\n')
  })

  it('leaves prose paragraphs alone', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book: poem } })
    expect(wrapper.findAll('p.clean')[1]!.classes()).not.toContain('verse')
  })
})

describe('scene breaks', () => {
  // Carroll marks a jump in the narrative with a row of asterisks, and prints it
  // two or three times over. It is punctuation, not a sentence: glossing it,
  // linking it or offering to read it aloud is noise.
  const asterisks = '* * * * * * *'
  const withBreaks = bookSchema.parse({
    title: 'Alicja',
    titleRu: 'Алиса',
    author: 'Lewis Carroll',
    source: {
      name: 'Project Gutenberg',
      url: 'https://www.gutenberg.org/ebooks/11',
      license: 'Public domain',
      licenseUrl: 'https://www.gutenberg.org/policy/permission.html',
    },
    chapter: 1,
    chapterTitle: 'W głąb króliczej nory',
    chapterTitleRu: 'Вниз по кроличьей норе',
    level: 'B1',
    paragraphs: [
      { clean: 'Alicja spadała.', chunks: [{ pl: 'Alicja spadała.', ru: 'Алиса падала.' }] },
      { clean: asterisks, chunks: [{ pl: asterisks, ru: 'разрыв в повествовании' }] },
      { clean: asterisks, chunks: [{ pl: asterisks, ru: 'разрыв в повествовании' }] },
      { clean: asterisks, chunks: [{ pl: asterisks, ru: 'разрыв в повествовании' }] },
      { clean: 'Wylądowała.', chunks: [{ pl: 'Wylądowała.', ru: 'Она приземлилась.' }] },
    ],
  })

  it('renders a row of asterisks as a divider rather than a paragraph', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book: withBreaks } })
    expect(wrapper.findAll('section.para')).toHaveLength(2)
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(1)
  })

  it('collapses a repeated row into a single break', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book: withBreaks } })
    // Three rows in the source stand for one gap, not three.
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(1)
  })

  it('never glosses, links or offers to read the asterisks', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book: withBreaks } })
    expect(wrapper.text()).not.toContain('разрыв в повествовании')
    for (const clean of wrapper.findAll('p.clean')) {
      expect(clean.text()).not.toContain('*')
    }
    for (const glossed of wrapper.findAll('p.glossed')) {
      expect(glossed.text()).not.toContain('*')
    }
  })

  it('leaves the surrounding prose untouched', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book: withBreaks } })
    const cleans = wrapper.findAll('p.clean')
    expect(cleans[0]!.text()).toContain('Alicja spadała.')
    expect(cleans[1]!.text()).toContain('Wylądowała.')
  })

  it("reads a book's foreign names the way the original says them, and shows them as written", async () => {
    const zew = bookSchema.parse({
      ...book,
      paragraphs: [
        {
          clean: 'Buck nie czytał gazet.',
          chunks: [{ pl: 'Buck nie czytał gazet.', ru: 'Бэк не читал газет.' }],
        },
      ],
    })
    const wrapper = await mountSuspended(BookReader, {
      props: { book: zew, bookId: 'london' },
      global: {
        stubs: {
          SpeakButton: { props: ['text', 'say'], template: '<i class="speak" :data-say="say" />' },
        },
      },
    })
    expect(wrapper.find('p.clean').text()).toContain('Buck nie czytał gazet.')
    expect(wrapper.find('p.clean .speak').attributes('data-say')).toBe('Bak nie czytał gazet.')
  })
})
