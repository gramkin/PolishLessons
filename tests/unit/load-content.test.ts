import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../../scripts/lib/load-content'

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'polski-content-'))
  mkdirSync(join(root, 'words'))
  mkdirSync(join(root, 'stories'))
  mkdirSync(join(root, 'books'))
  mkdirSync(join(root, 'lessons', '01-alphabet'), { recursive: true })
  writeFileSync(join(root, 'chapters.yml'), 'chapters:\n  - number: 1\n    title: Алфавит\n')
  writeFileSync(join(root, 'words', 'basics.yml'), 'words:\n  - id: dom\n')
  writeFileSync(join(root, 'stories', 'kot.yml'), 'title: Kot\n')
  writeFileSync(join(root, 'books', 'alicja.yml'), 'title: Alicja\n')
  writeFileSync(
    join(root, 'lessons', '01-alphabet', '01-letters.md'),
    '---\ntitle: Буквы\nchapter: 1\n---\n\n# Буквы\n',
  )
  return root
}

describe('loadContent', () => {
  it('reads YAML and Markdown files with relative paths', () => {
    const bundle = loadContent(makeRoot())
    expect(bundle.chapters?.path).toBe('chapters.yml')
    expect(bundle.chapters?.data).toEqual({ chapters: [{ number: 1, title: 'Алфавит' }] })
    expect(bundle.patterns).toBeNull()
    expect(bundle.words.map((f) => f.path)).toEqual(['words/basics.yml'])
    expect(bundle.stories.map((f) => f.path)).toEqual(['stories/kot.yml'])
    expect(bundle.books.map((f) => f.path)).toEqual(['books/alicja.yml'])
    expect(bundle.lessons).toHaveLength(1)
    expect(bundle.lessons[0]?.path).toBe('lessons/01-alphabet/01-letters.md')
    expect(bundle.lessons[0]?.frontmatter).toEqual({ title: 'Буквы', chapter: 1 })
    expect(bundle.lessons[0]?.body).toContain('# Буквы')
    expect(bundle.cheatsheet).toBeNull()
  })

  it('returns an empty bundle for a missing root', () => {
    const bundle = loadContent(join(tmpdir(), 'does-not-exist-polski'))
    expect(bundle).toEqual({
      chapters: null,
      patterns: null,
      words: [],
      stories: [],
      books: [],
      lessons: [],
      cheatsheet: null,
      cards: [],
      forms: [],
    })
  })
})
