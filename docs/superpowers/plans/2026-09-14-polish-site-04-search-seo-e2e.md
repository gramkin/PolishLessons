# Plan 4 — Search, SEO and End-to-End Tests

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full-text search across lessons, words and stories; page titles, descriptions and a sitemap; and browser-level E2E plus automated accessibility tests against the generated static site.

**Architecture:** A build-time script turns `content/` into search documents (`public/search-index.json`). In the browser, `useSearch()` lazily fetches that file on first open and builds a MiniSearch index whose term processing uses the same `normalizeLoose` as the rest of the site, so *zab* finds *ząb* and *ё* matches *е*. Playwright runs against `pnpm generate && pnpm preview`, the exact artifact that will be deployed.

**Tech Stack:** MiniSearch 7, @nuxtjs/sitemap 8, Playwright 1.63, @axe-core/playwright 4.13.

**Spec:** `docs/superpowers/specs/2026-09-14-polish-for-russians-design.md` (§10, §11, §13)

**Prerequisite:** Plans 1–3 complete.

## Global Constraints

All constraints in `2026-09-14-polish-site-00-overview.md` → "Global Constraints" apply. Key ones for this plan:
- Search index is a static file generated before `nuxt generate`; no server.
- Search opens with 🔍, `/`, or the physical `S` key (`event.code === 'KeyS'`, so it also works on a Russian layout); results grouped **Уроки / Словарь / Истории**.
- Accessibility tests use axe tags `wcag2a` and `wcag2aa` on key pages in all three themes; theme colors may be adjusted only to pass them.
- E2E tests rely on sample content: lesson `/lessons/02-sounds/01-rz` with its final quiz, lessons `01-alphabet/01-letters` and `01-alphabet/02-stress`, story `kot-i-mysz`, word `zab` (*ząb*). Plan 5 keeps these or updates `tests/e2e` in the same commit.

---

### Task 1: Search index and search panel

**Files:**
- Create: `shared/search.ts`, `scripts/lib/search-docs.ts`, `scripts/build-search-index.ts`, `app/utils/search.ts`, `app/composables/useSearch.ts`, `app/components/SearchPanel.vue`
- Modify: `package.json` (scripts), `app/components/AppTopbar.vue` (🔍 button), `app/layouts/default.vue` (mount `SearchPanel`), `content/patterns.yml` and `content/words/sample.yml` (add `ą-у` and `zab`)
- Test: `tests/unit/search-docs.test.ts`, `tests/unit/search.test.ts`, `tests/nuxt/search-panel.test.ts`

**Interfaces:**
- Consumes: `ContentBundle`, `loadContent` (Plan 1 Task 4); schemas; `buildNav`, `flattenNav` (Plan 1 Task 5); `normalizeLoose`, `foldDiacritics` (Plan 1 Task 3); `Segment` (Plan 1 Task 3).
- Produces:
  - `shared/search.ts`: `type SearchDocType = 'lesson' | 'word' | 'story'`; `interface SearchDoc { id: string; type: SearchDocType; title: string; text: string; url: string }`
  - `scripts/lib/search-docs.ts`: `lessonPath(file: string): string`; `splitSections(markdown: string): { heading: string | null; body: string }[]` (splits on `##`/`###`); `plainText(markdown: string, words: Map<string, Word>): string` (drops block components, replaces inline `:pl-word`/`:pron`/`:false-friend` with the Polish word, strips Markdown syntax); `buildSearchDocs(bundle: ContentBundle): SearchDoc[]`
  - CLI `pnpm search-index` → `public/search-index.json` containing `{ "docs": SearchDoc[] }`
  - `app/utils/search.ts`: `GROUP_LABELS`; `interface SearchHit` (same fields as `SearchDoc`); `interface SearchGroup { type: SearchDocType; label: string; hits: SearchHit[] }`; `createSearchIndex(docs: SearchDoc[]): MiniSearch<SearchDoc>`; `searchGrouped(index, query: string, limit?: number): SearchGroup[]` (group order lesson → word → story, empty groups dropped, blank query → `[]`); `highlightQuery(text: string, query: string): Segment[]`; `snippet(text: string, query: string, radius?: number): string`
  - `useSearch(): { open: Ref<boolean>; ready: Ref<boolean>; loading: Ref<boolean>; error: Ref<boolean>; ensureIndex(): Promise<void>; search(query: string): SearchGroup[] }` — state key `search:open`; `resetSearch()` test helper
  - `<SearchPanel />` — `.search-overlay` with `input[type=search][aria-label=Поиск]`, `.search-group` sections (`h2` label), hits as links `a.search-hit`; ↑/↓ move `.active`, Enter opens the active hit, Escape or backdrop click closes

- [ ] **Step 1: Install MiniSearch and add scripts**

Run: `pnpm add minisearch@^7.2.0`

In `package.json` set these scripts (keep the others):
```json
    "dev": "pnpm search-index && nuxt dev",
    "generate": "pnpm validate && pnpm search-index && nuxt generate",
    "search-index": "tsx scripts/build-search-index.ts",
```

- [ ] **Step 2: Add sample content used by search tests**

