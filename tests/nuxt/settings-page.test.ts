import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SettingsPage from '~/pages/settings.vue'
import { defaultProgress, exportProgress, markLessonRead } from '~/utils/progress'

beforeEach(() => {
  const { replace, loaded } = useProgress()
  replace(defaultProgress())
  loaded.value = true
})

async function upload(wrapper: Awaited<ReturnType<typeof mountSuspended>>, text: string) {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', {
    value: [new File([text], 'progress.json', { type: 'application/json' })],
    configurable: true,
  })
  await input.trigger('change')
  await flushPromises()
}

describe('settings page', () => {
  it('updates settings from radio groups', async () => {
    const wrapper = await mountSuspended(SettingsPage)
    await wrapper.find('input[name="showPron"][value="never"]').setValue(true)
    await wrapper.find('input[name="translationMode"][value="hide"]').setValue(true)
    await wrapper.find('input[name="direction"][value="mixed"]').setValue(true)
    expect(useProgress().progress.value.settings).toEqual({
      showPron: 'never',
      translationMode: 'hide',
      direction: 'mixed',
    })
  })

  it('imports a valid progress file', async () => {
    const wrapper = await mountSuspended(SettingsPage)
    const saved = markLessonRead(defaultProgress(), '/lessons/a', new Date('2026-09-14T10:00:00Z'))
    await upload(wrapper, exportProgress(saved, 'dark'))
    expect(wrapper.find('.settings-message').classes()).toContain('is-ok')
    expect(useProgress().progress.value.lessons['/lessons/a']?.completed).toBe(true)
  })

  it('rejects an invalid file without touching progress', async () => {
    const wrapper = await mountSuspended(SettingsPage)
    await upload(wrapper, '{"version": 42}')
    expect(wrapper.find('.settings-message').classes()).toContain('is-error')
    expect(useProgress().progress.value).toEqual(defaultProgress())
  })
})
