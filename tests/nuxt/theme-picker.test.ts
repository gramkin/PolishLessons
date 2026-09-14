import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ThemePicker from '~/components/ThemePicker.vue'

describe('ThemePicker', () => {
  it('opens the menu and selects sepia', async () => {
    const wrapper = await mountSuspended(ThemePicker)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await wrapper.find('button[aria-label="Выбрать тему"]').trigger('click')
    const options = wrapper.findAll('[role="menuitemradio"]')
    expect(options.map((o) => o.text())).toEqual(['Системная', 'Светлая', 'Сепия', 'Тёмная'])

    await wrapper.find('[data-theme="sepia"]').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await wrapper.find('button[aria-label="Выбрать тему"]').trigger('click')
    expect(wrapper.find('[data-theme="sepia"]').attributes('aria-checked')).toBe('true')
  })
})