Append to `content/patterns.yml`:
```yaml
  - id: ą-у
    pl: ą
    ru: у
    rule: Носовое ą часто стоит там, где в русском «у».
```

Append to `content/words/sample.yml`:
```yaml
  - id: zab
    pl: ząb
    ru: зуб
    pos: noun
    gender: m
    pron: зомп
    pattern: ą-у
    topic: тело
    chapter: 2
```

Run: `pnpm validate`
Expected: `✓ content is valid`.

- [ ] **Step 3: Write the failing search-docs test**

`tests/unit/search-docs.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import type { ContentBundle } from '../../scripts/lib/load-content'
import { buildSearchDocs, lessonPath, plainText, splitSections } from '../../scripts/lib/search-docs'

const words = [
  { id: 'rzeka', pl: 'rzeka', ru: 'река', pos: 'noun', pron: 'жэ́ка', topic: 'природа', chapter: 1 },
  { id: 'zab', pl: 'ząb', ru: 'зуб', pos: 'noun', pron: 'зомп', topic: 'тело', chapter: 1 },
]

const bundle: ContentBundle = {
  chapters: { path: 'chapters.yml', data: { chapters: [{ number: 1, title: 'Алфавит' }] } },
  patterns: { path: 'patterns.yml', data: { patterns: [{ id: 'x', pl: 'x', ru: 'х', rule: 'r' }] } },
  words: [{ path: 'words/a.yml', data: { words } }],
  stories: [
    {
      path: 'stories/kot.yml',
      data: {
        title: 'Kot',
        titleRu: 'Кот',
        level: 'A1',
        sentences: [{ pl: 'Kot pije wodę.', ru: 'Кот пьёт воду.' }],
      },
    },
  ],
  lessons: [
    {
      path: 'lessons/01-alphabet/01-letters.md',
      frontmatter: { title: 'Буквы', chapter: 1, order: 1, level: 'A1' },
      body: [
        'Вступление про **алфавит**.',
        '',
        '## Особые буквы',
        '',
        '| Буква | Пример |',
        '|---|---|',
        '| ą | :pl-word{id="zab"} |',
        '',
        '::quiz',
        '---',
        'questions:',
        '  - type: input',
        '    q: секрет',
        '    answer: x',
        '---',
        '::',
      ].join('\n'),
    },
  ],
  cheatsheet: { path: 'cheatsheet.md', frontmatter: { title: 'Шпаргалка' }, body: 'Ударение на предпоследний слог.' },
}

describe('helpers', () => {
  it('builds lesson paths from file paths', () => {
    expect(lessonPath('lessons/01-alphabet/01-letters.md')).toBe('/lessons/01-alphabet/01-letters')
  })

  it('splits sections on ## and ### headings', () => {
    const sections = splitSections('intro\n## A\ntext a\n### B\ntext b')
    expect(sections.map((s) => s.heading)).toEqual([null, 'A', 'B'])
    expect(sections[1]!.body.trim()).toBe('text a')
  })

  it('turns Markdown with components into plain text', () => {
    const map = new Map(words.map((w) => [w.id, w as never]))
    expect(plainText('**Слово** :pl-word{id="zab"} и [ссылка](/x).', map)).toBe('Слово ząb и ссылка.')
    expect(plainText('::quiz\n---\nq: секрет\n---\n::\nпосле', map)).toBe('после')
  })
})

describe('buildSearchDocs', () => {
  const docs = buildSearchDocs(bundle)

  it('creates lesson section documents with labels', () => {
    const lessonDocs = docs.filter((d) => d.type === 'lesson' && d.url.startsWith('/lessons'))
    expect(lessonDocs.map((d) => d.title)).toEqual(['1.1 Буквы', '1.1 Буквы › Особые буквы'])
    expect(lessonDocs[1]!.text).toContain('ząb')
    expect(lessonDocs[1]!.text).not.toContain('секрет')
    expect(lessonDocs[0]!.url).toBe('/lessons/01-alphabet/01-letters')
  })

  it('indexes the cheat sheet', () => {
    expect(docs.find((d) => d.url === '/cheatsheet')?.text).toContain('предпоследний')
  })

  it('creates word documents linking to the vocabulary', () => {
    expect(docs.find((d) => d.id === 'word:zab')).toEqual({
      id: 'word:zab',
      type: 'word',
      title: 'ząb — зуб',
      text: 'ząb зуб',
      url: '/vocabulary#zab',
    })
  })

  it('creates story title and sentence documents', () => {
    const storyDocs = docs.filter((d) => d.type === 'story')
    expect(storyDocs.map((d) => d.id)).toEqual(['story:kot', 'story:kot:0'])
    expect(storyDocs[1]).toMatchObject({ text: 'Kot pije wodę. Кот пьёт воду.', url: '/stories/kot' })
  })
})
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm vitest run --project unit tests/unit/search-docs.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 5: Implement `shared/search.ts` and `scripts/lib/search-docs.ts`**

`shared/search.ts`:
```ts
export type SearchDocType = 'lesson' | 'word' | 'story'

