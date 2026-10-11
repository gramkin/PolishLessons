import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('the idioms page lists expressions by frequency and filters them', async ({ page }) => {
  await gotoHydrated(page, '/idioms')
  const rows = page.locator('tbody tr')
  await expect(rows.first().locator('td.rank')).toHaveText('1')
  await expect(rows.first().locator('td.pl')).toContainText('naprawdę?')

  await page.getByLabel('Поиск выражения').fill('kciuki')
  await expect(rows.first().locator('td.pl')).toContainText('kciuki')

  await page.getByLabel('Поиск выражения').fill('')
  await page.getByLabel('Тип').selectOption({ label: 'пословица' })
  for (const kind of await page.locator('tbody td.meta').allTextContents())
    expect(kind).toBe('пословица')
})

test('swearing is hidden until asked for', async ({ page }) => {
  await gotoHydrated(page, '/idioms')
  await page.getByLabel('Поиск выражения').fill('do dupy')
  await expect(page.locator('tbody tr')).toHaveCount(0)
  await page.getByLabel('Показывать грубые').check()
  await expect(page.locator('tbody tr').first()).toContainText('do dupy')
})

test('an expression opens its examples, and an example goes to the phrase cards', async ({
  page,
}) => {
  await gotoHydrated(page, '/idioms')
  const first = page.locator('tbody tr').first()
  await first.getByRole('button', { name: /^примеры \(3\)$/ }).click()
  const examples = first.locator('.idiom-examples li')
  await expect(examples).toHaveCount(3)
  await examples.first().getByRole('button', { name: 'В список фраз' }).click()

  await gotoHydrated(page, '/flashcards')
  await page.getByRole('button', { name: 'Фразы' }).click()
  await expect(page.getByText('Фраз в списке: 1')).toBeVisible()
})

test('the list comes two hundred rows at a time', async ({ page }) => {
  await gotoHydrated(page, '/idioms')
  await expect(page.locator('tbody tr')).toHaveCount(200)
  await page.getByRole('button', { name: /^Показать ещё/ }).click()
  await expect(page.locator('tbody tr')).toHaveCount(400)
})

test('a card shows the examples of its idioms', async ({ page }) => {
  await gotoHydrated(page, '/slovo/kciuk')
  const idiom = page.locator('#sochetaniya li', { hasText: 'trzymać kciuki' })
  await idiom.getByRole('button', { name: /^примеры/ }).click()
  await expect(idiom.locator('.idiom-examples li')).toHaveCount(3)
})
