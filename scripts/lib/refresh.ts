import { createHash } from 'node:crypto'
import matter from 'gray-matter'
import { parse as parseYaml } from 'yaml'
import type { SearchDoc } from '../../shared/search'
import { bookId } from '../../app/utils/book'
import { lessonPath } from './search-docs'

/**
 * `pnpm preview:refresh` rebuilds only the pages a content edit can reach.
 * `pnpm generate` records a fingerprint of every input; a refresh diffs the
 * working tree against it and maps each change to pages, or to a full build
 * when the change shows up on pages it cannot enumerate.
 */

/**
 * Source path (or `path#frontmatter` / `path#body` for Markdown, `path#header` / `path#body`
 * for a story) → content hash.
 */
export type Fingerprints = Record<string, string>

const STORY_FILE = /^content\/stories\/[a-z0-9-]+\.yml$/
const STORY_HEADER = ['title', 'titleRu', 'chapter'] as const

const hash = (text: string) => createHash('sha1').update(text).digest('hex')

/**
 * Markdown frontmatter feeds the sidebar on every page (titles, order), while
 * the body only feeds its own page, so the two halves are fingerprinted apart.
 */
export function fingerprintFile(path: string, text: string): Fingerprints {
  // A story's title and chapter also show in the reading list under its chapter's last lesson,
  // so they are fingerprinted apart from the text, which only its own page shows.
  if (STORY_FILE.test(path)) {
    const data = (parseYaml(text) ?? {}) as Record<string, unknown>
    const header = STORY_HEADER.map((key) => JSON.stringify(data[key] ?? null)).join('\n')
    return { [`${path}#header`]: hash(header), [`${path}#body`]: hash(text) }
  }
  if (!path.endsWith('.md')) return { [path]: hash(text) }
  const parsed = matter(text)
  return { [`${path}#frontmatter`]: hash(parsed.matter), [`${path}#body`]: hash(parsed.content) }
}

export interface FingerprintDiff {
  added: string[]
  removed: string[]
  changed: string[]
}

export function diffFingerprints(before: Fingerprints, after: Fingerprints): FingerprintDiff {
  const added = Object.keys(after).filter((key) => !(key in before))
  const removed = Object.keys(before).filter((key) => !(key in after))
  const changed = Object.keys(after).filter((key) => key in before && before[key] !== after[key])
  return { added: added.sort(), removed: removed.sort(), changed: changed.sort() }
}

export type RefreshPlan =
  | { kind: 'none' }
  | { kind: 'full'; reason: string }
  | { kind: 'partial'; cardIds: string[]; routes: string[]; searchOwners: string[] }

const CARD = /^content\/(?:dictionary\/([a-z0-9-]+)\.yml|forms\/([a-z0-9-]+)\.json)$/
const PAGE_BODY = /^content\/(lessons\/.+\.md|cheatsheet\.md)#body$/
const STORY = /^content\/stories\/([a-z0-9-]+)\.yml#body$/
const BOOK = /^content\/books\/([a-z0-9-]+)\.yml$/

/**
 * `bookSlugs`: every chapter, since each chapter page shows its neighbours' titles;
 * each book's contents page (`/books/<bookId>`) lists its chapter titles too.
 */
export function planRefresh(diff: FingerprintDiff, bookSlugs: string[] = []): RefreshPlan {
  const touched = [...diff.added, ...diff.removed, ...diff.changed]
  if (touched.length === 0) return { kind: 'none' }
  // A new or deleted file changes navigation, rank neighbours or the sitemap.
  if (diff.added.length > 0) return { kind: 'full', reason: `${diff.added[0]} was added` }
  if (diff.removed.length > 0) return { kind: 'full', reason: `${diff.removed[0]} was removed` }

  const cardIds = new Set<string>()
  const routes = new Set<string>()
  const searchOwners = new Set<string>()
  for (const key of diff.changed) {
    const card = CARD.exec(key)
    const page = PAGE_BODY.exec(key)
    const story = STORY.exec(key)
    const book = BOOK.exec(key)
    if (card) {
      const id = (card[1] ?? card[2])!
      cardIds.add(id)
      routes.add(`/slovo/${id}`)
      routes.add('/vocabulary')
      searchOwners.add(`card:${id}`)
    } else if (page) {
      const file = page[1]!
      if (file === 'cheatsheet.md') {
        routes.add('/cheatsheet')
        searchOwners.add('cheatsheet')
      } else {
        routes.add(lessonPath(file))
        searchOwners.add(`lesson:${lessonPath(file)}`)
      }
    } else if (story) {
      routes.add(`/stories/${story[1]}`)
      routes.add('/stories')
      searchOwners.add(`story:${story[1]}`)
    } else if (book) {
      for (const slug of new Set([book[1]!, ...bookSlugs])) {
        routes.add(`/books/${slug}`)
        routes.add(`/books/${bookId(slug)}`)
      }
      routes.add('/books')
    } else {
      const reason = key
        .replace(/#frontmatter$/, ' (frontmatter)')
        .replace(/#header$/, ' (title or chapter)')
      return { kind: 'full', reason: `${reason} changed` }
    }
  }
  return {
    kind: 'partial',
    cardIds: [...cardIds].sort(),
    routes: [...routes].sort(),
    searchOwners: [...searchOwners].sort(),
  }
}

/**
 * The source a search document came from: `lesson:/lessons/a/b:3` belongs to
 * `lesson:/lessons/a/b`, `story:kot:2` to `story:kot`, `cheatsheet:0` to
 * `cheatsheet`, and `card:x` / `word:x` to themselves.
 */
export function docOwner(id: string): string {
  if (id.startsWith('lesson:') || id.startsWith('cheatsheet:')) return id.replace(/:\d+$/, '')
  if (id.startsWith('story:')) return id.split(':').slice(0, 2).join(':')
  return id
}

/** Swap every document of the given owners for the freshly built ones; keep the rest in place. */
export function patchSearchDocs(
  existing: SearchDoc[],
  fresh: SearchDoc[],
  owners: string[],
): SearchDoc[] {
  const wanted = new Set(owners)
  const replacements = new Map<string, SearchDoc[]>()
  for (const doc of fresh) {
    const owner = docOwner(doc.id)
    if (wanted.has(owner)) replacements.set(owner, [...(replacements.get(owner) ?? []), doc])
  }
  const result: SearchDoc[] = []
  const placed = new Set<string>()
  for (const doc of existing) {
    const owner = docOwner(doc.id)
    if (!wanted.has(owner)) result.push(doc)
    else if (!placed.has(owner)) {
      placed.add(owner)
      result.push(...(replacements.get(owner) ?? []))
    }
  }
  for (const [owner, docs] of replacements) if (!placed.has(owner)) result.push(...docs)
  return result
}

/** Where a prerendered route lives under the public dir. */
export function routeFiles(route: string): string[] {
  const dir = route === '/' ? '' : `${route.replace(/^\//, '')}/`
  return [`${dir}index.html`, `${dir}_payload.json`]
}