export interface SearchDoc {
  id: string
  type: SearchDocType
  title: string
  text: string
  url: string
}
```

`scripts/lib/search-docs.ts`:
```ts
import {
  chapterFileSchema,
  lessonFrontmatterSchema,
  storySchema,
  wordFileSchema,
  type Word,
} from '../../shared/schemas'
import type { SearchDoc } from '../../shared/search'
import { buildNav, flattenNav } from '../../app/utils/nav'
import type { ContentBundle } from './load-content'

const BLOCK_COMPONENT = /^::[a-z][\w-]*[^\n]*\n[\s\S]*?^::[ \t]*$/gm
const INLINE_COMPONENT = /:[a-z][\w-]*\{([^}]*)\}/g

export function lessonPath(file: string): string {
  return `/${file.replace(/\.md$/, '')}`
}

export function splitSections(markdown: string): { heading: string | null; body: string }[] {
  const sections: { heading: string | null; body: string }[] = [{ heading: null, body: '' }]
  for (const line of markdown.split('\n')) {
    const heading = /^#{2,3}\s+(.+)$/.exec(line)
    if (heading) sections.push({ heading: heading[1]!.trim(), body: '' })
    else sections[sections.length - 1]!.body += `${line}\n`
  }
  return sections
}

export function plainText(markdown: string, words: Map<string, Word>): string {
  return markdown
    .replace(BLOCK_COMPONENT, ' ')
    .replace(INLINE_COMPONENT, (_match, attrs: string) => {
      const id = /\bid="([^"]+)"/.exec(attrs)?.[1]
      const pl = /\bpl="([^"]+)"/.exec(attrs)?.[1]
      return ` ${(id ? words.get(id)?.pl : undefined) ?? pl ?? ''} `
    })
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1 ')
    .replace(/^\|?[\s:|-]+\|?$/gm, ' ')
    .replace(/[|*_`>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim()
}

function sectionDocs(
  idPrefix: string,
  baseTitle: string,
  url: string,
  body: string,
  words: Map<string, Word>,
): SearchDoc[] {
  return splitSections(body).map((section, i) => ({
    id: `${idPrefix}:${i}`,
    type: 'lesson',
    title: section.heading ? `${baseTitle} › ${plainText(section.heading, words)}` : baseTitle,
    text: plainText(section.body, words),
    url,
  }))
}

export function buildSearchDocs(bundle: ContentBundle): SearchDoc[] {
  const words = new Map<string, Word>()
  for (const file of bundle.words) {
    const parsed = wordFileSchema.safeParse(file.data)
    if (parsed.success) parsed.data.words.forEach((w) => words.set(w.id, w))
  }

  const chapters = bundle.chapters ? chapterFileSchema.safeParse(bundle.chapters.data) : null
  const lessons = bundle.lessons.flatMap((file) => {
    const meta = lessonFrontmatterSchema.safeParse(file.frontmatter)
    if (!meta.success) return []
    return [{ ...meta.data, path: lessonPath(file.path), body: file.body }]
  })
  const labels = new Map(
    flattenNav(buildNav(lessons, chapters?.success ? chapters.data.chapters : [])).map((l) => [
      l.path,
      l.label,
    ]),
  )

  const docs: SearchDoc[] = []

  for (const lesson of lessons) {
    const label = labels.get(lesson.path)
    const title = label ? `${label} ${lesson.title}` : lesson.title
    docs.push(...sectionDocs(`lesson:${lesson.path}`, title, lesson.path, lesson.body, words))
  }

  if (bundle.cheatsheet) {
    docs.push(...sectionDocs('cheatsheet', 'Шпаргалка', '/cheatsheet', bundle.cheatsheet.body, words))
  }

  for (const word of words.values()) {
    docs.push({
      id: `word:${word.id}`,
      type: 'word',
      title: `${word.pl} — ${word.ru}`,
      text: [word.pl, word.ru, word.falseFriend?.ru].filter(Boolean).join(' '),
      url: `/vocabulary#${word.id}`,
    })
  }

  for (const file of bundle.stories) {
    const story = storySchema.safeParse(file.data)
    if (!story.success) continue
    const slug = file.path.replace(/^stories\//, '').replace(/\.yml$/, '')
    const url = `/stories/${slug}`
    docs.push({
      id: `story:${slug}`,
      type: 'story',
      title: `${story.data.title} — ${story.data.titleRu}`,
      text: story.data.description ?? '',
      url,
    })
    story.data.sentences.forEach((sentence, i) => {
      docs.push({
        id: `story:${slug}:${i}`,
        type: 'story',
        title: story.data.title,
        text: `${sentence.pl} ${sentence.ru}`,
        url,
      })
    })
  }

  return docs
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm vitest run --project unit tests/unit/search-docs.test.ts`
Expected: PASS (7 tests). If only an exact `plainText` spacing assertion fails, keep the implementation and change that one expected string to the actual output — spacing is irrelevant to search.

- [ ] **Step 7: Create the CLI `scripts/build-search-index.ts`**

```ts
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadContent } from './lib/load-content'
import { buildSearchDocs } from './lib/search-docs'

