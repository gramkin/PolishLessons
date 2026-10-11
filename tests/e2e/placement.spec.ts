import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('the home page links to the placement test, which recommends a chapter', async ({ page }) => {
  await gotoHydrated(page, '/')
  await page.getByRole('link', { name: 'Пройдите тест на уровень' }).click()
  await expect(page).toHaveURL(/\/placement\/?$/)

  // Nothing answered: the learner starts at chapter 1, and nothing can be marked as known.
  await page.getByRole('button', { name: 'Показать результат' }).click()
  await expect(page.locator('.recommendation')).toContainText('Начните с главы 1')

  await page.getByRole('button', { name: 'Вернуться к вопросам' }).click()
  const first = page.locator('.quiz-question').first()
  await expect(first).toBeVisible()
})
