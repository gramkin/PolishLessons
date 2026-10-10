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

test("a chapter's last lesson leads to the texts readable after it, which end in questions", async ({
  page,
}) => {
  await gotoHydrated(page, '/lessons/03-phrases/03-introductions')
  const reading = page.locator('.chapter-reading')
  await expect(reading).toContainText('Почитать после главы')
  await reading.getByRole('link', { name: 'Kot i mysz' }).click()

  await expect(page).toHaveURL(/\/stories\/kot-i-mysz\/?$/)
  await expect(page.getByRole('heading', { name: 'Вопросы к тексту' })).toBeVisible()
  await expect(page.locator('section.quiz')).toBeVisible()
})

test('a lesson in the middle of a chapter has no reading list', async ({ page }) => {
  await gotoHydrated(page, '/lessons/01-alphabet/01-letters')
  await expect(page.locator('.chapter-reading')).toHaveCount(0)
})