const docs = buildSearchDocs(loadContent(resolve(process.cwd(), 'content')))
mkdirSync(resolve(process.cwd(), 'public'), { recursive: true })
writeFileSync(resolve(process.cwd(), 'public/search-index.json'), JSON.stringify({ docs }))
console.log(`✓ search index: ${docs.length} documents`)
```

Run: `pnpm search-index`
Expected: `✓ search index: N documents` with N > 0; `public/search-index.json` exists.

- [ ] **Step 8: Write the failing search utils test**

`tests/unit/search.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import type { SearchDoc } from '../../shared/search'
import { createSearchIndex, highlightQuery, searchGrouped, snippet } from '../../app/utils/search'

const docs: SearchDoc[] = [
  { id: 'lesson:a:0', type: 'lesson', title: '2.1 rz и р', text: 'Сравните rzeka и река', url: '/lessons/a' },
  { id: 'word:zab', type: 'word', title: 'ząb — зуб', text: 'ząb зуб', url: '/vocabulary#zab' },
  { id: 'word:rzeka', type: 'word', title: 'rzeka — река', text: 'rzeka река', url: '/vocabulary#rzeka' },
  { id: 'story:kot:0', type: 'story', title: 'Kot i mysz', text: 'Kot mieszka nad rzeką. Кот живёт у реки.', url: '/stories/kot' },
]

const index = createSearchIndex(docs)

describe('searchGrouped', () => {
  it('finds Polish words typed without diacritics', () => {
    const groups = searchGrouped(index, 'zab')
    expect(groups.map((g) => g.label)).toEqual(['Словарь'])
    expect(groups[0]!.hits[0]).toMatchObject({ title: 'ząb — зуб', url: '/vocabulary#zab' })
  })

  it('groups results in lesson, word, story order', () => {
    const groups = searchGrouped(index, 'река')
    expect(groups.map((g) => g.type).slice(0, 2)).toEqual(['lesson', 'word'])
  })

  it('matches ё and е interchangeably and supports prefixes', () => {
    expect(searchGrouped(index, 'живе').map((g) => g.type)).toEqual(['story'])
  })

  it('returns nothing for a blank query', () => {
    expect(searchGrouped(index, '   ')).toEqual([])
  })
})

describe('highlightQuery', () => {
  it('marks matches regardless of case and diacritics', () => {
    expect(highlightQuery('Ząb i zęby', 'zab')).toEqual([
      { text: 'Ząb', hl: true },
      { text: ' i zęby', hl: false },
    ])
  })

  it('returns plain text for an empty query', () => {
    expect(highlightQuery('dom', '')).toEqual([{ text: 'dom', hl: false }])
  })
})

describe('snippet', () => {
  it('keeps short texts intact', () => {
    expect(snippet('krótki tekst', 'tekst')).toBe('krótki tekst')
  })

  it('cuts long texts around the first match', () => {
    const text = `${'a '.repeat(100)}rzeka${' b'.repeat(100)}`
    const result = snippet(text, 'rzeka', 10)
    expect(result.startsWith('…')).toBe(true)
    expect(result.endsWith('…')).toBe(true)
    expect(result).toContain('rzeka')
  })
})
```

- [ ] **Step 9: Run it to verify it fails**

Run: `pnpm vitest run --project unit tests/unit/search.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 10: Implement `app/utils/search.ts`**

```ts
import MiniSearch from 'minisearch'
import type { SearchDoc, SearchDocType } from '../../shared/search'
import { foldDiacritics, normalizeLoose } from './normalize'
import type { Segment } from './pattern'

export const GROUP_LABELS: Record<SearchDocType, string> = {
  lesson: 'Уроки',
  word: 'Словарь',
  story: 'Истории',
}

const GROUP_ORDER: SearchDocType[] = ['lesson', 'word', 'story']

export type SearchHit = SearchDoc

export interface SearchGroup {
  type: SearchDocType
  label: string
  hits: SearchHit[]
}

export function createSearchIndex(docs: SearchDoc[]): MiniSearch<SearchDoc> {
  const index = new MiniSearch<SearchDoc>({
    fields: ['title', 'text'],
    storeFields: ['type', 'title', 'text', 'url'],
    processTerm: (term) => normalizeLoose(term) || null,
    searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 2 }, combineWith: 'AND' },
  })
  index.addAll(docs)
  return index
}

export function searchGrouped(
  index: MiniSearch<SearchDoc>,
  query: string,
  limit = 8,
): SearchGroup[] {
  if (!normalizeLoose(query)) return []
  const results = index.search(query)
  return GROUP_ORDER.map((type) => ({
    type,
    label: GROUP_LABELS[type],
    hits: results
      .filter((r) => r.type === type)
      .slice(0, limit)
      .map((r) => ({ id: String(r.id), type, title: r.title, text: r.text, url: r.url })),
  })).filter((group) => group.hits.length > 0)
}

export function highlightQuery(text: string, query: string): Segment[] {
  const terms = normalizeLoose(query).split(' ').filter(Boolean)
  if (terms.length === 0) return [{ text, hl: false }]

  const haystack = foldDiacritics(text.toLowerCase())
  const marks = new Array<boolean>(text.length).fill(false)
  for (const term of terms) {
    let from = 0
    for (;;) {
      const at = haystack.indexOf(term, from)
      if (at === -1) break
      marks.fill(true, at, at + term.length)
      from = at + term.length
    }
  }

  const segments: Segment[] = []
  for (let i = 0; i < text.length; i++) {
    const last = segments[segments.length - 1]
    if (last && last.hl === marks[i]) last.text += text[i]
    else segments.push({ text: text[i]!, hl: marks[i]! })
  }
  return segments
}

export function snippet(text: string, query: string, radius = 50): string {
  if (text.length <= radius * 2) return text
  const first = normalizeLoose(query).split(' ')[0] ?? ''
  const at = first ? foldDiacritics(text.toLowerCase()).indexOf(first) : -1
  const start = Math.max(0, (at === -1 ? 0 : at) - radius)
  const end = Math.min(text.length, start + radius * 2)
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
}
```

