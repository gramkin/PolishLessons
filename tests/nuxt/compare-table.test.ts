import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompareTable from '~/components/content/CompareTable.vue'

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
