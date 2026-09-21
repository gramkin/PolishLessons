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

test('a form button reveals its example and the sentence can be saved for study', async ({
  page,
}) => {
  await gotoHydrated(page, '/slovo/zrobic')
  const button = page.locator('button.form-button', { hasText: /^zrobię$/ }).first()
  const block = page.locator('.forms-block', { has: button })
  await expect(block.locator('.form-example .hint')).toBeVisible()
  await button.click()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  const panel = block.locator('.form-example')
  await expect(panel).toContainText('Zrobię to.')
  await expect(panel).toContainText('Я сделаю это.')
  await expect(panel.locator('.form-example-items li')).toHaveCount(3)

  const save = panel.locator('button.save-sentence').first()
  await expect(save).toHaveAttribute('aria-pressed', 'false')
  await save.click()
  await expect(save).toHaveAttribute('aria-pressed', 'true')

  await gotoHydrated(page, '/flashcards')
  await page.getByRole('button', { name: 'Фразы' }).click()
  await expect(page.locator('.counts')).toContainText('Фраз в списке: 1')
  await page.locator('details.phrase-list summary').click()
  await expect(page.locator('.phrase-list')).toContainText('Zrobię to.')
  await page.getByRole('button', { name: 'Начать' }).click()
  await expect(page.locator('.flashcard-session')).toContainText('Zrobię to.')
  await page.locator('button.flip').click()
  await expect(page.locator('.card-back')).toContainText('Я сделаю это.')
  await page.locator('button.remember').click()
  await expect(page.locator('.summary')).toBeVisible()
})

test('the card page shows etymology, a memory hook and idioms', async ({ page }) => {
  await gotoHydrated(page, '/slovo/zrobic')
  await expect(page.locator('#proishozhdenie .etymology')).toContainText('праславянскому')
  await expect(page.locator('#proishozhdenie .memory')).toContainText('Как запомнить')
  await expect(page.locator('#sochetaniya')).toContainText('zrobić wielkie oczy')
  await page.locator('details.form-example-list summary').click()
  await expect(page.locator('details.form-example-list li')).toHaveCount(159)
  await expect(page.locator('details.form-example-list .form-name')).toHaveCount(53)
})
