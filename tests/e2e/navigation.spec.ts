import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('arrow keys and chevrons move between lessons', async ({ page }) => {
  await gotoHydrated(page, '/lessons/01-alphabet/01-letters')
  await expect(page.locator('#sidebar a.active')).toContainText('1.1')

  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/\/lessons\/01-alphabet\/02-stress\/?$/)
  await expect(page.locator('#sidebar a.active')).toContainText('1.2')

  await page.locator('a[rel="prev"]').click()
  await expect(page).toHaveURL(/\/lessons\/01-alphabet\/01-letters\/?$/)
})

test('hiding the sidebar is remembered', async ({ page }) => {
  await gotoHydrated(page, '/lessons/01-alphabet/01-letters')
  await page.getByRole('button', { name: 'Показать или скрыть оглавление' }).click()
  await expect(page.locator('.book')).toHaveClass(/sidebar-closed/)

  await page.reload()
  await page.locator('.book[data-ready]').waitFor()
  await expect(page.locator('.book')).toHaveClass(/sidebar-closed/)
})
