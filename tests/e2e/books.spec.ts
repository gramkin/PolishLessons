import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

const FIRST = '/books/alicja-pl-01-krolicza-nora'
const LAST = '/books/alicja-pl-12-zeznanie-alicji'

test('a chapter links on to the next one', async ({ page }) => {
  await gotoHydrated(page, FIRST)
  const nav = page.getByRole('navigation', { name: 'Соседние главы' })
  await expect(nav.locator('a.prev')).toHaveCount(0)
  await expect(nav.locator('a.next')).toContainText('Глава 2')
  await nav.locator('a.next').click()
  await expect(page).toHaveURL(/\/books\/alicja-pl-02-jezioro-lez\/?$/)
  await expect(page.locator('h1')).toHaveText('Jezioro łez')
})

test('the last chapter offers the contents instead of a next chapter', async ({ page }) => {
  await gotoHydrated(page, LAST)
  const nav = page.getByRole('navigation', { name: 'Соседние главы' })
  await expect(nav.locator('a.next')).toHaveCount(0)
  await expect(nav.locator('a.prev')).toContainText('Глава 11')
  await nav.getByRole('link', { name: 'Оглавление' }).click()
  await expect(page).toHaveURL(/\/books\/?$/)
})
