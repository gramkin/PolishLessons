# Plan 1 — Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A running Nuxt 4 static site with tooling, shared content schemas, a content validator, pure text/navigation utilities, the mdBook-style layout (sidebar, top bar, prev/next, three themes, self-hosted fonts) and a rendered sample lesson.

**Architecture:** See `2026-09-14-polish-site-00-overview.md`. Schemas in `shared/schemas.ts` are the single source of truth for content shape: `content.config.ts` uses them for Nuxt Content collections and `scripts/lib/validate.ts` uses them for build-time validation.

**Tech Stack:** Nuxt 4.5, @nuxt/content 3.16, @nuxtjs/color-mode 4, @nuxt/fonts 0.14, zod 3.25, Vitest 5, @nuxt/test-utils 4, tsx, yaml, gray-matter.

**Spec:** `docs/superpowers/specs/2026-09-14-polish-for-russians-design.md`

## Global Constraints

All constraints in `2026-09-14-polish-site-00-overview.md` → "Global Constraints" apply. Key ones for this plan:
- pnpm only; `zod@^3.25.76` imported from `'zod'`; `typescript@5.9.3`.
- `shared/` and `app/utils/` modules use relative imports only.
- `<html lang="ru">`; Polish text elements get `lang="pl"`.
- Breakpoint `1080px`, content max width `750px`, sidebar `300px`, 16px / 1.6.
- Themes `light` / `sepia` / `dark`, preference `system`, storage key `polski:theme`.

---

### Task 1: Project scaffold and test tooling

**Files:**
- Create: `package.json`, `nuxt.config.ts`, `tsconfig.json`, `app/app.vue`, `app/pages/index.vue`, `.gitignore`, `.prettierrc`, `.prettierignore`, `eslint.config.mjs`, `vitest.config.ts`
- Test: `tests/nuxt/app.test.ts`

**Interfaces:**
- Produces: scripts `dev`, `generate`, `preview`, `test`, `lint`, `format`, `typecheck`, `validate` (implemented in Task 4); Vitest projects `unit` (`tests/unit/**/*.test.ts`, node) and `nuxt` (`tests/nuxt/**/*.test.ts`, nuxt + happy-dom).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "polski",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "pnpm validate && nuxt generate",
    "preview": "serve .output/public -l 4173",
    "postinstall": "nuxt prepare",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . && prettier --check .",
    "format": "prettier --write .",
    "typecheck": "nuxt typecheck",
    "validate": "tsx scripts/validate-content.ts"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["better-sqlite3", "esbuild", "@parcel/watcher"]
  }
}
```

- [ ] **Step 2: Create `.gitignore`, `.prettierrc`, `.prettierignore`**

`.gitignore`:
```
node_modules
.nuxt
.output
.data
dist
test-results
playwright-report
public/search-index.json
*.log
.DS_Store
```

`.prettierrc`:
```json
{ "semi": false, "singleQuote": true, "printWidth": 100, "trailingComma": "all" }
```

`.prettierignore`:
```
.nuxt
.output
.data
pnpm-lock.yaml
content
docs
```

- [ ] **Step 3: Install dependencies**

Run:
```bash
pnpm add nuxt@^4.5.2 zod@^3.25.76 better-sqlite3
pnpm add -D typescript@5.9.3 vue-tsc vitest@^5.0.0 @nuxt/test-utils@^4.3.2 @vue/test-utils happy-dom playwright-core @nuxt/eslint eslint prettier tsx yaml gray-matter serve
```
Expected: both commands finish without `ERR_PNPM` errors. (`postinstall` may warn that `nuxt.config.ts` is missing — ignore, it is created next.)

- [ ] **Step 4: Create `nuxt.config.ts`, `tsconfig.json`, `eslint.config.mjs`**

`nuxt.config.ts`:
```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },
  typescript: { strict: true },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Польский для русскоговорящих',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
})
```

`tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./.nuxt/tsconfig.app.json" },
    { "path": "./.nuxt/tsconfig.server.json" },
    { "path": "./.nuxt/tsconfig.shared.json" },
    { "path": "./.nuxt/tsconfig.node.json" }
  ]
}
```

`eslint.config.mjs`:
```js
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: ['docs/**', 'content/**'],
})
```

- [ ] **Step 5: Create `app/app.vue` and `app/pages/index.vue`**

`app/app.vue`:
```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

`app/pages/index.vue`:
```vue
<template>
  <article class="content">
    <h1>Польский для русскоговорящих</h1>
    <p>Курс польского языка, построенный на сходстве с русским.</p>
  </article>
</template>
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.test.ts'],
          environment: 'nuxt',
          environmentOptions: { nuxt: { domEnvironment: 'happy-dom' } },
        },
      }),
    ],
  },
})
```

- [ ] **Step 7: Write the smoke test**

`tests/nuxt/app.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'

describe('index page', () => {
  it('renders the course title', async () => {
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.text()).toContain('Польский для русскоговорящих')
  })
})
```

- [ ] **Step 8: Prepare Nuxt and run the test**

Run: `pnpm nuxt prepare && pnpm test`
Expected: `tests/nuxt/app.test.ts` PASS (1 test). The `unit` project reports no files — if Vitest exits non-zero because of "No test files found", add `passWithNoTests: true` to the `unit` project's `test` object and re-run.

- [ ] **Step 9: Verify dev server, lint and typecheck**

Run: `pnpm format && pnpm lint && pnpm typecheck`
Expected: all exit 0.

Run: `pnpm dev` in the background, then `curl -s http://localhost:3000 | grep -c 'Польский для русскоговорящих'`
Expected: a number ≥ 1. Stop the dev server.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Nuxt 4 project with Vitest, ESLint and Prettier

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Shared content and quiz schemas

**Files:**
- Create: `shared/schemas.ts`
- Test: `tests/unit/schemas.test.ts`

**Interfaces:**
- Produces (all exported from `shared/schemas.ts`):
  - Constants: `LEVELS`, `POS`, `WORD_ID_RE`
  - Schemas: `levelSchema`, `wordSchema`, `wordFileSchema`, `patternSchema`, `patternFileSchema`, `chapterSchema`, `chapterFileSchema`, `sentenceSchema`, `storySchema`, `lessonMetaSchema`, `lessonFrontmatterSchema`, `questionSchema`, `quizSchema`
  - Types: `Level`, `Word`, `Pattern`, `Chapter`, `Sentence`, `Story`, `LessonMeta`, `LessonFrontmatter`, `Question`, `ChoiceQuestion`, `InputQuestion`, `PatternQuestion`, `MatchQuestion`
  - Schemas are non-strict (Nuxt Content adds its own fields); the validator applies strictness itself.

- [ ] **Step 1: Write the failing tests**

`tests/unit/schemas.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import {
  lessonMetaSchema,
  quizSchema,
  storySchema,
  wordFileSchema,
  wordSchema,
} from '../../shared/schemas'

const word = {
  id: 'rzeka',
  pl: 'rzeka',
  ru: 'река',
  pos: 'noun',
  gender: 'f',
  pron: 'жэ́ка',
  pattern: 'rz-р',
  topic: 'природа',
  chapter: 2,
}

describe('wordSchema', () => {
  it('accepts a complete word', () => {
    expect(wordSchema.parse(word)).toEqual(word)
  })

  it('accepts a false friend without pattern', () => {
    const uroda = {
      id: 'uroda',
      pl: 'uroda',
      ru: 'красота',
      pos: 'noun',
      gender: 'f',
      pron: 'уро́да',
      falseFriend: { ru: 'урод', meaning: 'красота' },
      topic: 'люди',
      chapter: 2,
    }
    expect(wordSchema.safeParse(uroda).success).toBe(true)
  })

  it('rejects non-ASCII ids', () => {
    expect(wordSchema.safeParse({ ...word, id: 'ząb' }).success).toBe(false)
  })

  it('rejects unknown part of speech', () => {
    expect(wordSchema.safeParse({ ...word, pos: 'thing' }).success).toBe(false)
  })

  it('requires at least one word per file', () => {
    expect(wordFileSchema.safeParse({ words: [] }).success).toBe(false)
  })
})

describe('storySchema', () => {
  it('accepts sentences with word form mapping', () => {
    const story = {
      title: 'Kot i mysz',
      titleRu: 'Кот и мышь',
      level: 'A1',
      sentences: [{ pl: 'Kot widzi rzekę.', ru: 'Кот видит реку.', words: { rzekę: 'rzeka' } }],
    }
    expect(storySchema.safeParse(story).success).toBe(true)
  })

  it('rejects unknown level', () => {
    const story = { title: 'X', titleRu: 'Х', level: 'B2', sentences: [{ pl: 'a', ru: 'а' }] }
    expect(storySchema.safeParse(story).success).toBe(false)
  })
})

describe('lessonMetaSchema', () => {
  it('defaults words to an empty array', () => {
    expect(lessonMetaSchema.parse({ chapter: 1, order: 1, level: 'A1' }).words).toEqual([])
  })
})

describe('quizSchema', () => {
  it('accepts all four question types', () => {
    const quiz = [
      { type: 'choice', q: 'Как по-польски «река»?', options: ['rzeka', 'reka'], answer: 0 },
      { type: 'input', q: '«зуб»', answer: 'ząb' },
      { type: 'pattern', q: 'mleko → ?', pattern: 'le-оло', answer: ['молоко'] },
      { type: 'match', q: 'Соедините', pairs: [['rzeka', 'река'], ['ząb', 'зуб']] },
    ]
    expect(quizSchema.safeParse(quiz).success).toBe(true)
  })

  it('rejects a choice answer index outside options', () => {
    const quiz = [{ type: 'choice', q: '?', options: ['a', 'b'], answer: 2 }]
    const result = quizSchema.safeParse(quiz)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual([0, 'answer'])
  })

  it('rejects match with fewer than two pairs', () => {
    const quiz = [{ type: 'match', q: '?', pairs: [['a', 'а']] }]
    expect(quizSchema.safeParse(quiz).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run --project unit tests/unit/schemas.test.ts`