- [ ] **Step 11: Run it to verify it passes**

Run: `pnpm vitest run --project unit tests/unit/search.test.ts`
Expected: PASS (8 tests). If `живе` does not match `живёт` because MiniSearch applies `processTerm` differently at query time, add `processTerm: (term) => normalizeLoose(term) || null` inside `searchOptions` as well.

- [ ] **Step 12: Write the failing `SearchPanel` test**

`tests/nuxt/search-panel.test.ts`:
```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import SearchPanel from '~/components/SearchPanel.vue'
import { resetSearch } from '~/composables/useSearch'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

registerEndpoint('/search-index.json', () => ({
  docs: [
    { id: 'lesson:a:0', type: 'lesson', title: '2.1 rz и р', text: 'rzeka', url: '/lessons/a' },
    { id: 'word:zab', type: 'word', title: 'ząb — зуб', text: 'ząb зуб', url: '/vocabulary#zab' },
  ],
}))

let wrapper: VueWrapper | undefined

beforeEach(() => {
  resetSearch()
  useSearch().open.value = false
})

afterEach(() => {
  wrapper?.unmount()
  navigateToMock.mockReset()
})

async function openWithKey(code: string, key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { code, key }))
  await nextTick()
  await vi.waitFor(() => expect(useSearch().ready.value).toBe(true))
  await nextTick()
}

describe('SearchPanel', () => {
  it('opens with the S key (any layout) and shows grouped results', async () => {
    wrapper = await mountSuspended(SearchPanel)
    expect(wrapper.find('.search-overlay').exists()).toBe(false)

    await openWithKey('KeyS', 'ы')
    expect(wrapper.find('.search-overlay').exists()).toBe(true)

    await wrapper.find('input[type="search"]').setValue('zab')
    const group = wrapper.find('.search-group')
    expect(group.find('h2').text()).toBe('Словарь')
    expect(group.find('mark').text()).toBe('ząb')
  })

  it('opens the active result with Enter and closes', async () => {
    wrapper = await mountSuspended(SearchPanel)
    await openWithKey('Slash', '/')
    const input = wrapper.find('input[type="search"]')
    await input.setValue('zab')
    await input.trigger('keydown', { key: 'Enter' })
    expect(navigateToMock).toHaveBeenCalledWith('/vocabulary#zab')
    expect(wrapper.find('.search-overlay').exists()).toBe(false)
  })

  it('closes with Escape', async () => {
    wrapper = await mountSuspended(SearchPanel)
    await openWithKey('Slash', '/')
    await wrapper.find('input[type="search"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.search-overlay').exists()).toBe(false)
  })

  it('shows a message when nothing is found', async () => {
    wrapper = await mountSuspended(SearchPanel)
    await openWithKey('Slash', '/')
    await wrapper.find('input[type="search"]').setValue('xyzxyz')
    expect(wrapper.find('.search-status').text()).toBe('Ничего не найдено.')
  })
})
```

- [ ] **Step 13: Run it to verify it fails**

Run: `pnpm vitest run --project nuxt tests/nuxt/search-panel.test.ts`
Expected: FAIL — component/composable not found.

- [ ] **Step 14: Implement `app/composables/useSearch.ts`**

```ts
import type MiniSearch from 'minisearch'
import type { SearchDoc } from '#shared/search'
import { createSearchIndex, searchGrouped, type SearchGroup } from '~/utils/search'

let index: MiniSearch<SearchDoc> | null = null
let pending: Promise<void> | null = null
const ready = ref(false)
const loading = ref(false)
const error = ref(false)

export function resetSearch() {
  index = null
  pending = null
  ready.value = false
  loading.value = false
  error.value = false
}

export function useSearch() {
  const open = useState('search:open', () => false)
  const config = useRuntimeConfig()

  function ensureIndex(): Promise<void> {
    if (index) return Promise.resolve()
    if (!pending) {
      loading.value = true
      error.value = false
      pending = $fetch<{ docs: SearchDoc[] }>(`${config.app.baseURL.replace(/\/$/, '')}/search-index.json`)
        .then((data) => {
          index = createSearchIndex(data.docs)
          ready.value = true
        })
        .catch(() => {
          error.value = true
          pending = null
        })
        .finally(() => {
          loading.value = false
        })
    }
    return pending
  }

  function search(query: string): SearchGroup[] {
    return ready.value && index ? searchGrouped(index, query) : []
  }

  return { open, ready, loading, error, ensureIndex, search }
}
```

