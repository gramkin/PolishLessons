import { expect, test } from '@playwright/test'

test('lesson pages have a title, a description and document language', async ({ page }) => {
  await page.goto('/lessons/01-alphabet/01-letters')
  await expect(page).toHaveTitle('1.1 Буквы · Польский для русскоговорящих')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
})

test('Polish text is marked with lang="pl"', async ({ page }) => {
  await page.goto('/lessons/02-sounds/01-rz')
  expect(await page.locator('main [lang="pl"]').count()).toBeGreaterThan(0)
})

test('the sitemap lists lessons and stories', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.ok()).toBe(true)
  const xml = await response.text()
  expect(xml).toContain('/lessons/01-alphabet/01-letters')
  expect(xml).toContain('/stories/kot-i-mysz')
})
