import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompareTable from '~/components/content/CompareTable.vue'
import { resetSpeech } from '~/composables/useSpeech'

const headers = ['Падеж', 'Русский', 'Польский']
const rows = [
  ['Именительный', 'мама', 'mama'],
  ['!Звательный', '—', 'mamo'],
]

describe('CompareTable', () => {
  it('renders headers and rows', async () => {
    const wrapper = await mountSuspended(CompareTable, { props: { headers, rows } })
    expect(wrapper.findAll('th').map((th) => th.text())).toEqual(headers)
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('highlights rows marked with ! and strips the marker', async () => {
    const wrapper = await mountSuspended(CompareTable, { props: { headers, rows } })
    const [plain, diff] = wrapper.findAll('tbody tr')
    expect(plain!.classes()).not.toContain('diff')
    expect(diff!.classes()).toContain('diff')
    expect(diff!.find('td').text()).toContain('Звательный')
    expect(diff!.find('td').text()).not.toContain('!')
  })

  it('marks the last column as Polish by default', async () => {
    const wrapper = await mountSuspended(CompareTable, { props: { headers, rows } })
    const cells = wrapper.find('tbody tr').findAll('td')
    expect(cells[2]!.attributes('lang')).toBe('pl')
    expect(cells[1]!.attributes('lang')).toBeUndefined()
  })

  it('respects explicit Polish columns', async () => {
    const wrapper = await mountSuspended(CompareTable, {
      props: { headers: ['Pl', 'Ru'], rows: [['dom', 'дом']], plColumns: [0] },
    })
    const cells = wrapper.find('tbody tr').findAll('td')
    expect(cells[0]!.attributes('lang')).toBe('pl')
    expect(cells[1]!.attributes('lang')).toBeUndefined()
  })
})

describe('CompareTable audio', () => {
  afterEach(() => {
    resetSpeech()
    vi.unstubAllGlobals()
  })

  it('gives speakable Polish cells a listen button and leaves notation silent', async () => {
    resetSpeech()
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [{ lang: 'pl-PL', localService: true }],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      speak: vi.fn(),
      cancel: vi.fn(),
    })
    const wrapper = await mountSuspended(CompareTable, {
      props: {
        headers: ['Буква', 'Окончание', 'Пример', 'Русский'],
        rows: [['sz', '-esz', 'piszesz', 'пишешь']],
        plColumns: [0, 1, 2],
      },
    })
    const cells = wrapper.find('tbody tr').findAll('td')
    expect(cells[0]!.find('button.speak-button').exists()).toBe(false)
    expect(cells[1]!.find('button.speak-button').exists()).toBe(false)
    expect(cells[2]!.find('button.speak-button').attributes('aria-label')).toBe(
      'Произнести: piszesz',
    )
    expect(cells[3]!.find('button.speak-button').exists()).toBe(false)
  })
})