- [ ] **Step 15: Implement `app/components/SearchPanel.vue`**

```vue
<script setup lang="ts">
import { highlightQuery, snippet, type SearchHit } from '~/utils/search'

const { open, loading, error, ensureIndex, search } = useSearch()

const query = ref('')
const active = ref(0)
const input = ref<HTMLInputElement | null>(null)

const groups = computed(() => search(query.value))
const flat = computed(() => groups.value.flatMap((group) => group.hits))

watch(query, () => {
  active.value = 0
})

watch(open, async (isOpen) => {
  if (!isOpen) {
    query.value = ''
    return
  }
  await nextTick()
  input.value?.focus()
  await ensureIndex()
})

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (open.value || event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return
  if (event.code === 'KeyS' || event.code === 'Slash' || event.key === '/') {
    event.preventDefault()
    open.value = true
  }
}

function go(hit: SearchHit) {
  open.value = false
  navigateTo(hit.url)
}

function onPanelKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    active.value = Math.min(active.value + 1, Math.max(flat.value.length - 1, 0))
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = Math.max(active.value - 1, 0)
  } else if (event.key === 'Enter') {
    const hit = flat.value[active.value]
    if (hit) {
      event.preventDefault()
      go(hit)
    }
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKeydown))
</script>

<template>
  <div v-if="open" class="search-overlay" @click.self="open = false">
    <div class="search-panel" role="dialog" aria-modal="true" aria-label="Поиск" @keydown="onPanelKeydown">
      <input
        ref="input"
        v-model="query"
        type="search"
        class="search-input"
        placeholder="Поиск по урокам, словам и историям"
        aria-label="Поиск"
        autocomplete="off"
        spellcheck="false"
      />
      <p v-if="loading" class="search-status">Загрузка…</p>
      <p v-else-if="error" class="search-status">Не удалось загрузить поиск.</p>
      <p v-else-if="query.trim() && flat.length === 0" class="search-status">Ничего не найдено.</p>
      <section v-for="group in groups" :key="group.type" class="search-group">
        <h2>{{ group.label }}</h2>
        <ul>
          <li v-for="hit in group.hits" :key="hit.id">
            <NuxtLink
              :to="hit.url"
              class="search-hit"
              :class="{ active: flat.indexOf(hit) === active }"
              @click.prevent="go(hit)"
              @mousemove="active = flat.indexOf(hit)"
            >
              <span class="hit-title">
                <template v-for="(segment, i) in highlightQuery(hit.title, query)" :key="i">
                  <mark v-if="segment.hl">{{ segment.text }}</mark>
                  <template v-else>{{ segment.text }}</template>
                </template>
              </span>
              <span v-if="hit.type !== 'word' && hit.text" class="hit-text">
                <template
                  v-for="(segment, i) in highlightQuery(snippet(hit.text, query), query)"
                  :key="i"
                >
                  <mark v-if="segment.hl">{{ segment.text }}</mark>
                  <template v-else>{{ segment.text }}</template>
                </template>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgb(0 0 0 / 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10vh 1rem 1rem;
}
.search-panel {
  width: 100%;
  max-width: 640px;
  max-height: 75vh;
  overflow-y: auto;
  background: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.25);
}
.search-input {
  width: 100%;
  font: inherit;
  font-size: 1.1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--fg);
}
.search-status {
  color: var(--muted);
}
.search-group h2 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin: 1rem 0 0.25rem;
}
.search-group ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.search-hit {
  display: block;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  color: var(--fg);
}
.search-hit.active {
  background: var(--callout-bg);
  text-decoration: none;
}
.hit-title {
  display: block;
  font-weight: 600;
}
.hit-text {
  display: block;
  font-size: 0.875rem;
  color: var(--muted);
}
mark {
  background: var(--highlight);
  color: inherit;
}
</style>
```

- [ ] **Step 16: Run it to verify it passes**

Run: `pnpm vitest run --project nuxt tests/nuxt/search-panel.test.ts`
Expected: PASS (4 tests). The test fires `keydown` on the input; the panel's `@keydown` handler receives it through bubbling.

- [ ] **Step 17: Wire the panel into the layout and top bar**

In `app/layouts/default.vue` add `<SearchPanel />` as the last child of `<div class="book">`.

In `app/components/AppTopbar.vue` add to the script:
```ts
const { open: searchOpen } = useSearch()
```
and in `.topbar-left` after `<ThemePicker />`:
```vue
      <button
        type="button"
        class="icon-button"
        aria-label="Поиск"
        title="Поиск (S или /)"
        @click="searchOpen = true"
      >
        🔍
      </button>
```

- [ ] **Step 18: Verify generation and manual search**

Run: `pnpm generate`
Expected: exit 0; `.output/public/search-index.json` exists.

Manual (`pnpm preview`): press `/` → type `zab` → «Словарь: ząb — зуб» → Enter opens `/vocabulary#zab` with the row highlighted; `ы` on a Russian keyboard layout also opens search. Stop the server.

- [ ] **Step 19: Full test run, lint, typecheck, commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add full-text search with diacritics-insensitive matching

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 2: Page titles, descriptions and sitemap

