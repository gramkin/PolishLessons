import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import CognateList from '~/components/content/CognateList.vue'

const { wordsApi, patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)
mockNuxtImport('usePatterns', () => patternsApi)

describe('CognateList', () => {
  it('lists words of the pattern sorted, with highlighted groups', async () => {
    const wrapper = await mountSuspended(CognateList, { props: { pattern: 'rz-р' } })
    expect(wrapper.find('figcaption').text()).toContain('Польское rz часто стоит там')

    const rows = wrapper.findAll('tbody tr')
    expect(rows.map((r) => r.find('td').text().trim())).toEqual(['brzeg', 'rzeka'])

    const first = rows[0]!.findAll('td')
    expect(first[0]!.find('mark').text()).toBe('rz')
    expect(first[0]!.attributes('lang')).toBe('pl')
    expect(first[1]!.text().trim()).toBe('берег')
    expect(first[1]!.find('mark').text()).toBe('р')
    expect(first[2]!.text()).toBe('[бжэк]')
  })

  it('renders nothing for an unknown pattern', async () => {
    const wrapper = await mountSuspended(CognateList, { props: { pattern: 'zz-зз' } })
    expect(wrapper.find('figure').exists()).toBe(false)
  })
})