Expected: FAIL — cannot resolve `../../shared/schemas`.

- [ ] **Step 3: Implement `shared/schemas.ts`**

```ts
import { z } from 'zod'

export const LEVELS = ['A1', 'A2'] as const
export const POS = ['noun', 'verb', 'adj', 'adv', 'pron', 'num', 'prep', 'conj', 'part', 'phrase'] as const
export const WORD_ID_RE = /^[a-z0-9-]+$/

const text = z.string().min(1)
const wordId = z.string().regex(WORD_ID_RE)

export const levelSchema = z.enum(LEVELS)

export const wordSchema = z.object({
  id: wordId,
  pl: text,
  ru: text,
  pos: z.enum(POS),
  gender: z.enum(['m', 'f', 'n']).optional(),
  pron: text,
  pattern: text.optional(),
  falseFriend: z.object({ ru: text, meaning: text }).optional(),
  topic: text,
  chapter: z.number().int().positive(),
})
export const wordFileSchema = z.object({ words: z.array(wordSchema).min(1) })

export const patternSchema = z.object({ id: text, pl: text, ru: text, rule: text })
export const patternFileSchema = z.object({ patterns: z.array(patternSchema).min(1) })

export const chapterSchema = z.object({ number: z.number().int().positive(), title: text })
export const chapterFileSchema = z.object({ chapters: z.array(chapterSchema).min(1) })

export const sentenceSchema = z.object({
  pl: text,
  ru: text,
  words: z.record(z.string(), wordId).optional(),
})
export const storySchema = z.object({
  title: text,
  titleRu: text,
  level: levelSchema,
  description: z.string().optional(),
  sentences: z.array(sentenceSchema).min(1),
})

export const lessonMetaSchema = z.object({
  chapter: z.number().int().positive(),
  order: z.number().int().positive(),
  level: levelSchema,
  words: z.array(wordId).default([]),
})
export const lessonFrontmatterSchema = lessonMetaSchema.extend({
  title: text,
  description: z.string().optional(),
})

const explain = z.string().optional()
const textAnswer = z.union([text, z.array(text).min(1)])

const choiceQuestionSchema = z.object({
  type: z.literal('choice'),
  q: text,
  options: z.array(text).min(2),
  answer: z.number().int().nonnegative(),
  explain,
})
const inputQuestionSchema = z.object({ type: z.literal('input'), q: text, answer: textAnswer, explain })
const patternQuestionSchema = z.object({
  type: z.literal('pattern'),
  q: text,
  pattern: text,
  answer: textAnswer,
  explain,
})
const matchQuestionSchema = z.object({
  type: z.literal('match'),
  q: text,
  pairs: z.array(z.tuple([text, text])).min(2).max(6),
  explain,
})

export const questionSchema = z.discriminatedUnion('type', [
  choiceQuestionSchema,
  inputQuestionSchema,
  patternQuestionSchema,
  matchQuestionSchema,
])

export const quizSchema = z
  .array(questionSchema)
  .min(1)
  .superRefine((questions, ctx) => {
    questions.forEach((q, i) => {
      if (q.type === 'choice' && q.answer >= q.options.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [i, 'answer'],
          message: 'answer index out of range',
        })
      }
    })
  })

export type Level = z.infer<typeof levelSchema>
export type Word = z.infer<typeof wordSchema>
export type Pattern = z.infer<typeof patternSchema>
export type Chapter = z.infer<typeof chapterSchema>
export type Sentence = z.infer<typeof sentenceSchema>
export type Story = z.infer<typeof storySchema>
export type LessonMeta = z.infer<typeof lessonMetaSchema>
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>
export type Question = z.infer<typeof questionSchema>
export type ChoiceQuestion = z.infer<typeof choiceQuestionSchema>
export type InputQuestion = z.infer<typeof inputQuestionSchema>
export type PatternQuestion = z.infer<typeof patternQuestionSchema>
export type MatchQuestion = z.infer<typeof matchQuestionSchema>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/schemas.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 5: Commit**

```bash
git add shared/schemas.ts tests/unit/schemas.test.ts
git commit -m "feat: add shared zod schemas for content and quizzes

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 3: Text normalization and pattern highlighting utilities

**Files:**
- Create: `app/utils/normalize.ts`, `app/utils/pattern.ts`
- Test: `tests/unit/normalize.test.ts`, `tests/unit/pattern.test.ts`

**Interfaces:**
- Produces:
  - `normalizeText(s: string): string` — lowercase, trim, collapse whitespace, strip leading/trailing punctuation `.,!?;:«»"„”…`
  - `foldDiacritics(s: string): string` — maps `ą→a ć→c ę→e ł→l ń→n ó→o ś→s ź→z ż→z ё→е` (expects lowercase input; leaves `й` and all other letters intact)
  - `normalizeLoose(s: string): string` — `foldDiacritics(normalizeText(s))`
  - `interface Segment { text: string; hl: boolean }`
  - `findGroup(word: string, group: string): number` — case-insensitive index of first occurrence, `-1` if absent
  - `highlightGroup(word: string, group: string): Segment[]` — splits `word` around the first occurrence of `group`, preserving original casing, omitting empty segments

- [ ] **Step 1: Write the failing tests**

`tests/unit/normalize.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { foldDiacritics, normalizeLoose, normalizeText } from '../../app/utils/normalize'

describe('normalizeText', () => {
  it('lowercases, trims and collapses spaces', () => {
    expect(normalizeText('  Dzień   Dobry ')).toBe('dzień dobry')
  })

  it('strips surrounding punctuation', () => {
    expect(normalizeText('«Cześć!»')).toBe('cześć')
    expect(normalizeText('Jak się masz?')).toBe('jak się masz')
  })
})

describe('foldDiacritics', () => {
  it('folds all Polish diacritics', () => {
    expect(foldDiacritics('ąćęłńóśźż')).toBe('acelnoszz')
  })

  it('folds ё to е but keeps й', () => {
    expect(foldDiacritics('ёжик йогурт')).toBe('ежик йогурт')
  })
})

describe('normalizeLoose', () => {
  it('matches words typed without diacritics', () => {
    expect(normalizeLoose('Żółw')).toBe(normalizeLoose('zolw'))
    expect(normalizeLoose('ZĄB')).toBe('zab')
  })
})
```

`tests/unit/pattern.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { findGroup, highlightGroup } from '../../app/utils/pattern'

describe('findGroup', () => {
  it('finds a group case-insensitively', () => {
    expect(findGroup('Rzeka', 'rz')).toBe(0)
    expect(findGroup('голова', 'оло')).toBe(1)
  })

  it('returns -1 when absent', () => {
    expect(findGroup('reka', 'rz')).toBe(-1)
  })
})

describe('highlightGroup', () => {
  it('highlights a leading group', () => {
    expect(highlightGroup('rzeka', 'rz')).toEqual([
      { text: 'rz', hl: true },
      { text: 'eka', hl: false },
    ])
  })

  it('highlights a middle group and preserves casing', () => {
    expect(highlightGroup('GŁOWA', 'ło')).toEqual([
      { text: 'G', hl: false },
      { text: 'ŁO', hl: true },
      { text: 'WA', hl: false },
    ])
  })

  it('highlights a trailing group', () => {
    expect(highlightGroup('radość', 'ść')).toEqual([
      { text: 'rado', hl: false },
      { text: 'ść', hl: true },
    ])
  })

  it('returns the whole word unhighlighted when the group is absent', () => {
    expect(highlightGroup('dom', 'rz')).toEqual([{ text: 'dom', hl: false }])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run --project unit tests/unit/normalize.test.ts tests/unit/pattern.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `app/utils/normalize.ts`**

```ts
const FOLD: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
  ё: 'е',
}

const EDGE_PUNCTUATION = /^[\s.,!?;:«»"„”…]+|[\s.,!?;:«»"„”…]+$/g

export function normalizeText(s: string): string {
  return s.toLowerCase().replace(EDGE_PUNCTUATION, '').replace(/\s+/g, ' ')
}

export function foldDiacritics(s: string): string {
  return s.replace(/[ąćęłńóśźżё]/g, (c) => FOLD[c] ?? c)
}

export function normalizeLoose(s: string): string {
  return foldDiacritics(normalizeText(s))
}
```

- [ ] **Step 4: Implement `app/utils/pattern.ts`**

```ts
export interface Segment {
  text: string
  hl: boolean
}

export function findGroup(word: string, group: string): number {
  return word.toLowerCase().indexOf(group.toLowerCase())
}