**Files:**
- Modify: `nuxt.config.ts` (sitemap module, `site`, prerender), `app/app.vue` (title template, default meta)

**Interfaces:**
- Consumes: `useSeoMeta` calls already present in pages (lessons, stories, vocabulary, flashcards, settings, cheat sheet).
- Produces:
  - `<title>` format `<page title> · Польский для русскоговорящих`; the home page title is just `Польский для русскоговорящих`
  - default `<meta name="description">` and `og:site_name`; pages override `description`
  - `/sitemap.xml` listing every prerendered page; site URL from env `NUXT_SITE_URL` (default `http://localhost:4173` until hosting is decided)

- [ ] **Step 1: Install the sitemap module**

Run: `pnpm add @nuxtjs/sitemap@^8.5.1`

- [ ] **Step 2: Update `nuxt.config.ts`**

Change `modules` to:
```ts
  modules: ['@nuxt/eslint', '@nuxt/content', '@nuxtjs/color-mode', '@nuxt/fonts', '@nuxtjs/sitemap'],
```
and add these top-level keys:
```ts
  site: {
    url: process.env.NUXT_SITE_URL ?? 'http://localhost:4173',
    name: 'Польский для русскоговорящих',
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml'],
      failOnError: true,
    },
  },
```

- [ ] **Step 3: Add the title template and default meta in `app/app.vue`**

```vue
<script setup lang="ts">
const SITE_NAME = 'Польский для русскоговорящих'

useHead({
  titleTemplate: (title) => (title && title !== SITE_NAME ? `${title} · ${SITE_NAME}` : SITE_NAME),
})

useSeoMeta({
  description:
    'Курс польского языка для русскоговорящих: уроки, словарь, карточки и двуязычные истории.',
  ogSiteName: SITE_NAME,
  ogType: 'website',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 4: Generate and verify titles, descriptions and the sitemap**

Run: `pnpm generate`
Expected: exit 0; `/sitemap.xml` listed among prerendered routes.

Run:
```bash
grep -o '<title>[^<]*</title>' .output/public/lessons/01-alphabet/01-letters/index.html
grep -o '<meta name="description"[^>]*>' .output/public/lessons/01-alphabet/01-letters/index.html
grep -c '/lessons/01-alphabet/01-letters' .output/public/sitemap.xml
grep -c '/stories/kot-i-mysz' .output/public/sitemap.xml
```
Expected: `<title>1.1 Буквы · Польский для русскоговорящих</title>`; a description containing «Польский алфавит»; both counts ≥ 1.

If the sitemap does not list lesson or story URLs, register content collections with the sitemap: in `content.config.ts` add `import { asSitemapCollection } from '@nuxtjs/sitemap/content'` and wrap the `lessons` and `cheatsheet` definitions, e.g. `lessons: defineCollection(asSitemapCollection({ type: 'page', source: 'lessons/**/*.md', schema: lessonMetaSchema }))`; stories, vocabulary and flashcards are found by the prerender crawler. Re-run the checks.

- [ ] **Step 5: Lint, typecheck, test, commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add page titles, default meta and sitemap

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: End-to-end and accessibility tests

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/helpers.ts`, `tests/e2e/navigation.spec.ts`, `tests/e2e/quiz.spec.ts`, `tests/e2e/flashcards.spec.ts`, `tests/e2e/theme.spec.ts`, `tests/e2e/search.spec.ts`, `tests/e2e/mobile.spec.ts`, `tests/e2e/seo.spec.ts`, `tests/e2e/a11y.spec.ts`
- Modify: `package.json` (script `test:e2e`); theme colors in `app/assets/css/themes.css` only if axe reports contrast violations

**Interfaces:**
- Consumes: the generated site served by `pnpm preview` at `http://localhost:4173`; selectors documented in earlier tasks (`#sidebar`, `a.active`, `.done`, `a[rel=prev]`, `.book[data-ready]`, `section.quiz`, `.quiz-summary`, `[data-left]`, `[data-right]`, `button.flip`, `button.remember`, `.summary`, `.search-group`, `a.search-hit`, `tr#<id>`, `li.pair`, `p.pl`, `p.ru`).
- Produces: `pnpm test:e2e`; helper `gotoHydrated(page: Page, url: string): Promise<void>` (navigates and waits for `.book[data-ready]`).

- [ ] **Step 1: Install Playwright and axe**

Run:
```bash
pnpm add -D @playwright/test@^1.63.0 @axe-core/playwright@^4.13.0
pnpm exec playwright install chromium
```

Add to `package.json` scripts:
```json
    "test:e2e": "playwright test",
```

- [ ] **Step 2: Create `playwright.config.ts` and the helper**

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: 'pnpm generate && pnpm preview',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})
```

`tests/e2e/helpers.ts`:
```ts
import type { Page } from '@playwright/test'

