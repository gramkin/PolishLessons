import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('search finds ząb when typing zab and opens the vocabulary row', async ({ page }) => {
  await gotoHydrated(page, '/')
  await page.keyboard.press('/')
  await page.getByRole('searchbox', { name: 'Поиск' }).fill('zab')

  const words = page.locator('.search-group', { hasText: 'Словарь' })
  await expect(words).toContainText('ząb')
  await words.locator('a.search-hit', { hasText: 'ząb' }).first().click()

  await expect(page).toHaveURL(/\/vocabulary\/?#zab$/)
  await expect(page.locator('tr#zab')).toBeVisible()
})
