import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('a lesson word popover links to its detailed card', async ({ page }) => {
  await gotoHydrated(page, '/lessons/01-alphabet/01-letters')
  const word = page
    .locator('.pl-word', { has: page.locator('button.pl-word-trigger', { hasText: /^dom$/ }) })
    .first()
  await word.locator('button.pl-word-trigger').click()
  await word.locator('a.card-more').click()
  await expect(page).toHaveURL(/\/slovo\/dom\/?$/)
  await expect(page.locator('h1')).toHaveText('dom')
})

test('card pages move through words by frequency rank', async ({ page }) => {
  await gotoHydrated(page, '/slovo/miec')
  const next = page.locator('nav[aria-label="Соседние слова"] a[rel="next"]')
  await expect(next).toBeVisible()
  await next.click()
  await expect(page).not.toHaveURL(/\/slovo\/miec\/?$/)
  await page.locator('.book[data-ready]').waitFor()
  await page.keyboard.press('ArrowLeft')
  await expect(page).toHaveURL(/\/slovo\/miec\/?$/)
})

test('search finds a verb by an inflected form', async ({ page }) => {
  await gotoHydrated(page, '/')
  await page.keyboard.press('/')
  await page.getByRole('searchbox', { name: 'Поиск' }).fill('mam')
  await page.locator('a.search-hit', { hasText: 'mieć' }).first().click()
  await expect(page).toHaveURL(/\/slovo\/miec\/?$/)
})

test('verb cards show tense tables and extra forms', async ({ page }) => {
  await gotoHydrated(page, '/slovo/miec')
  await expect(page.locator('caption', { hasText: 'Прошедшее время (ед. ч.)' })).toBeVisible()
  await expect(page.locator('caption', { hasText: 'Безличная форма' })).toBeHidden()
  await page.locator('details.all-forms summary').click()
  await expect(page.locator('caption', { hasText: 'Безличная форма' })).toBeVisible()
})

test('the vocabulary filters by frequency band', async ({ page }) => {
  await gotoHydrated(page, '/vocabulary')
  await page.locator('select[aria-label="Частотность"]').selectOption({ label: '1–200' })
  const ranks = await page.locator('tbody td.rank').allTextContents()
  expect(ranks.length).toBeGreaterThan(0)
  expect(ranks.every((r) => Number(r) >= 1 && Number(r) <= 200)).toBe(true)
  await expect(page.locator('tr#zab')).toHaveCount(0)
})

test('card pages are prerendered and listed in the sitemap', async ({ request }) => {
  const card = await request.get('/slovo/dom')
  expect(card.status()).toBe(200)
  expect(await card.text()).toContain('<h1 lang="pl"')
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('/slovo/dom')
})
