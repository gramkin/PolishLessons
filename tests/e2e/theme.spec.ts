import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('the chosen theme persists across reloads', async ({ page }) => {
  await gotoHydrated(page, '/')
  await page.getByRole('button', { name: 'Выбрать тему' }).click()
  await page.getByRole('menuitemradio', { name: 'Сепия' }).click()
  await expect(page.locator('html')).toHaveClass(/sepia/)

  await page.reload()
  await expect(page.locator('html')).toHaveClass(/sepia/)
})