export function highlightGroup(word: string, group: string): Segment[] {
  const index = findGroup(word, group)
  if (index === -1 || group.length === 0) return [{ text: word, hl: false }]
  const end = index + group.length
  const segments: Segment[] = [
    { text: word.slice(0, index), hl: false },
    { text: word.slice(index, end), hl: true },
    { text: word.slice(end), hl: false },
  ]
  return segments.filter((s) => s.text.length > 0)
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/normalize.test.ts tests/unit/pattern.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 6: Commit**

```bash
git add app/utils/normalize.ts app/utils/pattern.ts tests/unit/normalize.test.ts tests/unit/pattern.test.ts
git commit -m "feat: add text normalization and pattern highlighting utils

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Content loader and validator

**Files:**
- Create: `scripts/lib/load-content.ts`, `scripts/lib/validate.ts`, `scripts/validate-content.ts`
- Test: `tests/unit/load-content.test.ts`, `tests/unit/validate.test.ts`

**Interfaces:**
- Consumes: schemas from `shared/schemas.ts` (Task 2); `findGroup` from `app/utils/pattern.ts` (Task 3).
- Produces:
  - `interface DataFile { path: string; data: unknown }` — `path` relative to the content root, e.g. `words/basics.yml`
  - `interface MarkdownFile { path: string; frontmatter: Record<string, unknown>; body: string }`
  - `interface ContentBundle { chapters: DataFile | null; patterns: DataFile | null; words: DataFile[]; stories: DataFile[]; lessons: MarkdownFile[]; cheatsheet: MarkdownFile | null }`
  - `loadContent(root: string): ContentBundle` — missing root or files yield `null` / `[]`, never throws for absence
  - `validateContent(bundle: ContentBundle): string[]` — list of human-readable errors, each prefixed with the file path; empty array means valid
  - `interface ComponentRef { name: string; attrs: Record<string, string> }` and `findComponentRefs(markdown: string): ComponentRef[]` — finds `:name{...}` / `::name{...}` for `pl-word`, `pron`, `false-friend`, `cognate-list`
  - CLI `pnpm validate` exits 1 and prints errors when invalid, prints `✓ content is valid` otherwise

- [ ] **Step 1: Write the failing loader test**

`tests/unit/load-content.test.ts`:
```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../../scripts/lib/load-content'

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'polski-content-'))
  mkdirSync(join(root, 'words'))
  mkdirSync(join(root, 'stories'))
  mkdirSync(join(root, 'lessons', '01-alphabet'), { recursive: true })
  writeFileSync(join(root, 'chapters.yml'), 'chapters:\n  - number: 1\n    title: Алфавит\n')
  writeFileSync(join(root, 'words', 'basics.yml'), 'words:\n  - id: dom\n')
  writeFileSync(join(root, 'stories', 'kot.yml'), 'title: Kot\n')
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
      lessons: [],
      cheatsheet: null,
    })
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project unit tests/unit/load-content.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `scripts/lib/load-content.ts`**

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import matter from 'gray-matter'
import { parse as parseYaml } from 'yaml'

export interface DataFile {
  path: string
  data: unknown
}

export interface MarkdownFile {
  path: string
  frontmatter: Record<string, unknown>
  body: string
}

export interface ContentBundle {
  chapters: DataFile | null
  patterns: DataFile | null
  words: DataFile[]
  stories: DataFile[]
  lessons: MarkdownFile[]
  cheatsheet: MarkdownFile | null
}

function toPosix(root: string, file: string): string {
  return relative(root, file).split(sep).join('/')
}

function listFiles(dir: string, extension: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith(extension))
    .map((name) => join(dir, name))
    .sort()
}

function readData(root: string, file: string): DataFile {
  return { path: toPosix(root, file), data: parseYaml(readFileSync(file, 'utf8')) }
}

function readMarkdown(root: string, file: string): MarkdownFile {
  const parsed = matter(readFileSync(file, 'utf8'))
  return { path: toPosix(root, file), frontmatter: parsed.data, body: parsed.content }
}

function optional<T>(file: string, read: (file: string) => T): T | null {
  return existsSync(file) ? read(file) : null
}

export function loadContent(root: string): ContentBundle {
  return {
    chapters: optional(join(root, 'chapters.yml'), (f) => readData(root, f)),
    patterns: optional(join(root, 'patterns.yml'), (f) => readData(root, f)),
    words: listFiles(join(root, 'words'), '.yml').map((f) => readData(root, f)),
    stories: listFiles(join(root, 'stories'), '.yml').map((f) => readData(root, f)),
    lessons: listFiles(join(root, 'lessons'), '.md').map((f) => readMarkdown(root, f)),
    cheatsheet: optional(join(root, 'cheatsheet.md'), (f) => readMarkdown(root, f)),
  }
}
```

- [ ] **Step 4: Run the loader test to verify it passes**

Run: `pnpm vitest run --project unit tests/unit/load-content.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing validator tests**

`tests/unit/validate.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import type { ContentBundle } from '../../scripts/lib/load-content'
import { findComponentRefs, validateContent } from '../../scripts/lib/validate'

function validBundle(): ContentBundle {
  return {
    chapters: { path: 'chapters.yml', data: { chapters: [{ number: 1, title: 'Алфавит' }] } },
    patterns: {
      path: 'patterns.yml',
      data: { patterns: [{ id: 'rz-р', pl: 'rz', ru: 'р', rule: 'rz часто соответствует р' }] },
    },
    words: [
      {
        path: 'words/basics.yml',
        data: {
          words: [
            { id: 'rzeka', pl: 'rzeka', ru: 'река', pos: 'noun', gender: 'f', pron: 'жэ́ка', pattern: 'rz-р', topic: 'природа', chapter: 1 },
            { id: 'uroda', pl: 'uroda', ru: 'красота', pos: 'noun', gender: 'f', pron: 'уро́да', falseFriend: { ru: 'урод', meaning: 'красота' }, topic: 'люди', chapter: 1 },
          ],
        },
      },
    ],
    stories: [
      {
        path: 'stories/kot.yml',
        data: {
          title: 'Kot i rzeka',
          titleRu: 'Кот и река',
          level: 'A1',
          sentences: [{ pl: 'Kot widzi rzekę.', ru: 'Кот видит реку.', words: { rzekę: 'rzeka' } }],
        },
      },
    ],
    lessons: [
      {
        path: 'lessons/01/01.md',
        frontmatter: { title: 'Буквы', chapter: 1, order: 1, level: 'A1', words: ['rzeka'] },
        body: 'Слово :pl-word{id="rzeka"}.\n\n::cognate-list{pattern="rz-р"}\n::\n\n:false-friend{id="uroda"}\n',
      },
    ],
    cheatsheet: { path: 'cheatsheet.md', frontmatter: { title: 'Шпаргалка' }, body: ':pron{id="rzeka"}' },
  }
}

describe('findComponentRefs', () => {
  it('finds inline and block components with attributes', () => {
    const refs = findComponentRefs(':pl-word{id="rzeka"} and ::cognate-list{pattern="rz-р"}\n::')
    expect(refs).toEqual([
      { name: 'pl-word', attrs: { id: 'rzeka' } },
      { name: 'cognate-list', attrs: { pattern: 'rz-р' } },
    ])
  })

  it('ignores unrelated components', () => {
    expect(findComponentRefs('::quiz\n---\n---\n::')).toEqual([])
  })
})

describe('validateContent', () => {
  it('returns no errors for valid content', () => {
    expect(validateContent(validBundle())).toEqual([])
  })

  it('reports missing chapters and patterns files', () => {
    const bundle = { ...validBundle(), chapters: null, patterns: null }
    const errors = validateContent(bundle)
    expect(errors).toContain('chapters.yml: file is missing')
    expect(errors).toContain('patterns.yml: file is missing')
  })

  it('reports schema errors and unknown keys with file path', () => {
    const bundle = validBundle()
    const words = (bundle.words[0]!.data as { words: Record<string, unknown>[] }).words
    words[0]!.pos = 'thing'
    words[1]!.falsefriend = 'typo'
    const errors = validateContent(bundle)
    expect(errors.some((e) => e.startsWith('words/basics.yml: words.0.pos:'))).toBe(true)
    expect(errors.some((e) => e.startsWith('words/basics.yml: words.1:') && e.includes('falsefriend'))).toBe(true)
  })

  it('reports duplicate word ids across files', () => {
    const bundle = validBundle()
    bundle.words.push({
      path: 'words/more.yml',
      data: { words: [{ id: 'rzeka', pl: 'rzeka', ru: 'река', pos: 'noun', pron: 'жэ́ка', topic: 'x', chapter: 1 }] },
    })
    expect(validateContent(bundle)).toContain(
      'words/more.yml: duplicate word id "rzeka" (first defined in words/basics.yml)',
    )
  })

  it('reports unknown pattern and missing pattern groups', () => {
    const bundle = validBundle()
    const words = (bundle.words[0]!.data as { words: Record<string, unknown>[] }).words
    words[0]!.pl = 'reka'
    words[1]!.pattern = 'nope'
    const errors = validateContent(bundle)
    expect(errors).toContain('words/basics.yml: word "rzeka": group "rz" of pattern "rz-р" not found in "reka"')
    expect(errors).toContain('words/basics.yml: word "uroda": unknown pattern "nope"')
  })

  it('reports unknown chapters for words and lessons', () => {
    const bundle = validBundle()
    const words = (bundle.words[0]!.data as { words: Record<string, unknown>[] }).words
    words[0]!.chapter = 9
    bundle.lessons[0]!.frontmatter.chapter = 7
    const errors = validateContent(bundle)
    expect(errors).toContain('words/basics.yml: word "rzeka": unknown chapter 9')
    expect(errors).toContain('lessons/01/01.md: unknown chapter 7')
  })

  it('reports duplicate chapter/order pairs', () => {
    const bundle = validBundle()
    bundle.lessons.push({ ...bundle.lessons[0]!, path: 'lessons/01/02.md' })
    expect(validateContent(bundle)).toContain(
      'lessons/01/02.md: duplicate chapter 1 order 1 (also lessons/01/01.md)',
    )
  })

  it('reports unknown word ids in lessons, components and stories', () => {
    const bundle = validBundle()
    bundle.lessons[0]!.frontmatter.words = ['ghost']
    bundle.lessons[0]!.body = ':pl-word{id="nope"} ::cognate-list{pattern="zz"}\n:false-friend{id="rzeka"}'
    const story = bundle.stories[0]!.data as { sentences: { words: Record<string, string> }[] }
    story.sentences[0]!.words = { rzekę: 'missing', kotek: 'rzeka' }
    const errors = validateContent(bundle)
    expect(errors).toContain('lessons/01/01.md: unknown word id "ghost" in frontmatter words')
    expect(errors).toContain('lessons/01/01.md: pl-word references unknown word id "nope"')
    expect(errors).toContain('lessons/01/01.md: cognate-list references unknown pattern "zz"')
    expect(errors).toContain('lessons/01/01.md: false-friend id "rzeka" is not a false friend')
    expect(errors).toContain('stories/kot.yml: sentence 1: unknown word id "missing"')
    expect(errors).toContain('stories/kot.yml: sentence 1: form "kotek" not found in Polish text')
  })

  it('reports lesson frontmatter schema errors', () => {
    const bundle = validBundle()
    delete bundle.lessons[0]!.frontmatter.title
    bundle.lessons[0]!.frontmatter.level = 'C1'
    const errors = validateContent(bundle)
    expect(errors.some((e) => e.startsWith('lessons/01/01.md: title:'))).toBe(true)
    expect(errors.some((e) => e.startsWith('lessons/01/01.md: level:'))).toBe(true)
  })
})
```

