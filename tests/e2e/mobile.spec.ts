import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

test('the sidebar is an overlay that closes after navigation', async ({ page }) => {
  await gotoHydrated(page, '/lessons/01-alphabet/01-letters')
  const sidebar = page.locator('#sidebar')
  await expect(sidebar).not.toBeInViewport()

  await page.getByRole('button', { name: 'Показать или скрыть оглавление' }).click()
  await expect(sidebar).toBeInViewport()

  await sidebar.getByRole('link', { name: /1\.2/ }).click()
  await expect(page).toHaveURL(/\/lessons\/01-alphabet\/02-stress\/?$/)
  await expect(sidebar).not.toBeInViewport()
})

test('tapping a story sentence reveals its translation', async ({ page }) => {
  await gotoHydrated(page, '/stories/kot-i-mysz')
  const first = page.locator('li.pair').first()
  await expect(first.locator('p.ru')).toHaveCount(0)

  await first.locator('p.pl').tap({ position: { x: 4, y: 8 } })
  await expect(first.locator('p.ru')).toHaveCount(1)
  await expect(first.locator('p.ru')).not.toBeEmpty()
})
