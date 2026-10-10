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
