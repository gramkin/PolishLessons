import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Header from '~/components/dictionary/Header.vue'
import Senses from '~/components/dictionary/Senses.vue'
import FormsTables from '~/components/dictionary/FormsTables.vue'
import Origin from '~/components/dictionary/Origin.vue'
import Notes from '~/components/dictionary/Notes.vue'
import Related from '~/components/dictionary/Related.vue'
import Sources from '~/components/dictionary/Sources.vue'
import { cardSchema, formsFileSchema } from '../../shared/dictionary'

const card = cardSchema.parse({
  id: 'robic',
  format: 1,
  lemma: 'robić',
  rank: 40,
  pos: 'verb',
  aspect: 'imperf',
  aspectPair: 'zrobic',
  pron: { cyr: 'ро́биць' },
  senses: [
    {
      id: 'do',
      ru: 'делать',
      note: 'самое общее значение',
      examples: [
        { pl: 'Co robisz?', ru: 'Что ты делаешь?', source: { kind: 'tatoeba', id: 1 } },
        { pl: 'Robię obiad.', ru: 'Я готовлю обед.', source: { kind: 'authored' } },
      ],
    },
  ],
  notes: [{ kind: 'false-friend', text: 'Не путать с «робить».' }],
  collocations: [{ pl: 'robić zakupy', ru: 'делать покупки' }],
  family: [
    { pl: 'zrobić', ru: 'сделать', relation: 'aspect', id: 'zrobic' },
    { pl: 'robota', ru: 'работа', relation: 'derived', id: null },
  ],
})

const forms = formsFileSchema.parse({
  generated: true,
  sources: { polimorf: '0.6.7', wiktionary: 'w', tatoeba: 't' },
  id: 'robic',
  lemma: 'robić',
  pos: 'verb',
  grammarLabel: null,
  ipa: 'ˈrɔbʲit͡ɕ',
  audio: {
    file: 'Pl-robić.ogg',
    url: 'https://upload.wikimedia.org/r.ogg',
    license: 'CC BY 2.5',
    author: 'Derbeth',
  },
  allForms: ['robić', 'robisz', 'robię'],
  tables: [
    {
      title: 'Настоящее время',
      columns: ['Ед. ч.', 'Мн. ч.'],
      rows: [
        { label: '1-е лицо', cells: [['robię'], ['robimy']] },
        { label: '2-е лицо', cells: [['robisz'], ['robicie']] },
        { label: '3-е лицо', cells: [['robi'], ['robią']] },
      ],
      extra: false,
    },
    {
      title: 'Безличная форма',
      columns: ['Форма'],
      rows: [{ label: 'Прошедшее время', cells: [['robiono']] }],
      extra: true,
    },
  ],
  tatoeba: { '1': { pl: 'Co robisz?', ru: 'Что ты делаешь?' } },
})

// Resolved at publish time rather than looked up from the whole index.
const aspectPair = { id: 'zrobic', lemma: 'zrobić', rank: 60 }
const familyIds = ['zrobic']

