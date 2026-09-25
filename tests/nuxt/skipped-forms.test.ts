import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FormsTables from '~/components/dictionary/FormsTables.vue'

const IMPERATIVE = 'Повелительного наклонения у musieć нет — приказать «долженствовать» невозможно.'
const PARTICIPLE = 'Действительных причастий на -ący глагол musieć не образует.'

const tables = [
  {
    title: 'Повелительное наклонение',
    columns: ['Форма'],
    rows: [
      { label: '2-е л. ед. ч.', cells: [['muś']] },
      { label: '1-е л. мн. ч.', cells: [['muśmy']] },
    ],
    extra: false,
  },
]

// muś and muśmy are cells of the table above; muszący appears in no table at all.
const skipped = [
  { form: 'muś', reason: IMPERATIVE },
  { form: 'muśmy', reason: IMPERATIVE },
  { form: 'muszący', reason: PARTICIPLE },
]

async function mount() {
  return mountSuspended(FormsTables, {
    props: { tables, formExamples: [], cardId: 'musiec', negatedForms: [], skipped },
  })
}

describe('forms without examples explain themselves', () => {
  it('puts the reason under the table the forms belong to', async () => {
    const wrapper = await mount()
    const note = wrapper.find('.forms-block .table-skips')
    expect(note.exists()).toBe(true)
    expect(note.text()).toContain(IMPERATIVE)
    expect(note.text()).toContain('muś, muśmy')
  })

  it('states a shared reason once rather than per form', async () => {
    const wrapper = await mount()
    expect(wrapper.findAll('.table-skips li')).toHaveLength(1)
  })

  it('mutes a skipped cell instead of making it clickable', async () => {
    const wrapper = await mount()
    expect(wrapper.findAll('span.is-skipped')).toHaveLength(2)
    expect(wrapper.find('button.form-button').exists()).toBe(false)
  })

  it('keeps the standalone list only for forms that appear in no table', async () => {
    const wrapper = await mount()
    const orphans = wrapper.find('ul.skipped')
    expect(orphans.exists()).toBe(true)
    expect(orphans.text()).toContain('muszący')
    expect(orphans.text()).not.toContain('muśmy')
  })

  it('renders no standalone list when every skipped form sits in a table', async () => {
    const wrapper = await mountSuspended(FormsTables, {
      props: {
        tables,
        formExamples: [],
        cardId: 'musiec',
        negatedForms: [],
        skipped: skipped.slice(0, 2),
      },
    })
    expect(wrapper.find('ul.skipped').exists()).toBe(false)
    expect(wrapper.find('.table-skips').exists()).toBe(true)
  })
})
