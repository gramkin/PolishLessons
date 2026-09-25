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
        { pl: ' przypominała tunel.', ru: ' напоминала туннель.' },
      ],
      words: { nora: 'nora', tunel: 'tunel' },
    },
  ],
})

describe('BookReader', () => {
  it('shows each chunk beside its gloss', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book } })
    const chunks = wrapper.findAll('li.chunk')
    expect(chunks).toHaveLength(2)
    expect(chunks[0]!.find('.pl').text()).toBe('Królicza nora')
    expect(chunks[0]!.find('.ru').text()).toBe('Кроличья нора')
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

  it('hides the gloss until asked in tap mode', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book, initialMode: 'tap' } })
    expect(wrapper.find('.chunk .ru').exists()).toBe(false)
    await wrapper.find('button.reveal').trigger('click')
    expect(wrapper.find('.chunk .ru').text()).toBe('Кроличья нора')
  })

  it('drops the glosses entirely in hide mode', async () => {
    const wrapper = await mountSuspended(BookReader, { props: { book, initialMode: 'hide' } })
    expect(wrapper.find('.chunk .ru').exists()).toBe(false)
    expect(wrapper.find('button.reveal').exists()).toBe(false)
    expect(wrapper.find('p.clean').text()).toContain('Królicza nora')
  })
})