export async function gotoHydrated(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await page.locator('.book[data-ready]').waitFor()
}
```

- [ ] **Step 3: Write navigation, quiz, flashcards and theme specs**

`tests/e2e/navigation.spec.ts`:
```ts
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
```

`tests/e2e/quiz.spec.ts`:
```ts
import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('passing the final quiz marks the lesson as completed', async ({ page }) => {
  await gotoHydrated(page, '/lessons/02-sounds/01-rz')
  const quiz = page.locator('section.quiz')

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
```

`tests/e2e/flashcards.spec.ts`:
```ts
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
    () => JSON.parse(localStorage.getItem('polski:v1') ?? '{}').cards as Record<string, { box: number }>,
  )
  const boxes = Object.values(cards).map((c) => c.box)
  expect(boxes.length).toBeGreaterThan(0)
  expect(boxes.every((box) => box === 2)).toBe(true)
})
```

`tests/e2e/theme.spec.ts`:
```ts
import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('the chosen theme persists across reloads', async ({ page }) => {
  await gotoHydrated(page, '/')
  await page.getByRole('button', { name: 'Выбрать тему' }).click()
  await page.getByRole('menuitemradio', { name: 'Сепия' }).click()
  await expect(page.locator('html')).toHaveClass(/sepia/)

  await page.reload()
  await expect(page.locator('html')).toHaveClass(/sepia/)
})
```

- [ ] **Step 4: Write search, mobile and SEO specs**

`tests/e2e/search.spec.ts`:
```ts
import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('search finds ząb when typing zab and opens the vocabulary row', async ({ page }) => {
  await gotoHydrated(page, '/')
  await page.keyboard.press('/')
  await page.getByRole('searchbox', { name: 'Поиск' }).fill('zab')

  const words = page.locator('.search-group', { hasText: 'Словарь' })
  await expect(words).toContainText('ząb')
  await words.locator('a.search-hit', { hasText: 'ząb' }).first().click()

  await expect(page).toHaveURL(/\/vocabulary\/?#zab$/)
  await expect(page.locator('tr#zab')).toBeVisible()
})
```

`tests/e2e/mobile.spec.ts`:
```ts
import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

test('the sidebar is an overlay that closes after navigation', async ({ page }) => {
  await gotoHydrated(page, '/lessons/01-alphabet/01-letters')
  const sidebar = page.locator('#sidebar')
  await expect(sidebar).not.toBeInViewport()

  await page.getByRole('button', { name: 'Показать или скрыть оглавление' }).click()
  await expect(sidebar).toBeInViewport()

  await sidebar.getByRole('link', { name: /1\.2/ }).click()
  await expect(page).toHaveURL(/\/lessons\/01-alphabet\/02-stress\/?$/)
  await expect(sidebar).not.toBeInViewport()
})

test('tapping a story sentence reveals its translation', async ({ page }) => {
  await gotoHydrated(page, '/stories/kot-i-mysz')
  const first = page.locator('li.pair').first()
  await expect(first.locator('p.ru')).toHaveCount(0)

  await first.locator('p.pl').tap({ position: { x: 4, y: 8 } })
  await expect(first.locator('p.ru')).toHaveCount(1)
  await expect(first.locator('p.ru')).not.toBeEmpty()
})
```

`tests/e2e/seo.spec.ts`:
```ts
import { expect, test } from '@playwright/test'

test('lesson pages have a title, a description and document language', async ({ page }) => {
  await page.goto('/lessons/01-alphabet/01-letters')
  await expect(page).toHaveTitle('1.1 Буквы · Польский для русскоговорящих')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
})

test('Polish text is marked with lang="pl"', async ({ page }) => {
  await page.goto('/lessons/02-sounds/01-rz')
  expect(await page.locator('main [lang="pl"]').count()).toBeGreaterThan(0)
})

test('the sitemap lists lessons and stories', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.ok()).toBe(true)
  const xml = await response.text()
  expect(xml).toContain('/lessons/01-alphabet/01-letters')
  expect(xml).toContain('/stories/kot-i-mysz')
})
```

- [ ] **Step 5: Write the accessibility spec**

`tests/e2e/a11y.spec.ts`:
```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

const PAGES = [
  '/',
  '/lessons/02-sounds/01-rz',
  '/stories/kot-i-mysz',
  '/vocabulary',
  '/flashcards',
  '/settings',
  '/cheatsheet',
]
const THEMES = ['light', 'sepia', 'dark'] as const

for (const theme of THEMES) {
  for (const path of PAGES) {
    test(`${path} has no WCAG A/AA violations in the ${theme} theme`, async ({ page }) => {
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
```

- [ ] **Step 6: Run the E2E suite**

Run: `pnpm test:e2e`
Expected: all specs PASS (≈ 31 tests). The first run builds the site, so it takes a few minutes.

If a spec fails, fix the cause, not the assertion:
- **Navigation / quiz / flashcards / search / mobile**: open the trace (`pnpm exec playwright show-trace test-results/<test>/trace.zip`) and fix the component behavior.
- **`color-contrast`**: change only the offending variable in `app/assets/css/themes.css` for that theme until the pair reaches 4.5:1 (e.g. darken `--muted` or `--link` in sepia, lighten them in dark). Re-run `pnpm test:e2e tests/e2e/a11y.spec.ts`.
- **`scrollable-region-focusable`**: give the scrolling wrapper `tabindex="0" role="region"` and an `aria-label`.
- **`nested-interactive` / `aria-*`**: fix the markup of the component named in the selector.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: add Playwright end-to-end and axe accessibility tests

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```
