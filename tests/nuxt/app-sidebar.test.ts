import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppSidebar from '~/components/AppSidebar.vue'
import type { NavChapter } from '~/utils/nav'

const nav: NavChapter[] = [
  {
    number: 1,
    title: 'Алфавит и произношение',
    lessons: [
      { path: '/lessons/01-alphabet/01-letters', title: 'Буквы', label: '1.1' },
      { path: '/lessons/01-alphabet/02-stress', title: 'Ударение', label: '1.2' },
    ],
  },
  {
    number: 2,
    title: 'Звуковые соответствия',
    lessons: [{ path: '/lessons/02-sounds/01-rz', title: 'rz и р', label: '2.1' }],
  },
]

describe('AppSidebar', () => {
  it('renders numbered chapters and opens the current one', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      props: { nav, currentPath: '/lessons/01-alphabet/02-stress' },
    })
    expect(wrapper.text()).toContain('1. Алфавит и произношение')
    expect(wrapper.text()).toContain('2. Звуковые соответствия')
    expect(wrapper.text()).toContain('1.2 Ударение')
    expect(wrapper.text()).not.toContain('2.1 rz и р')
  })

  it('lists the sections before the course', async () => {
    const wrapper = await mountSuspended(AppSidebar, { props: { nav, currentPath: '/' } })
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs.indexOf('/books')).toBeLessThan(hrefs.indexOf('/lessons/01-alphabet/01-letters'))
    expect(wrapper.find('a[href="/cheatsheet"]').text()).toBe('Шпаргалка')
  })

  it('opens and closes a chapter with its toggle', async () => {
    const wrapper = await mountSuspended(AppSidebar, { props: { nav, currentPath: '/' } })
    const toggle = wrapper.findAll('button.chapter-toggle')[1]!
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('2.1 rz и р')
    await toggle.trigger('click')
    expect(wrapper.text()).not.toContain('2.1 rz и р')
  })

  it('opens the chapter of a lesson the reader moves to', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      props: { nav, currentPath: '/lessons/01-alphabet/02-stress' },
    })
    await wrapper.setProps({ currentPath: '/lessons/02-sounds/01-rz' })
    expect(wrapper.text()).toContain('2.1 rz и р')
  })

  it('marks the current lesson', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      props: { nav, currentPath: '/lessons/01-alphabet/02-stress' },
    })
    const active = wrapper.find('ol.section a.active')
    expect(active.text()).toContain('Ударение')
    expect(active.attributes('aria-current')).toBe('page')
  })

  it('shows a check mark for completed lessons', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      props: {
        nav,
        currentPath: '/lessons/01-alphabet/02-stress',
        isCompleted: (path: string) => path === '/lessons/01-alphabet/01-letters',
      },
    })
    expect(wrapper.findAll('.done')).toHaveLength(1)
    expect(
      wrapper.find('ol.section a[href="/lessons/01-alphabet/01-letters"] .done').exists(),
    ).toBe(true)
  })
})