- [ ] **Step 6: Run them to verify they fail**

Run: `pnpm vitest run --project unit tests/unit/validate.test.ts`
Expected: FAIL — module `scripts/lib/validate` not found.

- [ ] **Step 7: Implement `scripts/lib/validate.ts`**

```ts
import { z } from 'zod'
import {
  chapterFileSchema,
  chapterSchema,
  lessonFrontmatterSchema,
  patternFileSchema,
  patternSchema,
  sentenceSchema,
  storySchema,
  wordFileSchema,
  wordSchema,
  type Pattern,
  type Word,
} from '../../shared/schemas'
import { findGroup } from '../../app/utils/pattern'
import type { ContentBundle, MarkdownFile } from './load-content'

const chapterFileStrict = chapterFileSchema.extend({ chapters: z.array(chapterSchema.strict()).min(1) }).strict()
const patternFileStrict = patternFileSchema.extend({ patterns: z.array(patternSchema.strict()).min(1) }).strict()
const wordFileStrict = wordFileSchema.extend({ words: z.array(wordSchema.strict()).min(1) }).strict()
const storyStrict = storySchema.extend({ sentences: z.array(sentenceSchema.strict()).min(1) }).strict()

const REFERENCE_COMPONENTS = ['pl-word', 'pron', 'false-friend', 'cognate-list']
const COMPONENT_RE = /:{1,2}([a-z][a-z-]*)\{([^}]*)\}/g
const ATTR_RE = /([a-zA-Z][\w-]*)="([^"]*)"/g

export interface ComponentRef {
  name: string
  attrs: Record<string, string>
}

export function findComponentRefs(markdown: string): ComponentRef[] {
  const refs: ComponentRef[] = []
  for (const match of markdown.matchAll(COMPONENT_RE)) {
    const name = match[1]!
    if (!REFERENCE_COMPONENTS.includes(name)) continue
    const attrs: Record<string, string> = {}
    for (const attr of match[2]!.matchAll(ATTR_RE)) attrs[attr[1]!] = attr[2]!
    refs.push({ name, attrs })
  }
  return refs
}

function parseWith<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, data: unknown, path: string, errors: string[]): T | null {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  for (const issue of result.error.issues) {
    const where = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    const keys = issue.code === 'unrecognized_keys' ? ` (${issue.keys.join(', ')})` : ''
    errors.push(`${path}: ${where}${issue.message}${keys}`)
  }
  return null
}

function checkMarkdownRefs(
  file: MarkdownFile,
  words: Map<string, Word>,
  patterns: Map<string, Pattern>,
  errors: string[],
): void {
  for (const ref of findComponentRefs(file.body)) {
    const id = ref.attrs.id
    if (ref.name === 'cognate-list') {
      const pattern = ref.attrs.pattern
      if (!pattern || !patterns.has(pattern)) {
        errors.push(`${file.path}: cognate-list references unknown pattern "${pattern ?? ''}"`)
      }
      continue
    }
    if (id === undefined) {
      if (ref.name === 'pl-word') errors.push(`${file.path}: pl-word is missing id`)
      continue
    }
    const word = words.get(id)
    if (!word) {
      errors.push(`${file.path}: ${ref.name} references unknown word id "${id}"`)
    } else if (ref.name === 'false-friend' && !word.falseFriend) {
      errors.push(`${file.path}: false-friend id "${id}" is not a false friend`)
    }
  }
}

export function validateContent(bundle: ContentBundle): string[] {
  const errors: string[] = []

  const chapterNumbers = new Set<number>()
  if (!bundle.chapters) {
    errors.push('chapters.yml: file is missing')
  } else {
    const parsed = parseWith(chapterFileStrict, bundle.chapters.data, bundle.chapters.path, errors)
    parsed?.chapters.forEach((c) => chapterNumbers.add(c.number))
  }

  const patterns = new Map<string, Pattern>()
  if (!bundle.patterns) {
    errors.push('patterns.yml: file is missing')
  } else {
    const parsed = parseWith(patternFileStrict, bundle.patterns.data, bundle.patterns.path, errors)
    parsed?.patterns.forEach((p) => patterns.set(p.id, p))
  }

  const words = new Map<string, Word>()
  const wordFileOf = new Map<string, string>()
  for (const file of bundle.words) {
    const parsed = parseWith(wordFileStrict, file.data, file.path, errors)
    for (const word of parsed?.words ?? []) {
      const first = wordFileOf.get(word.id)
      if (first) {
        errors.push(`${file.path}: duplicate word id "${word.id}" (first defined in ${first})`)
        continue
      }
      words.set(word.id, word)
      wordFileOf.set(word.id, file.path)

      if (chapterNumbers.size > 0 && !chapterNumbers.has(word.chapter)) {
        errors.push(`${file.path}: word "${word.id}": unknown chapter ${word.chapter}`)
      }
      if (word.pattern !== undefined) {
        const pattern = patterns.get(word.pattern)
        if (!pattern) {
          errors.push(`${file.path}: word "${word.id}": unknown pattern "${word.pattern}"`)
        } else {
          if (findGroup(word.pl, pattern.pl) === -1) {
            errors.push(`${file.path}: word "${word.id}": group "${pattern.pl}" of pattern "${pattern.id}" not found in "${word.pl}"`)
          }
          if (findGroup(word.ru, pattern.ru) === -1) {
            errors.push(`${file.path}: word "${word.id}": group "${pattern.ru}" of pattern "${pattern.id}" not found in "${word.ru}"`)
          }
        }
      }
    }
  }

  const lessonAt = new Map<string, string>()
  for (const file of bundle.lessons) {
    const meta = parseWith(lessonFrontmatterSchema, file.frontmatter, file.path, errors)
    if (meta) {
      if (chapterNumbers.size > 0 && !chapterNumbers.has(meta.chapter)) {
        errors.push(`${file.path}: unknown chapter ${meta.chapter}`)
      }
      const key = `${meta.chapter}:${meta.order}`
      const other = lessonAt.get(key)
      if (other) {
        errors.push(`${file.path}: duplicate chapter ${meta.chapter} order ${meta.order} (also ${other})`)
      } else {
        lessonAt.set(key, file.path)
      }
      for (const id of meta.words) {
        if (!words.has(id)) errors.push(`${file.path}: unknown word id "${id}" in frontmatter words`)
      }
    }
    checkMarkdownRefs(file, words, patterns, errors)
  }

  if (bundle.cheatsheet) checkMarkdownRefs(bundle.cheatsheet, words, patterns, errors)

  for (const file of bundle.stories) {
    const story = parseWith(storyStrict, file.data, file.path, errors)
    story?.sentences.forEach((sentence, index) => {
      for (const [form, id] of Object.entries(sentence.words ?? {})) {
        if (!words.has(id)) {
          errors.push(`${file.path}: sentence ${index + 1}: unknown word id "${id}"`)
        }
        if (!sentence.pl.includes(form)) {
          errors.push(`${file.path}: sentence ${index + 1}: form "${form}" not found in Polish text`)
        }
      }
    })
  }

  return errors
}
```

- [ ] **Step 8: Run validator tests to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/validate.test.ts`
Expected: PASS (10 tests). If the "unknown keys" assertion fails, print `validateContent(bundle)` in the test to see zod's exact message and adjust only the implementation's formatting, not the test's `startsWith`/`includes` intent.

- [ ] **Step 9: Implement the CLI `scripts/validate-content.ts`**

```ts
import { resolve } from 'node:path'
import { loadContent } from './lib/load-content'
import { validateContent } from './lib/validate'

const root = resolve(process.cwd(), 'content')
const errors = validateContent(loadContent(root))

