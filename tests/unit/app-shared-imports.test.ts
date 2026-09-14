import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return /\.(ts|vue)$/.test(entry.name) ? [path] : []
  })
}

// Nuxt keeps shared/ external in the server build and emits relative specifiers unchanged,
// which breaks `nuxt generate`. Runtime values from shared/ must go through the #shared alias.
describe('app imports from shared/', () => {
  it('imports runtime values through #shared, not relative paths', () => {
    const offenders = sourceFiles('app').filter((file) =>
      [
        ...readFileSync(file, 'utf8').matchAll(
          /import\s+(type\s+)?\{[^}]*\}\s+from\s+['"](?:\.\.\/)+shared\/[^'"]+['"]/g,
        ),
      ].some((match) => !match[1]),
    )
    expect(offenders).toEqual([])
  })
})
