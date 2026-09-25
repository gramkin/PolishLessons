import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('search finds ząb when typing zab and opens its dictionary card', async ({ page }) => {
  await gotoHydrated(page, '/')
  await page.keyboard.press('/')
  await page.getByRole('searchbox', { name: 'Поиск' }).fill('zab')

  // Ranking guard: ząb is one short word among dozens of entries beginning
  // "zab", and it used to fall outside the eight results the panel shows.
  const words = page.locator('.search-group', { hasText: 'Словарь' })
  await expect(words).toContainText('ząb')
  // ząb has a dictionary card, and buildSearchDocs drops the vocabulary
  // document once a card exists, so the hit leads to the card.
  await words.locator('a.search-hit[href="/slovo/zab"]').click()

  await expect(page).toHaveURL(/\/slovo\/zab\/?$/)
  await expect(page.locator('h1')).toHaveText('ząb')
})