if (errors.length > 0) {
  console.error(`✗ ${errors.length} content error(s):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log('✓ content is valid')
```

- [ ] **Step 10: Check the CLI fails without content**

Run: `pnpm validate; echo "exit=$?"`
Expected: prints `✗ 2 content error(s):` listing `chapters.yml: file is missing` and `patterns.yml: file is missing`, then `exit=1`.

- [ ] **Step 11: Commit**

```bash
git add scripts tests/unit/load-content.test.ts tests/unit/validate.test.ts
git commit -m "feat: add content loader and validator CLI

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 5: Lesson navigation utilities

**Files:**
- Create: `app/utils/nav.ts`
- Test: `tests/unit/nav.test.ts`

**Interfaces:**
- Produces:
  - `interface LessonNavInput { path: string; title: string; chapter: number; order: number }`
  - `interface ChapterInfo { number: number; title: string }`
  - `interface NavLesson { path: string; title: string; label: string }` — `label` is `"<chapter>.<position>"`, position 1-based within the chapter after sorting by `order`
  - `interface NavChapter { number: number; title: string; lessons: NavLesson[] }`
  - `buildNav(lessons: LessonNavInput[], chapters: ChapterInfo[]): NavChapter[]` — chapters sorted by number, lessons by order; chapters without lessons omitted; lessons whose chapter is unknown are omitted
  - `flattenNav(nav: NavChapter[]): NavLesson[]`
  - `normalizePath(path: string): string` — strips a trailing slash (except for `/`) and query/hash
  - `surroundings(flat: NavLesson[], path: string): { prev: NavLesson | null; next: NavLesson | null }`

- [ ] **Step 1: Write the failing tests**

`tests/unit/nav.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { buildNav, flattenNav, normalizePath, surroundings } from '../../app/utils/nav'

const chapters = [
  { number: 2, title: 'Звуковые соответствия' },
  { number: 1, title: 'Алфавит и произношение' },
  { number: 3, title: 'Первые фразы' },
]

const lessons = [
  { path: '/lessons/02-sounds/01-rz', title: 'rz и р', chapter: 2, order: 1 },
  { path: '/lessons/01-alphabet/02-stress', title: 'Ударение', chapter: 1, order: 5 },
  { path: '/lessons/01-alphabet/01-letters', title: 'Буквы', chapter: 1, order: 1 },
  { path: '/lessons/99-orphan/01', title: 'Сирота', chapter: 99, order: 1 },
]

describe('buildNav', () => {
  it('groups and sorts lessons by chapter and order with position labels', () => {
    expect(buildNav(lessons, chapters)).toEqual([
      {
        number: 1,
        title: 'Алфавит и произношение',
        lessons: [
          { path: '/lessons/01-alphabet/01-letters', title: 'Буквы', label: '1.1' },
          { path: '/lessons/01-alphabet/02-stress', title: 'Ударение', label: '1.2' },
        ],
      },
      {
        number: 2,
        title: 'Звуковые соответствия',
        lessons: [{ path: '/lessons/02-sounds/01-rz', title: 'rz и р', label: '2.1' }],
      },
    ])
  })
})

describe('normalizePath', () => {
  it('removes trailing slash, query and hash', () => {
    expect(normalizePath('/lessons/a/?x=1#top')).toBe('/lessons/a')
    expect(normalizePath('/')).toBe('/')
  })
})

describe('surroundings', () => {
  const flat = flattenNav(buildNav(lessons, chapters))

  it('returns previous and next lessons across chapters', () => {
    const { prev, next } = surroundings(flat, '/lessons/01-alphabet/02-stress/')
    expect(prev?.label).toBe('1.1')
    expect(next?.label).toBe('2.1')
  })

  it('returns null at the edges', () => {
    expect(surroundings(flat, '/lessons/01-alphabet/01-letters').prev).toBeNull()
    expect(surroundings(flat, '/lessons/02-sounds/01-rz').next).toBeNull()
  })

  it('returns nulls for a path that is not a lesson', () => {
    expect(surroundings(flat, '/vocabulary')).toEqual({ prev: null, next: null })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run --project unit tests/unit/nav.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/utils/nav.ts`**

```ts
export interface LessonNavInput {
  path: string
  title: string
  chapter: number
  order: number
}

export interface ChapterInfo {
  number: number
  title: string
}

export interface NavLesson {
  path: string
  title: string
  label: string
}

export interface NavChapter {
  number: number
  title: string
  lessons: NavLesson[]
}

export function buildNav(lessons: LessonNavInput[], chapters: ChapterInfo[]): NavChapter[] {
  return [...chapters]
    .sort((a, b) => a.number - b.number)
    .map((chapter) => ({
      number: chapter.number,
      title: chapter.title,
      lessons: lessons
        .filter((l) => l.chapter === chapter.number)
        .sort((a, b) => a.order - b.order)
        .map((l, i) => ({ path: l.path, title: l.title, label: `${chapter.number}.${i + 1}` })),
    }))
    .filter((chapter) => chapter.lessons.length > 0)
}

export function flattenNav(nav: NavChapter[]): NavLesson[] {
  return nav.flatMap((chapter) => chapter.lessons)
}

export function normalizePath(path: string): string {
  const bare = path.split(/[?#]/)[0] ?? '/'
  return bare.length > 1 ? bare.replace(/\/+$/, '') : bare
}

export function surroundings(
  flat: NavLesson[],
  path: string,
): { prev: NavLesson | null; next: NavLesson | null } {
  const index = flat.findIndex((l) => l.path === normalizePath(path))
  if (index === -1) return { prev: null, next: null }
  return { prev: flat[index - 1] ?? null, next: flat[index + 1] ?? null }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/nav.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add app/utils/nav.ts tests/unit/nav.test.ts
git commit -m "feat: add lesson navigation utilities

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Content collections, sample content and content pages

**Files:**
- Create: `content.config.ts`, `content/chapters.yml`, `content/patterns.yml`, `content/words/sample.yml`, `content/lessons/01-alphabet/01-letters.md`, `content/lessons/01-alphabet/02-stress.md`, `content/lessons/02-sounds/01-rz.md`, `content/cheatsheet.md`, `app/composables/useLessonNav.ts`, `app/pages/lessons/[...slug].vue`, `app/pages/cheatsheet.vue`
- Modify: `nuxt.config.ts` (add `@nuxt/content` module)

**Interfaces:**
- Consumes: schemas (Task 2), `buildNav`, `flattenNav`, `surroundings`, `normalizePath`, `NavChapter`, `NavLesson` (Task 5).
- Produces:
  - Collections: `lessons` (page, `lessons/**/*.md`, schema `lessonMetaSchema`), `cheatsheet` (page, `cheatsheet.md`), `chapters` (data, `chapters.yml`, `chapterFileSchema`), `patterns` (data, `patterns.yml`, `patternFileSchema`), `words` (data, `words/*.yml`, `wordFileSchema`), `stories` (data, `stories/*.yml`, `storySchema`)
  - `useLessonNav(): { nav: ComputedRef<NavChapter[]>; current: ComputedRef<NavLesson | null>; prev: ComputedRef<NavLesson | null>; next: ComputedRef<NavLesson | null>; ready: Promise<unknown> }` — data keys `content:lesson-nav` and `content:chapters`
  - Lesson page renders `<h1>{label} {title}</h1>` followed by the Markdown body (lesson Markdown files have no H1)

- [ ] **Step 1: Install and register Nuxt Content**

Run: `pnpm add @nuxt/content@^3.16.0`

In `nuxt.config.ts` change the modules line to:
```ts
  modules: ['@nuxt/eslint', '@nuxt/content'],
```

- [ ] **Step 2: Create `content.config.ts`**

```ts
import { defineCollection, defineContentConfig } from '@nuxt/content'
import {
  chapterFileSchema,
  lessonMetaSchema,
  patternFileSchema,
  storySchema,
  wordFileSchema,
} from './shared/schemas'

export default defineContentConfig({
  collections: {
    lessons: defineCollection({ type: 'page', source: 'lessons/**/*.md', schema: lessonMetaSchema }),
    cheatsheet: defineCollection({ type: 'page', source: 'cheatsheet.md' }),
    chapters: defineCollection({ type: 'data', source: 'chapters.yml', schema: chapterFileSchema }),
    patterns: defineCollection({ type: 'data', source: 'patterns.yml', schema: patternFileSchema }),
    words: defineCollection({ type: 'data', source: 'words/*.yml', schema: wordFileSchema }),
    stories: defineCollection({ type: 'data', source: 'stories/*.yml', schema: storySchema }),
  },
})
```

- [ ] **Step 3: Create sample content**

`content/chapters.yml`:
```yaml
chapters:
  - number: 1
    title: Алфавит и произношение
  - number: 2
    title: Звуковые соответствия
  - number: 3
    title: Первые фразы
```

`content/patterns.yml`:
```yaml
patterns:
  - id: rz-р
    pl: rz
    ru: р
    rule: Польское rz (звучит как «ж») часто стоит там, где в русском «р».
```

`content/words/sample.yml`:
```yaml
words:
  - id: rzeka
    pl: rzeka
    ru: река
    pos: noun
    gender: f
    pron: жэ́ка
    pattern: rz-р
    topic: природа
    chapter: 2
  - id: uroda
    pl: uroda
    ru: красота
    pos: noun
    gender: f
    pron: уро́да
    falseFriend:
      ru: урод
      meaning: красота, привлекательность
    topic: люди
    chapter: 2
```

`content/lessons/01-alphabet/01-letters.md`:
```md
---
title: Буквы
description: Польский алфавит и чем он отличается от русского.
chapter: 1
order: 1
level: A1
---

Польский язык пользуется латиницей, но звуки в нём очень близки к русским.

## Особые буквы

| Буква | Звук | Пример |
|---|---|---|
| ą | носовое «он» | ząb — зуб |
| ę | носовое «эн» | ręka — рука |
| ł | «у» краткое, как в английском *w* | głowa — голова |
```

`content/lessons/01-alphabet/02-stress.md`:
```md
---
title: Ударение
chapter: 1
order: 2
level: A1
---

В польском ударение почти всегда падает на **предпоследний** слог.
```

`content/lessons/02-sounds/01-rz.md`:
```md
---
title: rz и р
chapter: 2
order: 1
level: A1
words: [rzeka]
---

Сравните: rzeka — река.
```

`content/cheatsheet.md`:
```md
---
title: Шпаргалка
description: Главные соответствия между русским и польским на одной странице.
---

# Шпаргалка

Ударение — на предпоследний слог.
```

- [ ] **Step 4: Verify content passes validation**

Run: `pnpm validate`
Expected: `✓ content is valid`.

- [ ] **Step 5: Create `app/composables/useLessonNav.ts`**

```ts
import { buildNav, flattenNav, normalizePath, surroundings } from '~/utils/nav'

export function useLessonNav() {
  const route = useRoute()

  const lessons = useAsyncData('content:lesson-nav', () =>
    queryCollection('lessons').select('path', 'title', 'chapter', 'order').all(),
  )
  const chapters = useAsyncData('content:chapters', () => queryCollection('chapters').first())

  const nav = computed(() =>
    buildNav(lessons.data.value ?? [], chapters.data.value?.chapters ?? []),
  )
  const flat = computed(() => flattenNav(nav.value))
  const current = computed(
    () => flat.value.find((l) => l.path === normalizePath(route.path)) ?? null,
  )
  const around = computed(() => surroundings(flat.value, route.path))

  return {
    nav,
    current,
    prev: computed(() => around.value.prev),
    next: computed(() => around.value.next),
    ready: Promise.all([lessons, chapters]),
  }
}
```

If `typecheck` later reports that `.select` does not exist on the query builder, remove the `.select(...)` call (the full documents also satisfy `LessonNavInput`).

- [ ] **Step 6: Create the lesson page `app/pages/lessons/[...slug].vue`**

```vue
<script setup lang="ts">
import { normalizePath } from '~/utils/nav'

const route = useRoute()
const path = normalizePath(route.path)

const { current, ready } = useLessonNav()
const { data: page } = await useAsyncData(`lesson:${path}`, () =>
  queryCollection('lessons').path(path).first(),
)
await ready

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Урок не найден', fatal: true })
}

useSeoMeta({
  title: () => (page.value ? `${current.value?.label ?? ''} ${page.value.title}`.trim() : ''),
  description: () => page.value?.description,
})
</script>

<template>
  <article v-if="page" class="content">
    <h1>
      <span v-if="current" class="lesson-label">{{ current.label }}</span>
      {{ page.title }}
    </h1>
    <ContentRenderer :value="page" />
  </article>
</template>
```

- [ ] **Step 7: Create the cheat sheet page `app/pages/cheatsheet.vue`**

```vue
<script setup lang="ts">
const { data: page } = await useAsyncData('content:cheatsheet', () =>
  queryCollection('cheatsheet').first(),
)

useSeoMeta({ title: 'Шпаргалка', description: () => page.value?.description })
</script>

<template>
  <article v-if="page" class="content">
    <ContentRenderer :value="page" />
  </article>
</template>
```

- [ ] **Step 8: Link lessons from the home page (so prerender crawls them until the sidebar exists)**

Replace `app/pages/index.vue` with:
```vue
<script setup lang="ts">
const { nav, ready } = useLessonNav()
await ready
</script>

<template>
  <article class="content">
    <h1>Польский для русскоговорящих</h1>
    <p>Курс польского языка, построенный на сходстве с русским.</p>
    <section v-for="chapter in nav" :key="chapter.number">
      <h2>{{ chapter.number }}. {{ chapter.title }}</h2>
      <ul>
        <li v-for="lesson in chapter.lessons" :key="lesson.path">
          <NuxtLink :to="lesson.path">{{ lesson.label }} {{ lesson.title }}</NuxtLink>
        </li>
      </ul>
    </section>
    <p><NuxtLink to="/cheatsheet">Шпаргалка</NuxtLink></p>
  </article>
</template>
```

Update `tests/nuxt/app.test.ts` expectations to also check a lesson link:
```ts
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'

describe('index page', () => {
  it('renders the course title and chapter list', async () => {
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.text()).toContain('Польский для русскоговорящих')
    expect(wrapper.text()).toContain('1. Алфавит и произношение')
    expect(wrapper.find('a[href="/lessons/01-alphabet/01-letters"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 9: Run tests**

Run: `pnpm nuxt prepare && pnpm test`
Expected: all `unit` and `nuxt` tests PASS. If the `nuxt` project cannot query content in the test environment (empty chapter list), check the Nuxt Content testing docs (`https://content.nuxt.com/docs/advanced/testing` or search "nuxt content vitest") and apply their setup; do not weaken the assertions.

- [ ] **Step 10: Generate the static site and check the output**

Run: `pnpm generate`
Expected: exit 0; the log lists prerendered routes including `/lessons/01-alphabet/01-letters`, `/lessons/02-sounds/01-rz` and `/cheatsheet`.

Run:
```bash
grep -c '1.1' .output/public/lessons/01-alphabet/01-letters/index.html
grep -c 'Особые буквы' .output/public/lessons/01-alphabet/01-letters/index.html
grep -c 'Шпаргалка' .output/public/cheatsheet/index.html
```
Expected: each prints a number ≥ 1.

- [ ] **Step 11: Lint, typecheck, commit**

Run: `pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add content collections, sample content and lesson pages

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 7: mdBook layout — themes, fonts, top bar, sidebar, prev/next

**Files:**
- Create: `app/assets/css/themes.css`, `app/assets/css/base.css`, `app/components/ThemePicker.vue`, `app/components/AppTopbar.vue`, `app/components/AppSidebar.vue`, `app/components/PageNav.vue`, `app/layouts/default.vue`
- Modify: `nuxt.config.ts` (modules, css, colorMode, fonts), `app/pages/index.vue` (remove chapter list — the sidebar now links lessons)
- Test: `tests/nuxt/theme-picker.test.ts`, `tests/nuxt/app-sidebar.test.ts`, `tests/nuxt/page-nav.test.ts`

**Interfaces:**
- Consumes: `useLessonNav()` (Task 6), `NavChapter`, `NavLesson`, `normalizePath` (Task 5).
- Produces:
  - `<ThemePicker />` — sets `useColorMode().preference` to `system | light | sepia | dark`; options are buttons with `data-theme` attribute and `aria-checked`
  - `<AppTopbar :sidebar-open="boolean" @toggle-sidebar />` — has an empty `<div class="topbar-right">` that later plans fill (search, settings)
  - `<AppSidebar :nav="NavChapter[]" :current-path="string" :is-completed="(path: string) => boolean" />` — `isCompleted` optional; renders `✓` (`.done`) when it returns true; static section links come from the local `sections` array (later plans append entries)
  - `<PageNav :prev="NavLesson | null" :next="NavLesson | null" />` — chevrons + ← → keys (ignored while typing or with modifier keys)
  - CSS variables (all themes): `--bg --fg --muted --border --link --accent-pl --cognate --false-friend --callout-bg --code-bg --highlight --sidebar-bg --sidebar-fg --sidebar-active --sidebar-muted --topbar-bg --focus`
  - Utility classes: `.content`, `.icon-button`, `.sr-only`, `.callout`, `.table-wrap`
  - Theme classes on `<html>`: `light`, `sepia`, `dark`

- [ ] **Step 1: Install modules**

Run: `pnpm add @nuxtjs/color-mode@^4.0.1 @nuxt/fonts@^0.14.0`

- [ ] **Step 2: Update `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  modules: ['@nuxt/eslint', '@nuxt/content', '@nuxtjs/color-mode', '@nuxt/fonts'],
  devtools: { enabled: true },
  typescript: { strict: true },
  css: ['~/assets/css/themes.css', '~/assets/css/base.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Польский для русскоговорящих',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'polski:theme',
  },
  fonts: {
    defaults: {
      weights: [400, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
    },
    families: [
      { name: 'Open Sans', provider: 'google' },
      { name: 'Source Code Pro', provider: 'google' },
    ],
  },
})
```

- [ ] **Step 3: Create `app/assets/css/themes.css`**

```css
:root,
html.light {
  --bg: #ffffff;
  --fg: #333333;
  --muted: #6b6b6b;
  --border: #e5e5e5;
  --link: #2b79a2;
  --accent-pl: #1f5fa8;
  --cognate: #2e7d32;
  --false-friend: #c62828;
  --callout-bg: #f6f7f6;
  --code-bg: #f6f7f6;
  --highlight: #fff3b0;
  --sidebar-bg: #fafafa;
  --sidebar-fg: #364149;
  --sidebar-active: #0069c2;
  --sidebar-muted: #6b6b6b;
  --topbar-bg: #ffffff;
  --focus: #1f5fa8;
  color-scheme: light;
}

html.sepia {
  --bg: #e1e1db;
  --fg: #262625;
  --muted: #555550;
  --border: #c7c7c0;
  --link: #1f5f85;
  --accent-pl: #a33333;
  --cognate: #2d6a31;
  --false-friend: #a32020;
  --callout-bg: #d6d6cf;
  --code-bg: #d6d6cf;
  --highlight: #f2e19c;
  --sidebar-bg: #3b2e2a;
  --sidebar-fg: #c8c9db;
  --sidebar-active: #e69f67;
  --sidebar-muted: #a7a8b8;
  --topbar-bg: #e1e1db;
  --focus: #a33333;
  color-scheme: light;
}

html.dark {
  --bg: #141617;
  --fg: #98a3ad;
  --muted: #7d8791;
  --border: #2f3336;
  --link: #2b79a2;
  --accent-pl: #6bb0f0;
  --cognate: #7bc47f;
  --false-friend: #ef7a7a;
  --callout-bg: #1d1f21;
  --code-bg: #1d1f21;
  --highlight: #3a3618;
  --sidebar-bg: #292c2f;
  --sidebar-fg: #a1adb8;
  --sidebar-active: #3473ad;
  --sidebar-muted: #7d8791;
  --topbar-bg: #141617;
  --focus: #6bb0f0;
  color-scheme: dark;
}

html.dark {
  --link: #5fa3d6;
  --sidebar-active: #6aa4dc;
}
```

- [ ] **Step 4: Create `app/assets/css/base.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: 'Open Sans', system-ui, sans-serif;
  line-height: 1.6;
  -webkit-text-size-adjust: 100%;
}

a {
  color: var(--link);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

code,
pre,
.mono {
  font-family: 'Source Code Pro', ui-monospace, monospace;
  font-size: 0.875em;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: 1rem;
  top: 1rem;
  z-index: 100;
  background: var(--bg);
  padding: 0.5rem 1rem;
}

.icon-button {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 1.25rem;
  line-height: 1;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
}
.icon-button:hover {
  color: var(--fg);
}

/* ---------- Book layout ---------- */

.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 300px;
  overflow-y: auto;
  background: var(--sidebar-bg);
  color: var(--sidebar-fg);
  padding: 1rem 0.75rem 2rem;
  font-size: 0.875rem;
  transition: transform 0.3s ease;
  z-index: 20;
}
.sidebar a {
  color: var(--sidebar-fg);
  display: block;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
}
.sidebar a:hover,
.sidebar a.active {
  color: var(--sidebar-active);
  text-decoration: none;
}
.sidebar ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
.sidebar .section {
  padding-left: 1rem;
}
.sidebar .spacer {
  height: 1px;
  margin: 0.75rem 0.5rem;
  background: var(--sidebar-muted);
  opacity: 0.4;
}
.sidebar .done {
  margin-left: 0.25rem;
  color: var(--sidebar-active);
}

.page-wrapper {
  margin-left: 300px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}
.book.sidebar-closed .sidebar {
  transform: translateX(-100%);
}
.book.sidebar-closed .page-wrapper {
  margin-left: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 0.5rem;
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--border);
  transition: transform 0.3s ease;
}
.topbar.hidden {
  transform: translateY(-100%);
}
.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 6rem;
}
.topbar-right {
  justify-content: flex-end;
}
.topbar-title {
  color: var(--fg);
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-picker {
  position: relative;
}
.theme-menu {
  position: absolute;
  top: 100%;
  left: 0;
  list-style: none;
  margin: 0.25rem 0 0;
  padding: 0.25rem 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  z-index: 30;
}
.theme-menu button {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: var(--fg);
  font: inherit;
  padding: 0.35rem 1rem;
  cursor: pointer;
  white-space: nowrap;
}
.theme-menu button[aria-checked='true'] {
  font-weight: 700;
}
.theme-menu button:hover {
  background: var(--callout-bg);
}

.page {
  padding: 0 1rem 4rem;
}

.content {
  max-width: 750px;
  margin: 0 auto;
}
.content h1 {
  margin-top: 1.5rem;
}
.content h2,
.content h3 {
  margin-top: 2rem;
}
.lesson-label {
  color: var(--muted);
  margin-right: 0.25rem;
}
.content table {
  border-collapse: collapse;
  margin: 1rem 0;
}
.content th,
.content td {
  border: 1px solid var(--border);
  padding: 0.35rem 0.75rem;
  text-align: left;
}
.content th {
  background: var(--callout-bg);
}
.table-wrap {
  overflow-x: auto;
}
.callout {
  background: var(--callout-bg);
  border-left: 4px solid var(--border);
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  border-radius: 0 4px 4px 0;
}

/* ---------- Prev / next ---------- */

.page-nav-link {
  position: fixed;
  top: 50px;
  bottom: 0;
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--muted);
}
.page-nav-link:hover {
  color: var(--fg);
  text-decoration: none;
}
.page-nav-link.prev {
  left: 300px;
}
.page-nav-link.next {
  right: 0;
}
.book.sidebar-closed .page-nav-link.prev {
  left: 0;
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 1080px) {
  .page-wrapper,
  .book.sidebar-closed .page-wrapper {
    margin-left: 0;
  }
  .book .sidebar,
  .book:not([data-ready]) .sidebar {
    transform: translateX(-100%);
  }
  .book[data-ready].sidebar-open .sidebar {
    transform: none;
  }
  .book[data-ready].sidebar-open .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.4);
    z-index: 15;
  }
  .page-nav {
    display: flex;
    justify-content: space-between;
    max-width: 750px;
    margin: 0 auto;
    padding: 0 1rem 2rem;
  }
  .page-nav-link,
  .page-nav-link.prev,
  .book.sidebar-closed .page-nav-link.prev {
    position: static;
    width: auto;
    font-size: 2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
    animation: none !important;
  }
}
```

- [ ] **Step 5: Write the failing component tests**

`tests/nuxt/theme-picker.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ThemePicker from '~/components/ThemePicker.vue'

describe('ThemePicker', () => {
  it('opens the menu and selects sepia', async () => {
    const wrapper = await mountSuspended(ThemePicker)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await wrapper.find('button[aria-label="Выбрать тему"]').trigger('click')
    const options = wrapper.findAll('[role="menuitemradio"]')
    expect(options.map((o) => o.text())).toEqual(['Системная', 'Светлая', 'Сепия', 'Тёмная'])

    await wrapper.find('[data-theme="sepia"]').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await wrapper.find('button[aria-label="Выбрать тему"]').trigger('click')
    expect(wrapper.find('[data-theme="sepia"]').attributes('aria-checked')).toBe('true')
  })
})
```

`tests/nuxt/app-sidebar.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppSidebar from '~/components/AppSidebar.vue'
import type { NavChapter } from '~/utils/nav'

const nav: NavChapter[] = [
  {
    number: 1,
    title: 'Алфавит и произношение',
    lessons: [
      { path: '/lessons/01-alphabet/01-letters', title: 'Буквы', label: '1.1' },
      { path: '/lessons/01-alphabet/02-stress', title: 'Ударение', label: '1.2' },
    ],
  },
]

describe('AppSidebar', () => {
  it('renders numbered chapters and lessons', async () => {
    const wrapper = await mountSuspended(AppSidebar, { props: { nav, currentPath: '/' } })
    expect(wrapper.text()).toContain('1. Алфавит и произношение')
    expect(wrapper.text()).toContain('1.2 Ударение')
    expect(wrapper.find('a[href="/cheatsheet"]').text()).toBe('Шпаргалка')
  })

  it('marks the current lesson', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      props: { nav, currentPath: '/lessons/01-alphabet/02-stress' },
    })
    const active = wrapper.find('a.active')
    expect(active.text()).toContain('Ударение')
    expect(active.attributes('aria-current')).toBe('page')
  })

  it('shows a check mark for completed lessons', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      props: {
        nav,
        currentPath: '/',
        isCompleted: (path: string) => path === '/lessons/01-alphabet/01-letters',
      },
    })
    expect(wrapper.findAll('.done')).toHaveLength(1)
    expect(wrapper.find('a[href="/lessons/01-alphabet/01-letters"] .done').exists()).toBe(true)
  })
})
```

`tests/nuxt/page-nav.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import PageNav from '~/components/PageNav.vue'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