describe('dictionary card components', () => {
  it('renders the header with pronunciation, rank and audio', async () => {
    const wrapper = await mountSuspended(Header, { props: { card, forms } })
    expect(wrapper.find('h1').text()).toBe('robić')
    expect(wrapper.find('h1').attributes('lang')).toBe('pl')
    expect(wrapper.text()).toContain(
      'глагол · несовершенный вид · II спряжение (-ę, -isz/-ysz) · №40 по частоте',
    )
    expect(wrapper.text()).toContain('[ˈrɔbʲit͡ɕ]')
    expect(wrapper.find('audio').attributes('src')).toBe('https://upload.wikimedia.org/r.ogg')
  })

  it('renders senses with highlighted forms and source badges', async () => {
    const wrapper = await mountSuspended(Senses, {
      props: { senses: card.senses, allForms: forms.allForms, cardId: card.id },
    })
    const examples = wrapper.findAll('li.example')
    expect(examples[0]!.find('strong').text()).toBe('robisz')
    expect(examples[0]!.find('a.badge').attributes('href')).toBe(
      'https://tatoeba.org/ru/sentences/show/1',
    )
    expect(examples[1]!.find('.badge').text()).toBe('на проверке')
    expect(wrapper.find('.sense-note').text()).toBe('самое общее значение')
  })

  it('puts extra tables into «Все формы»', async () => {
    const wrapper = await mountSuspended(FormsTables, {
      props: { tables: forms.tables, formExamples: [], cardId: card.id, negatedForms: [] },
    })
    expect(wrapper.find('section#formy .table-wrap caption').text()).toBe('Настоящее время')
    expect(wrapper.find('details summary').text()).toBe('Все формы')
    expect(wrapper.find('details caption').text()).toBe('Безличная форма')
    expect(wrapper.find('tbody th[scope="row"]').text()).toBe('1-е лицо')
  })

  it('renders notes, collocations, related words and sources', async () => {
    const notes = await mountSuspended(Notes, { props: { notes: card.notes } })
    expect(notes.find('aside.note.is-false-friend').text()).toContain('Ложный друг.')

    const related = await mountSuspended(Related, { props: { card, aspectPair, familyIds } })
    expect(related.find('a[href="/slovo/zrobic"]').text()).toBe('zrobić')
    expect(related.text()).toContain('robota — работа')
    expect(related.text()).toContain('robić zakupy — делать покупки')

    const sources = await mountSuspended(Sources, { props: { card, forms } })
    expect(sources.text()).toContain('Derbeth')
    expect(sources.text()).toContain('CC BY 2.5')
    expect(sources.find('a[href="/sources"]').exists()).toBe(true)
  })

  it('shows an example when a form with one is clicked', async () => {
    const formExamples = [
      {
        form: 'robię',
        pl: 'Robię obiad.',
        ru: 'Я готовлю обед.',
        source: { kind: 'authored' as const },
      },
    ]
    const wrapper = await mountSuspended(FormsTables, {
      props: { tables: forms.tables, formExamples, cardId: card.id, negatedForms: ['niedobry'] },
    })
    expect(wrapper.text()).toContain('Отрицание образуется приставкой')
    expect(wrapper.find('.form-example-list summary').text()).toContain('Все примеры к формам (1)')
    const button = wrapper.find('button.form-button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-expanded')).toBe('false')
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.form-example').text()).toContain('Я готовлю обед.')
  })

  it('makes an analytic future cell clickable', async () => {
    const tables = [
      {
        title: 'Будущее время',
        columns: ['Ед. ч.'],
        rows: [{ label: '1-е лицо', cells: [['będę robić']] }],
        extra: false,
      },
    ]
    const formExamples = [
      {
        form: 'będę robić',
        pl: 'Będę robić obiad.',
        ru: 'Я буду готовить обед.',
        source: { kind: 'authored' as const },
      },
    ]
    const wrapper = await mountSuspended(FormsTables, {
      props: { tables, formExamples, cardId: card.id, negatedForms: [] },
    })
    const button = wrapper.find('button.form-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('będę robić')
    await button.trigger('click')
    expect(wrapper.find('.form-example').text()).toContain('Я буду готовить обед.')
    expect(wrapper.find('.form-example strong').text()).toBe('Będę robić')
  })

  it("shows only the clicked row's examples for a form that fills two rows", async () => {
    const tables = [
      {
        title: 'Склонение',
        columns: ['Ед. ч.'],
        rows: [
          { label: 'Предложный', cells: [['tchórzu']] },
          { label: 'Звательный', cells: [['tchórzu']] },
        ],
        extra: false,
      },
    ]
    const ex = (pl: string, ru: string, cell?: string) => ({
      form: 'tchórzu',
      pl,
      ru,
      source: { kind: 'authored' as const },
      ...(cell ? { cell } : {}),
    })
    const formExamples = [
      ex('O tym tchórzu mówiono.', 'Об этом трусе говорили.', 'Предложный'),
      ex('Tchórzu, wróć!', 'Трус, вернись!', 'Звательный'),
      ex('W tym tchórzu jest odwaga.', 'В этом трусе есть смелость.'),
    ]
    const wrapper = await mountSuspended(FormsTables, {
      props: { tables, formExamples, cardId: card.id, negatedForms: [] },
    })
    const [loc, voc] = wrapper.findAll('button.form-button')
    await loc!.trigger('click')
    expect(loc!.classes()).toContain('active')
    expect(voc!.classes()).not.toContain('active')
    const panel = wrapper.find('.form-example').text()
    expect(panel).toContain('Об этом трусе говорили.')
    expect(panel).not.toContain('Трус, вернись!')
    expect(panel).toContain('Та же форма — предложный и звательный:')
    expect(panel).toContain('В этом трусе есть смелость.')
    await voc!.trigger('click')
    expect(wrapper.find('.form-example').text()).toContain('Трус, вернись!')
    expect(wrapper.find('.form-example').text()).not.toContain('Об этом трусе говорили.')
  })

  it('renders an origin section only when there is something to show', async () => {
    const empty = await mountSuspended(Origin, { props: {} })
    expect(empty.find('section').exists()).toBe(false)
    const filled = await mountSuspended(Origin, {
      props: { etymology: 'От праславянского.', memory: 'Приставка z- как русское с-.' },
    })
    expect(filled.text()).toContain('От праславянского.')
    expect(filled.text()).toContain('Приставка z- как русское с-.')
  })
})
