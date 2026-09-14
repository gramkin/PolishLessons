import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('a flashcard session runs to the summary and schedules cards', async ({ page }) => {
  await gotoHydrated(page, '/flashcards')
  await page.locator('input[type="radio"][value="chapter"]').check()
  await page.locator('select[aria-label="Глава"]').selectOption('2')
  await page.getByRole('button', { name: 'Начать' }).click()

  const summary = page.locator('.summary')
  for (let i = 0; i < 30 && !(await summary.isVisible()); i++) {
    await page.locator('button.flip').click()
    await page.locator('button.remember').click()
  }
  await expect(summary).toContainText('Сессия завершена')

  const cards = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('polski:v1') ?? '{}').cards as Record<
        string,
        { box: number }
      >,
  )
  const boxes = Object.values(cards).map((c) => c.box)
  expect(boxes.length).toBeGreaterThan(0)
  expect(boxes.every((box) => box === 2)).toBe(true)
})