const prev = { path: '/lessons/a', title: 'Буквы', label: '1.1' }
const next = { path: '/lessons/b', title: 'Ударение', label: '1.2' }

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  navigateToMock.mockReset()
})

function press(key: string, init: KeyboardEventInit = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...init }))
}

describe('PageNav', () => {
  it('renders links to previous and next lessons', async () => {
    wrapper = await mountSuspended(PageNav, { props: { prev, next } })
    expect(wrapper.find('a[rel="prev"]').attributes('href')).toBe('/lessons/a')
    expect(wrapper.find('a[rel="next"]').attributes('href')).toBe('/lessons/b')
  })

  it('omits missing links', async () => {
    wrapper = await mountSuspended(PageNav, { props: { prev: null, next } })
    expect(wrapper.find('a[rel="prev"]').exists()).toBe(false)
  })

  it('navigates with arrow keys', async () => {
    wrapper = await mountSuspended(PageNav, { props: { prev, next } })
    press('ArrowRight')
    expect(navigateToMock).toHaveBeenCalledWith('/lessons/b')
    press('ArrowLeft')
    expect(navigateToMock).toHaveBeenCalledWith('/lessons/a')
  })

  it('ignores arrows with modifier keys', async () => {
    wrapper = await mountSuspended(PageNav, { props: { prev, next } })
    press('ArrowRight', { altKey: true })
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 6: Run them to verify they fail**

Run: `pnpm vitest run --project nuxt tests/nuxt/theme-picker.test.ts tests/nuxt/app-sidebar.test.ts tests/nuxt/page-nav.test.ts`
Expected: FAIL — components not found.

- [ ] **Step 7: Create `app/components/ThemePicker.vue`**

```vue
<script setup lang="ts">
const colorMode = useColorMode()
const open = ref(false)

const themes = [
  { value: 'system', label: 'Системная' },
  { value: 'light', label: 'Светлая' },
  { value: 'sepia', label: 'Сепия' },
  { value: 'dark', label: 'Тёмная' },
] as const

function choose(value: (typeof themes)[number]['value']) {
  colorMode.preference = value
  open.value = false
}
</script>

<template>
  <div class="theme-picker" @keydown.escape="open = false">
    <button
      type="button"
      class="icon-button"
      aria-label="Выбрать тему"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      🖌
    </button>
    <ul v-if="open" class="theme-menu" role="menu">
      <li v-for="theme in themes" :key="theme.value" role="none">
        <button
          type="button"
          role="menuitemradio"
          :data-theme="theme.value"
          :aria-checked="colorMode.preference === theme.value"
          @click="choose(theme.value)"
        >
          {{ theme.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
```

- [ ] **Step 8: Create `app/components/AppTopbar.vue`**

```vue
<script setup lang="ts">
defineProps<{ sidebarOpen: boolean }>()
defineEmits<{ 'toggle-sidebar': [] }>()
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <button
        type="button"
        class="icon-button"
        aria-label="Показать или скрыть оглавление"
        aria-controls="sidebar"
        :aria-expanded="sidebarOpen"
        @click="$emit('toggle-sidebar')"
      >
        ☰
      </button>
      <ThemePicker />
    </div>
    <NuxtLink to="/" class="topbar-title">Польский для русскоговорящих</NuxtLink>
    <div class="topbar-right" />
  </header>
</template>
```

- [ ] **Step 9: Create `app/components/AppSidebar.vue`**

```vue
<script setup lang="ts">
import type { NavChapter } from '~/utils/nav'

const props = defineProps<{
  nav: NavChapter[]
  currentPath: string
  isCompleted?: (path: string) => boolean
}>()

const sections = [{ to: '/cheatsheet', label: 'Шпаргалка' }]

const root = ref<HTMLElement | null>(null)

function revealActive() {
  root.value?.querySelector('a.active')?.scrollIntoView?.({ block: 'nearest' })
}

onMounted(revealActive)
watch(() => props.currentPath, () => nextTick(revealActive))
</script>

<template>
  <nav id="sidebar" ref="root" class="sidebar" aria-label="Оглавление">
    <ol>
      <li>
        <NuxtLink
          to="/"
          :class="{ active: currentPath === '/' }"
          :aria-current="currentPath === '/' ? 'page' : undefined"
        >
          Введение
        </NuxtLink>
      </li>
      <li v-for="chapter in nav" :key="chapter.number" class="chapter">
        <NuxtLink :to="chapter.lessons[0]?.path" class="chapter-title">
          <strong>{{ chapter.number }}.</strong> {{ chapter.title }}
        </NuxtLink>
        <ol class="section">
          <li v-for="lesson in chapter.lessons" :key="lesson.path">
            <NuxtLink
              :to="lesson.path"
              :class="{ active: lesson.path === currentPath }"
              :aria-current="lesson.path === currentPath ? 'page' : undefined"
            >
              <strong>{{ lesson.label }}</strong> {{ lesson.title }}
              <span v-if="isCompleted?.(lesson.path)" class="done" aria-label="пройдено">✓</span>
            </NuxtLink>
          </li>
        </ol>
      </li>
    </ol>
    <div class="spacer" />
    <ol>
      <li v-for="section in sections" :key="section.to">
        <NuxtLink
          :to="section.to"
          :class="{ active: currentPath === section.to }"
          :aria-current="currentPath === section.to ? 'page' : undefined"
        >
          {{ section.label }}
        </NuxtLink>
      </li>
    </ol>
  </nav>
</template>
```

Note for the sidebar test "renders numbered chapters": `wrapper.text()` collapses whitespace between `<strong>1.</strong>` and the title into `1. Алфавит…`. If the assertion fails only because of whitespace, normalize with `wrapper.text().replace(/\s+/g, ' ')` in the test.

- [ ] **Step 10: Create `app/components/PageNav.vue`**

```vue
<script setup lang="ts">
import type { NavLesson } from '~/utils/nav'

const props = defineProps<{ prev: NavLesson | null; next: NavLesson | null }>()

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

function onKeydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (isTyping(event.target)) return
  if (event.key === 'ArrowLeft' && props.prev) navigateTo(props.prev.path)
  if (event.key === 'ArrowRight' && props.next) navigateTo(props.next.path)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <nav class="page-nav" aria-label="Соседние уроки">
    <NuxtLink v-if="prev" :to="prev.path" rel="prev" class="page-nav-link prev">
      <span aria-hidden="true">‹</span>
      <span class="sr-only">Предыдущий урок: {{ prev.label }} {{ prev.title }}</span>
    </NuxtLink>
    <NuxtLink v-if="next" :to="next.path" rel="next" class="page-nav-link next">
      <span aria-hidden="true">›</span>
      <span class="sr-only">Следующий урок: {{ next.label }} {{ next.title }}</span>
    </NuxtLink>
  </nav>
</template>
```

- [ ] **Step 11: Run component tests to verify they pass**

Run: `pnpm vitest run --project nuxt tests/nuxt/theme-picker.test.ts tests/nuxt/app-sidebar.test.ts tests/nuxt/page-nav.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 12: Create `app/layouts/default.vue`**

```vue
<script setup lang="ts">
import { normalizePath } from '~/utils/nav'

const MOBILE_QUERY = '(max-width: 1080px)'
const SIDEBAR_KEY = 'polski:sidebar'

const route = useRoute()
const { nav, prev, next, ready } = useLessonNav()
await ready

const currentPath = computed(() => normalizePath(route.path))
const sidebarOpen = ref(true)
const topbarHidden = ref(false)
const hydrated = ref(false)

function isMobile(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
  if (isMobile()) return
  try {
    localStorage.setItem(SIDEBAR_KEY, sidebarOpen.value ? 'open' : 'closed')
  } catch {
    // storage unavailable (private mode) — state just isn't remembered
  }
}

let lastScrollY = 0
function onScroll() {
  const y = window.scrollY
  topbarHidden.value = y > lastScrollY && y > 60
  lastScrollY = y
}

onMounted(() => {
  if (isMobile()) {
    sidebarOpen.value = false
  } else {
    try {
      sidebarOpen.value = localStorage.getItem(SIDEBAR_KEY) !== 'closed'
    } catch {
      sidebarOpen.value = true
    }
  }
  hydrated.value = true
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(
  () => route.path,
  () => {
    if (isMobile()) sidebarOpen.value = false
  },
)
</script>

<template>
  <div
    class="book"
    :class="sidebarOpen ? 'sidebar-open' : 'sidebar-closed'"
    :data-ready="hydrated || undefined"
  >
    <a href="#main" class="skip-link">К содержанию</a>
    <AppSidebar :nav="nav" :current-path="currentPath" />
    <div class="sidebar-backdrop" aria-hidden="true" @click="toggleSidebar" />
    <div class="page-wrapper">
      <AppTopbar
        :sidebar-open="sidebarOpen"
        :class="{ hidden: topbarHidden }"
        @toggle-sidebar="toggleSidebar"
      />
      <main id="main" class="page">
        <slot />
      </main>
      <PageNav :prev="prev" :next="next" />
    </div>
  </div>
</template>
```

- [ ] **Step 13: Simplify the home page**

Replace `app/pages/index.vue` with:
```vue
<template>
  <article class="content">
    <h1>Польский для русскоговорящих</h1>
    <p>
      Курс польского языка, построенный на сходстве с русским. Выберите урок в оглавлении слева
      или начните с первого.
    </p>
    <p><NuxtLink to="/lessons/01-alphabet/01-letters">Начать: 1.1 Буквы →</NuxtLink></p>
  </article>
</template>
```

Replace `tests/nuxt/app.test.ts` with:
```ts
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'

describe('index page', () => {
  it('renders the course title and a start link', async () => {
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.text()).toContain('Польский для русскоговорящих')
    expect(wrapper.find('a[href="/lessons/01-alphabet/01-letters"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 14: Run all tests**

Run: `pnpm test`
Expected: all tests PASS.

- [ ] **Step 15: Generate and verify layout, themes and fonts in the output**

Run: `pnpm generate`
Expected: exit 0 with lessons and `/cheatsheet` prerendered.

Run:
```bash
grep -c 'id="sidebar"' .output/public/lessons/01-alphabet/02-stress/index.html
grep -c 'rel="prev"' .output/public/lessons/01-alphabet/02-stress/index.html
grep -c 'polski:theme' .output/public/index.html
ls .output/public/_fonts | head -3
grep -rl 'fonts.googleapis.com' .output/public --include=*.html | wc -l
```
Expected: first three print ≥ 1; `_fonts` lists font files; last prints `0`.

If `_fonts` is missing, read the @nuxt/fonts README (`npm view @nuxt/fonts readme`) for the 0.14 option names and fix only the `fonts` block in `nuxt.config.ts`.

- [ ] **Step 16: Manual visual check**

Run: `pnpm preview` and open `http://localhost:4173/lessons/01-alphabet/02-stress`.
Check: sidebar shows chapters 1–2 with `1.2 Ударение` highlighted; ☰ hides/shows sidebar and the choice survives reload; 🖌 → Сепия / Тёмная switch colors and survive reload; ← goes to 1.1, → goes to 2.1; at 390px width the sidebar is hidden and ☰ opens it as an overlay that closes after choosing a lesson.
Stop the preview server.

- [ ] **Step 17: Lint, typecheck, commit**

Run: `pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add mdBook-style layout with sidebar, themes, fonts and page navigation

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```
