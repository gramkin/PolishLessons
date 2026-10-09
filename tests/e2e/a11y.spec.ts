import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

const PAGES = [
  '/',
  '/lessons/02-sounds/01-rz',
  '/stories/kot-i-mysz',
  '/books/alicja-pl-01-krolicza-nora',
  '/vocabulary',
  '/flashcards',
  '/settings',
  '/cheatsheet',
  '/slovo/dom',
  '/slovo/miec',
  '/slovo/zrobic',
  '/sources',
]
const THEMES = ['light', 'sepia', 'dark'] as const

for (const theme of THEMES) {
  for (const path of PAGES) {
    test(`${path} has no WCAG A/AA violations in the ${theme} theme`, async ({ page }) => {
      // 5,000 rows, most with a recording and so a speak button even in voiceless headless Chromium.
      if (path === '/vocabulary') test.setTimeout(180_000)
      await page.addInitScript((value) => localStorage.setItem('polski:theme', value), theme)
      await gotoHydrated(page, path)
      await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`))

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      const violations = results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
      )
      expect(violations).toEqual([])
    })
  }
}
