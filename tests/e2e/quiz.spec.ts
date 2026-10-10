import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('passing the final quiz marks the lesson as completed', async ({ page }) => {
  await gotoHydrated(page, '/lessons/02-sounds/01-rz')
  // The final quiz is the lesson's last; section exercises may come before it.
  const quiz = page.locator('section.quiz').last()

  await quiz.getByLabel('rzeka', { exact: true }).check()
  await quiz.locator('form.quiz-text input').fill('brzeg')
  await quiz.getByRole('button', { name: 'Проверить' }).click()
  await quiz.locator('[data-left="rzeka"]').click()
  await quiz.locator('[data-right="река"]').click()
  await quiz.locator('[data-left="brzeg"]').click()
  await quiz.locator('[data-right="берег"]').click()

  await expect(quiz.locator('.quiz-summary')).toContainText('3 из 3')
  const sidebarLink = page.locator('#sidebar a[href="/lessons/02-sounds/01-rz"]')
  await expect(sidebarLink.locator('.done')).toBeVisible()

  await page.reload()
  await page.locator('.book[data-ready]').waitFor()
  await expect(sidebarLink.locator('.done')).toBeVisible()
})
