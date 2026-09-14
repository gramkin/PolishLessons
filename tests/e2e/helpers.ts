import type { Page } from '@playwright/test'

export async function gotoHydrated(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await page.locator('.book[data-ready]').waitFor()
}
