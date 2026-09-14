# Plan 3 — Exercises, Flashcards and Progress

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Learner-facing interactivity: progress stored in the browser, lesson quizzes with completion tracking, Leitner flashcards, the vocabulary page, and the settings page with progress export/import.

**Architecture:** All progress lives in one `useState('progress')` object validated by a zod schema (`app/utils/progress.ts`). A client plugin loads it from `localStorage` on `app:mounted` (after hydration, so prerendered HTML never mismatches) and saves on every change. Pure modules (`progress.ts`, `quiz.ts`, `leitner.ts`, `deck.ts`, `vocabulary.ts`, `pron.ts`) hold all rules; components only wire them to the UI. Progress-dependent UI checks `loaded` before showing anything.

**Tech Stack:** Nuxt 4, zod 3.25, Vitest + @nuxt/test-utils.

**Spec:** `docs/superpowers/specs/2026-09-14-polish-for-russians-design.md` (§6, §7, §8)

**Prerequisite:** Plans 1 and 2 complete.

## Global Constraints

All constraints in `2026-09-14-polish-site-00-overview.md` → "Global Constraints" apply. Key ones for this plan:
- Progress key `polski:v1`, blob has `version: 1`; theme is owned by color-mode (`polski:theme`) and only travels in export files.
- Invalid or unparsable stored progress → defaults + `console.warn`; the app never throws on bad storage.
- Quiz pass threshold: 80%. "Almost" (diacritics-only mistake) counts as correct for scoring.
- Leitner intervals for boxes 1–5: `0, 1, 3, 7, 14` days; 10 new cards per session; dates are local `YYYY-MM-DD`.
- Pure modules take `now: Date` as a parameter — never call `new Date()` inside them.

---

### Task 1: Progress model, storage plugin and `useProgress`

**Files:**
- Create: `app/utils/progress.ts`, `app/plugins/progress.client.ts`, `app/composables/useProgress.ts`
- Modify: `app/layouts/default.vue` (pass completion to the sidebar)
- Test: `tests/unit/progress.test.ts`, `tests/nuxt/use-progress.test.ts`

**Interfaces:**
- Produces (`app/utils/progress.ts`):
  - `STORAGE_KEY = 'polski:v1'`, `THEMES = ['system', 'light', 'sepia', 'dark'] as const`, `type Theme`
  - `settingsSchema`, `progressSchema`; types `Settings`, `Progress`, `LessonProgress`, `CardProgress` (`{ box: number; due: string }`)
  - `defaultProgress(): Progress`
  - `parseProgress(data: unknown): { progress: Progress; valid: boolean }`
  - `readStoredProgress(raw: string | null): { progress: Progress; valid: boolean }` — `null` → defaults, `valid: true`; bad JSON or schema → defaults, `valid: false`
  - `recordQuizResult(p: Progress, path: string, percent: number, now: Date): Progress` — `bestScore = max`, `completed ||= percent >= 80`, `at = now.toISOString()`
  - `markLessonRead(p: Progress, path: string, now: Date): Progress` — `completed = true`, keeps `bestScore` (0 if none)
  - `exportProgress(p: Progress, theme: string): string` — pretty JSON of `{ ...p, theme }`
  - `importProgress(text: string): { progress: Progress; theme: Theme | null } | null` — `null` when JSON or schema is invalid; unknown theme → `theme: null`
- Produces (`useProgress()`):
  - `{ progress: Ref<Progress>; loaded: Ref<boolean>; isLessonCompleted(path: string): boolean; recordQuiz(path: string, percent: number): void; markRead(path: string): void; updateSettings(patch: Partial<Settings>): void; replace(next: Progress): void }`
  - `isLessonCompleted` returns `false` until `loaded` is `true`
  - state keys: `useState('progress')`, `useState('progress:loaded')`

- [ ] **Step 1: Write the failing unit tests**

`tests/unit/progress.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import {
  defaultProgress,
  exportProgress,
  importProgress,
  markLessonRead,
  parseProgress,
  readStoredProgress,
  recordQuizResult,
} from '../../app/utils/progress'

const now = new Date('2026-09-14T10:00:00Z')
const later = new Date('2026-09-15T10:00:00Z')

describe('defaultProgress', () => {
  it('has version 1, empty records and default settings', () => {
    expect(defaultProgress()).toEqual({
      version: 1,
      lessons: {},
      cards: {},
      settings: { showPron: 'auto', translationMode: 'tap', direction: 'pl-ru' },
    })
  })
})

describe('parseProgress', () => {
  it('accepts valid progress and fills missing settings', () => {
    const { progress, valid } = parseProgress({
      version: 1,
      lessons: { '/lessons/a': { completed: true, bestScore: 90, at: now.toISOString() } },
      cards: { rzeka: { box: 2, due: '2026-09-15' } },
      settings: { showPron: 'never' },
    })
    expect(valid).toBe(true)
    expect(progress.settings).toEqual({ showPron: 'never', translationMode: 'tap', direction: 'pl-ru' })
    expect(progress.cards.rzeka).toEqual({ box: 2, due: '2026-09-15' })
  })

  it('rejects other versions, bad boxes and garbage', () => {
    expect(parseProgress({ version: 2 }).valid).toBe(false)
    expect(parseProgress({ version: 1, cards: { x: { box: 9, due: '2026-09-15' } } }).valid).toBe(false)
    expect(parseProgress('nope')).toEqual({ progress: defaultProgress(), valid: false })
  })
})

describe('readStoredProgress', () => {
  it('returns valid defaults when nothing is stored', () => {
    expect(readStoredProgress(null)).toEqual({ progress: defaultProgress(), valid: true })
  })

  it('returns invalid defaults for broken JSON', () => {
    expect(readStoredProgress('{broken')).toEqual({ progress: defaultProgress(), valid: false })
  })

  it('parses stored JSON', () => {
    const raw = JSON.stringify({ ...defaultProgress(), cards: { dom: { box: 3, due: '2026-09-20' } } })
    expect(readStoredProgress(raw).progress.cards.dom?.box).toBe(3)
  })
})

describe('recordQuizResult', () => {
  it('completes a lesson at 80% and keeps the best score', () => {
    let p = recordQuizResult(defaultProgress(), '/lessons/a', 60, now)
    expect(p.lessons['/lessons/a']).toEqual({ completed: false, bestScore: 60, at: now.toISOString() })

    p = recordQuizResult(p, '/lessons/a', 80, later)
    expect(p.lessons['/lessons/a']).toEqual({ completed: true, bestScore: 80, at: later.toISOString() })

    p = recordQuizResult(p, '/lessons/a', 40, later)
    expect(p.lessons['/lessons/a']).toMatchObject({ completed: true, bestScore: 80 })
  })

  it('does not mutate the input', () => {
    const original = defaultProgress()
    recordQuizResult(original, '/lessons/a', 100, now)
    expect(original.lessons).toEqual({})
  })
})

describe('markLessonRead', () => {
  it('completes a lesson without changing the best score', () => {
    const scored = recordQuizResult(defaultProgress(), '/lessons/a', 50, now)
    expect(markLessonRead(scored, '/lessons/a', later).lessons['/lessons/a']).toEqual({
      completed: true,
      bestScore: 50,
      at: later.toISOString(),
    })
    expect(markLessonRead(defaultProgress(), '/lessons/b', now).lessons['/lessons/b']?.bestScore).toBe(0)
  })
})

describe('export / import', () => {
  it('round-trips progress and theme', () => {
    const p = markLessonRead(defaultProgress(), '/lessons/a', now)
    const imported = importProgress(exportProgress(p, 'sepia'))
    expect(imported).toEqual({ progress: p, theme: 'sepia' })
  })

  it('returns null for invalid files', () => {
    expect(importProgress('not json')).toBeNull()
    expect(importProgress(JSON.stringify({ version: 5 }))).toBeNull()
  })

  it('ignores unknown themes', () => {
    const text = JSON.stringify({ ...defaultProgress(), theme: 'neon' })
    expect(importProgress(text)?.theme).toBeNull()
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project unit tests/unit/progress.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/utils/progress.ts`**

```ts
import { z } from 'zod'

export const STORAGE_KEY = 'polski:v1'
export const THEMES = ['system', 'light', 'sepia', 'dark'] as const
export type Theme = (typeof THEMES)[number]

const PASS_PERCENT = 80

export const settingsSchema = z.object({
  showPron: z.enum(['auto', 'always', 'never']).default('auto'),
  translationMode: z.enum(['show', 'hide', 'tap']).default('tap'),
  direction: z.enum(['pl-ru', 'ru-pl', 'mixed']).default('pl-ru'),
})

const lessonProgressSchema = z.object({
  completed: z.boolean(),
  bestScore: z.number().min(0).max(100),
  at: z.string(),
})

const cardProgressSchema = z.object({
  box: z.number().int().min(1).max(5),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const progressSchema = z.object({
  version: z.literal(1),
  lessons: z.record(z.string(), lessonProgressSchema).default({}),
  cards: z.record(z.string(), cardProgressSchema).default({}),
  settings: settingsSchema.default({}),
})

export type Settings = z.infer<typeof settingsSchema>
export type Progress = z.infer<typeof progressSchema>
export type LessonProgress = z.infer<typeof lessonProgressSchema>
export type CardProgress = z.infer<typeof cardProgressSchema>

export function defaultProgress(): Progress {
  return progressSchema.parse({ version: 1 })
}

export function parseProgress(data: unknown): { progress: Progress; valid: boolean } {
  const result = progressSchema.safeParse(data)
  return result.success
    ? { progress: result.data, valid: true }
    : { progress: defaultProgress(), valid: false }
}

export function readStoredProgress(raw: string | null): { progress: Progress; valid: boolean } {
  if (raw === null) return { progress: defaultProgress(), valid: true }
  try {
    return parseProgress(JSON.parse(raw))
  } catch {
    return { progress: defaultProgress(), valid: false }
  }
}

export function recordQuizResult(p: Progress, path: string, percent: number, now: Date): Progress {
  const previous = p.lessons[path]
  return {
    ...p,
    lessons: {
      ...p.lessons,
      [path]: {
        completed: (previous?.completed ?? false) || percent >= PASS_PERCENT,
        bestScore: Math.max(previous?.bestScore ?? 0, percent),
        at: now.toISOString(),
      },
    },
  }
}

export function markLessonRead(p: Progress, path: string, now: Date): Progress {
  return {
    ...p,
    lessons: {
      ...p.lessons,
      [path]: { completed: true, bestScore: p.lessons[path]?.bestScore ?? 0, at: now.toISOString() },
    },
  }
}

export function exportProgress(p: Progress, theme: string): string {
  return JSON.stringify({ ...p, theme }, null, 2)
}

export function importProgress(text: string): { progress: Progress; theme: Theme | null } | null {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  const { progress, valid } = parseProgress(data)
  if (!valid) return null
  const theme = (data as { theme?: unknown }).theme
  return {
    progress,
    theme: THEMES.includes(theme as Theme) ? (theme as Theme) : null,
  }
}
```

- [ ] **Step 4: Run them to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/progress.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 5: Write the failing `useProgress` test**

`tests/nuxt/use-progress.test.ts`:
```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { defaultProgress } from '~/utils/progress'

describe('useProgress', () => {
  beforeEach(() => {
    const { replace, loaded } = useProgress()
    replace(defaultProgress())
    loaded.value = false
  })

  it('hides completion until progress is loaded', () => {
    const { markRead, isLessonCompleted, loaded } = useProgress()
    markRead('/lessons/a')
    expect(isLessonCompleted('/lessons/a')).toBe(false)
    loaded.value = true
    expect(isLessonCompleted('/lessons/a')).toBe(true)
  })

  it('records quiz results into shared state', () => {
    useProgress().recordQuiz('/lessons/b', 90)
    const { progress } = useProgress()
    expect(progress.value.lessons['/lessons/b']).toMatchObject({ completed: true, bestScore: 90 })
  })

  it('merges settings patches', () => {
    const { updateSettings, progress } = useProgress()
    updateSettings({ showPron: 'never' })
    expect(progress.value.settings).toEqual({ showPron: 'never', translationMode: 'tap', direction: 'pl-ru' })
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm vitest run --project nuxt tests/nuxt/use-progress.test.ts`
Expected: FAIL — `useProgress` is not defined.

- [ ] **Step 7: Implement `app/composables/useProgress.ts`**

```ts
import {
  defaultProgress,
  markLessonRead,
  recordQuizResult,
  type Progress,
  type Settings,
} from '~/utils/progress'

export function useProgress() {
  const progress = useState<Progress>('progress', defaultProgress)
  const loaded = useState('progress:loaded', () => false)

  function isLessonCompleted(path: string): boolean {
    return loaded.value && progress.value.lessons[path]?.completed === true
  }

  function recordQuiz(path: string, percent: number) {
    progress.value = recordQuizResult(progress.value, path, percent, new Date())
  }

  function markRead(path: string) {
    progress.value = markLessonRead(progress.value, path, new Date())
  }

  function updateSettings(patch: Partial<Settings>) {
    progress.value = { ...progress.value, settings: { ...progress.value.settings, ...patch } }
  }

  function replace(next: Progress) {
    progress.value = next
  }

  return { progress, loaded, isLessonCompleted, recordQuiz, markRead, updateSettings, replace }
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `pnpm vitest run --project nuxt tests/nuxt/use-progress.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 9: Implement `app/plugins/progress.client.ts`**

```ts
import { readStoredProgress, STORAGE_KEY } from '~/utils/progress'

export default defineNuxtPlugin((nuxtApp) => {
  const { progress, loaded } = useProgress()

  nuxtApp.hook('app:mounted', () => {
    let raw: string | null = null
    try {
      raw = localStorage.getItem(STORAGE_KEY)
    } catch {
      raw = null
    }

    const { progress: stored, valid } = readStoredProgress(raw)
    if (!valid) console.warn('[polski] Saved progress is invalid; starting with defaults.')
    progress.value = stored
    loaded.value = true

    watch(
      progress,
      (value) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
        } catch {
          // storage unavailable — progress lasts for this visit only
        }
      },
      { deep: true },
    )
  })
})
```

Loading on `app:mounted` (not at plugin start) keeps the first client render identical to the prerendered HTML.

- [ ] **Step 10: Show completion in the sidebar**

In `app/layouts/default.vue` add after the `useLessonNav()` line:
```ts
const { isLessonCompleted } = useProgress()
```
and change the sidebar element to:
```vue
<AppSidebar :nav="nav" :current-path="currentPath" :is-completed="isLessonCompleted" />
```

- [ ] **Step 11: Full test run, lint, typecheck, commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add progress model with localStorage persistence

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 2: Quizzes and lesson completion

**Files:**
- Create: `app/utils/quiz.ts`, `app/components/content/Quiz.vue`, `app/components/quiz/QuizChoice.vue`, `app/components/quiz/QuizText.vue`, `app/components/quiz/QuizMatch.vue`, `app/components/quiz/QuizFeedback.vue`, `app/components/LessonDone.vue`
- Modify: `app/pages/lessons/[...slug].vue` (add `LessonDone`), `content/lessons/02-sounds/01-rz.md` (add a final quiz)
- Test: `tests/unit/quiz.test.ts`, `tests/nuxt/quiz.test.ts`, `tests/nuxt/lesson-done.test.ts`

**Interfaces:**
- Consumes: `quizSchema`, `Question`, `ChoiceQuestion`, `InputQuestion`, `PatternQuestion`, `MatchQuestion` (`shared/schemas.ts`); `normalizeText`, `foldDiacritics` (`app/utils/normalize.ts`); `normalizePath` (`app/utils/nav.ts`); `useProgress` (Task 1); `usePatterns`, fixtures (Plan 2).
- Produces (`app/utils/quiz.ts`):
  - `type Verdict = 'correct' | 'almost' | 'wrong'`, `PASS_PERCENT = 80`
  - `checkText(input: string, answer: string | string[]): Verdict` — exact after `normalizeText` → `correct`; equal after also folding diacritics → `almost`; empty input → `wrong`
  - `checkChoice(q: ChoiceQuestion, selected: number): Verdict`
  - `checkMatch(q: MatchQuestion, selection: Record<string, string>): Verdict` — `correct` only when every pair is matched
  - `interface QuizScore { correct: number; total: number; percent: number; passed: boolean }`; `scoreQuiz(verdicts: Verdict[]): QuizScore` — `almost` counts as correct; `percent` rounded; `passed = percent >= 80`; empty → `{0,0,0,false}`
  - `shuffle<T>(items: readonly T[], random?: () => number): T[]` — Fisher–Yates on a copy
- Produces (components):
  - `<Quiz :questions="unknown" :final?="boolean" />` — validates with `quizSchema`; renders `section.quiz` with one `li.quiz-question` per question; when all are answered shows `.quiz-summary` (`«N из M»` + «Пройти ещё раз»); with `final` records `percent` for the current lesson path via `useProgress().recordQuiz`; invalid data in dev renders `.quiz-error`
  - `QuizChoice`, `QuizText` (types `input` and `pattern`), `QuizMatch` — each takes `question` and emits `answered: [verdict: Verdict]` once
  - `<QuizFeedback :verdict :answer="string" :explain?="string" />` — `.quiz-feedback.is-<verdict>` with «Верно!» / «Почти! Правильно: …» / «Неверно. Правильный ответ: …»
  - `<LessonDone :path="string" />` — «✓ Урок пройден» when completed, otherwise «Урок прочитан» button (only after progress loaded)

Markdown usage:
```md
::quiz
---
final: true
questions:
  - type: choice
    q: Как по-польски «река»?
    options: [reka, rzeka, żeka]
    answer: 1
  - type: pattern
    q: Русское «берег» → по-польски?
    pattern: rz-р
    answer: brzeg
  - type: match
    q: Соедините слова
    pairs:
      - [rzeka, река]
      - [brzeg, берег]
---
::
```

- [ ] **Step 1: Write the failing unit tests**

`tests/unit/quiz.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { checkChoice, checkMatch, checkText, scoreQuiz, shuffle } from '../../app/utils/quiz'

describe('checkText', () => {
  it('accepts exact answers ignoring case, spaces and edge punctuation', () => {
    expect(checkText('  Dzień  dobry! ', 'dzień dobry')).toBe('correct')
  })

  it('accepts any of several answers', () => {
    expect(checkText('cześć', ['hej', 'cześć'])).toBe('correct')
  })

  it('returns almost when only diacritics differ', () => {
    expect(checkText('zab', 'ząb')).toBe('almost')
    expect(checkText('zolw', ['żółw'])).toBe('almost')
  })

  it('returns wrong otherwise or for empty input', () => {
    expect(checkText('reka', 'rzeka')).toBe('wrong')
    expect(checkText('   ', 'rzeka')).toBe('wrong')
  })
})

describe('checkChoice', () => {
  it('compares the selected index', () => {
    const q = { type: 'choice' as const, q: '?', options: ['a', 'b'], answer: 1 }
    expect(checkChoice(q, 1)).toBe('correct')
    expect(checkChoice(q, 0)).toBe('wrong')
  })
})

describe('checkMatch', () => {
  const q = {
    type: 'match' as const,
    q: '?',
    pairs: [
      ['rzeka', 'река'],
      ['brzeg', 'берег'],
    ] as [string, string][],
  }

  it('is correct only when all pairs match', () => {
    expect(checkMatch(q, { rzeka: 'река', brzeg: 'берег' })).toBe('correct')
    expect(checkMatch(q, { rzeka: 'берег', brzeg: 'река' })).toBe('wrong')
    expect(checkMatch(q, { rzeka: 'река' })).toBe('wrong')
  })
})

describe('scoreQuiz', () => {
  it('counts almost as correct and applies the 80% threshold', () => {
    expect(scoreQuiz(['correct', 'almost', 'correct', 'correct', 'wrong'])).toEqual({
      correct: 4,
      total: 5,
      percent: 80,
      passed: true,
    })
    expect(scoreQuiz(['correct', 'wrong', 'wrong'])).toEqual({
      correct: 1,
      total: 3,
      percent: 33,
      passed: false,
    })
  })

  it('handles an empty quiz', () => {
    expect(scoreQuiz([])).toEqual({ correct: 0, total: 0, percent: 0, passed: false })
  })
})

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4]
    const result = shuffle(input, () => 0)
    expect(input).toEqual([1, 2, 3, 4])
    expect([...result].sort()).toEqual([1, 2, 3, 4])
    expect(result).toEqual([2, 3, 4, 1])
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project unit tests/unit/quiz.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/utils/quiz.ts`**

```ts
import type { ChoiceQuestion, MatchQuestion } from '../../shared/schemas'
import { foldDiacritics, normalizeText } from './normalize'

export type Verdict = 'correct' | 'almost' | 'wrong'

export const PASS_PERCENT = 80

export interface QuizScore {
  correct: number
  total: number
  percent: number
  passed: boolean
}

export function checkText(input: string, answer: string | string[]): Verdict {
  const given = normalizeText(input)
  if (!given) return 'wrong'
  const answers = (Array.isArray(answer) ? answer : [answer]).map(normalizeText)
  if (answers.includes(given)) return 'correct'
  const loose = foldDiacritics(given)
  return answers.some((a) => foldDiacritics(a) === loose) ? 'almost' : 'wrong'
}

export function checkChoice(q: ChoiceQuestion, selected: number): Verdict {
  return selected === q.answer ? 'correct' : 'wrong'
}

export function checkMatch(q: MatchQuestion, selection: Record<string, string>): Verdict {
  return q.pairs.every(([pl, ru]) => selection[pl] === ru) ? 'correct' : 'wrong'
}

export function scoreQuiz(verdicts: Verdict[]): QuizScore {
  const total = verdicts.length
  const correct = verdicts.filter((v) => v !== 'wrong').length
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100)
  return { correct, total, percent, passed: total > 0 && percent >= PASS_PERCENT }
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}
```

- [ ] **Step 4: Run them to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/quiz.test.ts`
Expected: PASS (10 tests). If the `shuffle` expectation `[2, 3, 4, 1]` fails, trace Fisher–Yates with `random = () => 0` by hand (each step swaps position `i` with 0) and correct only the expected array in the test.

- [ ] **Step 5: Write the failing component tests**

`tests/nuxt/quiz.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import Quiz from '~/components/content/Quiz.vue'
import { defaultProgress } from '~/utils/progress'

const { patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('usePatterns', () => patternsApi)

const questions = [
  { type: 'choice', q: 'Как по-польски «река»?', options: ['reka', 'rzeka'], answer: 1 },
  { type: 'pattern', q: 'Русское «берег» → по-польски?', pattern: 'rz-р', answer: 'brzeg' },
  { type: 'match', q: 'Соедините', pairs: [['rzeka', 'река'], ['brzeg', 'берег']] },
]

const route = '/lessons/02-sounds/01-rz'

beforeEach(() => {
  useProgress().replace(defaultProgress())
})

async function answerAll(wrapper: Awaited<ReturnType<typeof mountSuspended>>, choiceIndex: number) {
  await wrapper.findAll('.quiz-choice input[type="radio"]')[choiceIndex]!.setValue(true)
  await wrapper.find('.quiz-text input').setValue('brzeg')
  await wrapper.find('.quiz-text form, form.quiz-text').trigger('submit')
  await wrapper.find('[data-left="rzeka"]').trigger('click')
  await wrapper.find('[data-right="река"]').trigger('click')
  await wrapper.find('[data-left="brzeg"]').trigger('click')
  await wrapper.find('[data-right="берег"]').trigger('click')
}

describe('Quiz', () => {
  it('gives immediate feedback for a choice question', async () => {
    const wrapper = await mountSuspended(Quiz, { props: { questions }, route })
    await wrapper.findAll('.quiz-choice input[type="radio"]')[1]!.setValue(true)
    expect(wrapper.find('.quiz-choice .quiz-feedback').text()).toContain('Верно!')
    expect(wrapper.findAll('.quiz-choice input:disabled')).toHaveLength(2)
  })

  it('shows the pattern hint and accepts a diacritics-free answer as almost', async () => {
    const almost = [{ type: 'input', q: '«зуб»', answer: 'ząb' }, ...questions.slice(1, 2)]
    const wrapper = await mountSuspended(Quiz, { props: { questions: almost }, route })
    expect(wrapper.findAll('.quiz-hint')).toHaveLength(1)
    expect(wrapper.find('.quiz-hint').text()).toContain('rz ↔ р')

    await wrapper.find('.quiz-text input').setValue('zab')
    await wrapper.find('form.quiz-text').trigger('submit')
    expect(wrapper.find('.quiz-feedback').classes()).toContain('is-almost')
    expect(wrapper.find('.quiz-feedback').text()).toContain('ząb')
  })

  it('checks a match question once all pairs are chosen', async () => {
    const wrapper = await mountSuspended(Quiz, { props: { questions: [questions[2]] }, route })
    await wrapper.find('[data-left="rzeka"]').trigger('click')
    await wrapper.find('[data-right="берег"]').trigger('click')
    await wrapper.find('[data-left="brzeg"]').trigger('click')
    await wrapper.find('[data-right="река"]').trigger('click')
    expect(wrapper.find('.quiz-match .quiz-feedback').classes()).toContain('is-wrong')
  })

  it('summarizes, records the final score and allows a retry', async () => {
    const wrapper = await mountSuspended(Quiz, { props: { questions, final: true }, route })
    expect(wrapper.find('.quiz-summary').exists()).toBe(false)

    await answerAll(wrapper, 0)
    expect(wrapper.find('.quiz-summary').text()).toContain('2 из 3')
    expect(useProgress().progress.value.lessons[route]).toMatchObject({ completed: false, bestScore: 67 })

    await wrapper.find('.quiz-summary button').trigger('click')
    expect(wrapper.find('.quiz-summary').exists()).toBe(false)
    expect(wrapper.findAll('.quiz-feedback')).toHaveLength(0)

    await answerAll(wrapper, 1)
    expect(wrapper.find('.quiz-summary').text()).toContain('3 из 3')
    expect(useProgress().progress.value.lessons[route]).toMatchObject({ completed: true, bestScore: 100 })
  })

  it('does not record scores for non-final quizzes', async () => {
    const wrapper = await mountSuspended(Quiz, { props: { questions }, route })
    await answerAll(wrapper, 1)
    expect(useProgress().progress.value.lessons[route]).toBeUndefined()
  })

  it('reports invalid questions in dev', async () => {
    const wrapper = await mountSuspended(Quiz, {
      props: { questions: [{ type: 'choice', q: '?', options: ['a'], answer: 0 }] },
      route,
    })
    expect(wrapper.find('section.quiz').exists()).toBe(false)
    if (import.meta.dev) expect(wrapper.find('.quiz-error').exists()).toBe(true)
  })
})
```

`tests/nuxt/lesson-done.test.ts`:
```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LessonDone from '~/components/LessonDone.vue'
import { defaultProgress } from '~/utils/progress'

beforeEach(() => {
  const { replace, loaded } = useProgress()
  replace(defaultProgress())
  loaded.value = true
})

describe('LessonDone', () => {
  it('marks the lesson as read', async () => {
    const wrapper = await mountSuspended(LessonDone, { props: { path: '/lessons/a' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('✓ Урок пройден')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('renders nothing before progress is loaded', async () => {
    useProgress().loaded.value = false
    const wrapper = await mountSuspended(LessonDone, { props: { path: '/lessons/a' } })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('✓')
  })
})
```

- [ ] **Step 6: Run them to verify they fail**

Run: `pnpm vitest run --project nuxt tests/nuxt/quiz.test.ts tests/nuxt/lesson-done.test.ts`
Expected: FAIL — components not found.

- [ ] **Step 7: Implement `app/components/quiz/QuizFeedback.vue`**

```vue
<script setup lang="ts">
import type { Verdict } from '~/utils/quiz'

defineProps<{ verdict: Verdict; answer: string; explain?: string }>()
</script>

<template>
  <div class="quiz-feedback" :class="`is-${verdict}`" role="status">
    <strong v-if="verdict === 'correct'">Верно!</strong>
    <strong v-else-if="verdict === 'almost'">Почти! Правильно: <span lang="pl">{{ answer }}</span></strong>
    <strong v-else>Неверно. Правильный ответ: <span lang="pl">{{ answer }}</span></strong>
    <p v-if="explain" class="explain">{{ explain }}</p>
  </div>
</template>

<style scoped>
.quiz-feedback {
  margin-top: 0.5rem;
  font-size: 0.925rem;
}
.is-correct strong {
  color: var(--cognate);
}
.is-almost strong {
  color: var(--accent-pl);
}
.is-wrong strong {
  color: var(--false-friend);
}
.explain {
  margin: 0.25rem 0 0;
  color: var(--muted);
}
</style>
```

- [ ] **Step 8: Implement `app/components/quiz/QuizChoice.vue`**

```vue
<script setup lang="ts">
import type { ChoiceQuestion } from '#shared/schemas'
import { checkChoice, type Verdict } from '~/utils/quiz'

const props = defineProps<{ question: ChoiceQuestion }>()
const emit = defineEmits<{ answered: [verdict: Verdict] }>()

const name = useId()
const selected = ref<number | null>(null)
const verdict = ref<Verdict | null>(null)

function choose(index: number) {
  if (verdict.value) return
  selected.value = index
  verdict.value = checkChoice(props.question, index)
  emit('answered', verdict.value)
}
</script>

<template>
  <fieldset class="quiz-choice">
    <legend>{{ question.q }}</legend>
    <label
      v-for="(option, i) in question.options"
      :key="i"
      class="option"
      :class="{
        correct: verdict !== null && i === question.answer,
        wrong: verdict === 'wrong' && i === selected,
      }"
    >
      <input
        type="radio"
        :name="name"
        :checked="selected === i"
        :disabled="verdict !== null"
        @change="choose(i)"
      />
      {{ option }}
    </label>
    <QuizFeedback
      v-if="verdict"
      :verdict="verdict"
      :answer="question.options[question.answer] ?? ''"
      :explain="question.explain"
    />
  </fieldset>
</template>

<style scoped>
.quiz-choice {
  border: none;
  padding: 0;
  margin: 0;
}
legend {
  font-weight: 600;
  margin-bottom: 0.35rem;
}
.option {
  display: block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}
.option.correct {
  background: color-mix(in srgb, var(--cognate) 15%, transparent);
}
.option.wrong {
  background: color-mix(in srgb, var(--false-friend) 15%, transparent);
}
</style>
```

- [ ] **Step 9: Implement `app/components/quiz/QuizText.vue`**

```vue
<script setup lang="ts">
import type { InputQuestion, PatternQuestion } from '#shared/schemas'
import { checkText, type Verdict } from '~/utils/quiz'

const props = defineProps<{ question: InputQuestion | PatternQuestion }>()
const emit = defineEmits<{ answered: [verdict: Verdict] }>()

const { byId: patternsById } = usePatterns()
const inputId = useId()
const value = ref('')
const verdict = ref<Verdict | null>(null)

const hint = computed(() =>
  props.question.type === 'pattern' ? (patternsById.value.get(props.question.pattern) ?? null) : null,
)
const expected = computed(() =>
  Array.isArray(props.question.answer) ? (props.question.answer[0] ?? '') : props.question.answer,
)

function submit() {
  if (verdict.value || !value.value.trim()) return
  verdict.value = checkText(value.value, props.question.answer)
  emit('answered', verdict.value)
}
</script>

<template>
  <form class="quiz-text" @submit.prevent="submit">
    <label :for="inputId" class="quiz-q">{{ question.q }}</label>
    <p v-if="hint" class="quiz-hint">
      Подсказка: <span lang="pl">{{ hint.pl }}</span> ↔ {{ hint.ru }}
    </p>
    <div class="row">
      <input
        :id="inputId"
        v-model="value"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        :disabled="verdict !== null"
      />
      <button type="submit" :disabled="verdict !== null">Проверить</button>
    </div>
    <QuizFeedback v-if="verdict" :verdict="verdict" :answer="expected" :explain="question.explain" />
  </form>
</template>

<style scoped>
.quiz-q {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}
.quiz-hint {
  margin: 0 0 0.35rem;
  color: var(--muted);
  font-size: 0.875rem;
}
.row {
  display: flex;
  gap: 0.5rem;
}
input {
  font: inherit;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--fg);
  min-width: 0;
  flex: 1 1 12rem;
  max-width: 20rem;
}
button {
  font: inherit;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
}
</style>
```

- [ ] **Step 10: Implement `app/components/quiz/QuizMatch.vue`**

```vue
<script setup lang="ts">
import type { MatchQuestion } from '#shared/schemas'
import { checkMatch, shuffle, type Verdict } from '~/utils/quiz'

const props = defineProps<{ question: MatchQuestion }>()
const emit = defineEmits<{ answered: [verdict: Verdict] }>()

const left = computed(() => props.question.pairs.map(([pl]) => pl))
const right = ref(props.question.pairs.map(([, ru]) => ru))
const active = ref<string | null>(null)
const selection = ref<Record<string, string>>({})
const verdict = ref<Verdict | null>(null)

const used = computed(() => new Set(Object.values(selection.value)))
const answer = computed(() => props.question.pairs.map(([pl, ru]) => `${pl} — ${ru}`).join(', '))

// Shuffle only on the client so the prerendered HTML matches the first render.
onMounted(() => {
  right.value = shuffle(right.value)
})

function pairOk(pl: string): boolean {
  return props.question.pairs.some(([p, r]) => p === pl && selection.value[pl] === r)
}

function pickLeft(pl: string) {
  if (verdict.value) return
  if (selection.value[pl]) {
    const next = { ...selection.value }
    delete next[pl]
    selection.value = next
    return
  }
  active.value = pl
}

function pickRight(ru: string) {
  if (verdict.value || !active.value || used.value.has(ru)) return
  selection.value = { ...selection.value, [active.value]: ru }
  active.value = null
  if (Object.keys(selection.value).length === props.question.pairs.length) {
    verdict.value = checkMatch(props.question, selection.value)
    emit('answered', verdict.value)
  }
}
</script>

<template>
  <div class="quiz-match">
    <p class="quiz-q">{{ question.q }}</p>
    <div class="columns">
      <ul>
        <li v-for="pl in left" :key="pl">
          <button
            type="button"
            lang="pl"
            :data-left="pl"
            :aria-pressed="active === pl"
            :class="{ ok: verdict && pairOk(pl), bad: verdict && !pairOk(pl) }"
            :disabled="verdict !== null"
            @click="pickLeft(pl)"
          >
            {{ pl }}<template v-if="selection[pl]"> → {{ selection[pl] }}</template>
          </button>
        </li>
      </ul>
      <ul>
        <li v-for="ru in right" :key="ru">
          <button
            type="button"
            :data-right="ru"
            :disabled="verdict !== null || used.has(ru)"
            @click="pickRight(ru)"
          >
            {{ ru }}
          </button>
        </li>
      </ul>
    </div>
    <QuizFeedback v-if="verdict" :verdict="verdict" :answer="answer" :explain="question.explain" />
  </div>
</template>

<style scoped>
.quiz-q {
  font-weight: 600;
  margin: 0 0 0.35rem;
}
.columns {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
button {
  font: inherit;
  text-align: left;
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--fg);
  cursor: pointer;
}
button[aria-pressed='true'] {
  border-color: var(--accent-pl);
  box-shadow: 0 0 0 1px var(--accent-pl);
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}
button.ok {
  border-color: var(--cognate);
  opacity: 1;
}
button.bad {
  border-color: var(--false-friend);
  opacity: 1;
}
</style>
```

- [ ] **Step 11: Implement `app/components/content/Quiz.vue`**

```vue
<script setup lang="ts">
import { quizSchema, type Question } from '#shared/schemas'
import { normalizePath } from '~/utils/nav'
import { PASS_PERCENT, scoreQuiz, type Verdict } from '~/utils/quiz'

const props = defineProps<{ questions: unknown; final?: boolean }>()

const route = useRoute()
const { recordQuiz } = useProgress()
const isDev = import.meta.dev

const parsed = computed(() => quizSchema.safeParse(props.questions))
const list = computed<Question[]>(() => (parsed.value.success ? parsed.value.data : []))
const errors = computed(() =>
  parsed.value.success
    ? []
    : parsed.value.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
)

const attempt = ref(0)
const verdicts = ref<(Verdict | null)[]>([])

watch(
  [list, attempt],
  () => {
    verdicts.value = list.value.map(() => null)
  },
  { immediate: true },
)

const done = computed(() => verdicts.value.length > 0 && verdicts.value.every((v) => v !== null))
const score = computed(() => scoreQuiz(verdicts.value.filter((v): v is Verdict => v !== null)))

function onAnswered(index: number, verdict: Verdict) {
  const next = [...verdicts.value]
  next[index] = verdict
  verdicts.value = next
  if (props.final && next.every((v) => v !== null)) {
    recordQuiz(normalizePath(route.path), scoreQuiz(next as Verdict[]).percent)
  }
}
</script>

<template>
  <section v-if="list.length > 0" :key="attempt" class="quiz" aria-label="Упражнение">
    <ol class="quiz-questions">
      <li v-for="(question, i) in list" :key="i" class="quiz-question">
        <QuizChoice
          v-if="question.type === 'choice'"
          :question="question"
          @answered="onAnswered(i, $event)"
        />
        <QuizText
          v-else-if="question.type === 'input' || question.type === 'pattern'"
          :question="question"
          @answered="onAnswered(i, $event)"
        />
        <QuizMatch v-else :question="question" @answered="onAnswered(i, $event)" />
      </li>
    </ol>
    <div v-if="done" class="quiz-summary" role="status">
      <strong>{{ score.correct }} из {{ score.total }}</strong>
      <span v-if="final && score.passed"> — урок пройден!</span>
      <span v-else-if="final"> — нужно {{ PASS_PERCENT }}%, попробуйте ещё раз.</span>
      <button type="button" @click="attempt++">Пройти ещё раз</button>
    </div>
  </section>
  <div v-else-if="isDev" class="quiz-error">
    Ошибка в упражнении:
    <ul>
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<style scoped>
.quiz {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1rem 1.25rem;
  margin: 2rem 0;
}
.quiz-questions {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.quiz-summary {
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.quiz-summary button {
  font: inherit;
  margin-left: auto;
  cursor: pointer;
}
.quiz-error {
  color: #fff;
  background: #c62828;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}
</style>
```

- [ ] **Step 12: Implement `app/components/LessonDone.vue`**

```vue
<script setup lang="ts">
defineProps<{ path: string }>()
const { loaded, isLessonCompleted, markRead } = useProgress()
</script>

<template>
  <div class="lesson-done">
    <p v-if="isLessonCompleted(path)" class="done">✓ Урок пройден</p>
    <button v-else-if="loaded" type="button" @click="markRead(path)">Урок прочитан</button>
  </div>
</template>

<style scoped>
.lesson-done {
  margin: 3rem 0 1rem;
  text-align: center;
  min-height: 2.5rem;
}
.done {
  color: var(--cognate);
  font-weight: 600;
}
button {
  font: inherit;
  padding: 0.4rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--callout-bg);
  color: var(--fg);
  cursor: pointer;
}
</style>
```

- [ ] **Step 13: Run the component tests to verify they pass**

Run: `pnpm vitest run --project nuxt tests/nuxt/quiz.test.ts tests/nuxt/lesson-done.test.ts`
Expected: PASS (8 tests). If `mountSuspended` does not accept the `route` option in this version, call `await navigateTo(route)` before mounting instead.

- [ ] **Step 14: Wire `LessonDone` into the lesson page and add a sample quiz**

In `app/pages/lessons/[...slug].vue` change the template's article to:
```vue
  <article v-if="page" class="content">
    <h1>
      <span v-if="current" class="lesson-label">{{ current.label }}</span>
      {{ page.title }}
    </h1>
    <ContentRenderer :value="page" />
    <LessonDone :path="path" />
  </article>
```

Append to `content/lessons/02-sounds/01-rz.md`:
```md

::quiz
---
final: true
questions:
  - type: choice
    q: Как по-польски «река»?
    options: [reka, rzeka, żeka]
    answer: 1
  - type: pattern
    q: Русское «берег» → по-польски?
    pattern: rz-р
    answer: brzeg
  - type: match
    q: Соедините слова
    pairs:
      - [rzeka, река]
      - [brzeg, берег]
---
::
```

- [ ] **Step 15: Verify in the generated site**

Run: `pnpm generate && grep -c 'class="quiz"' .output/public/lessons/02-sounds/01-rz/index.html`
Expected: ≥ 1.

Manual: `pnpm preview`, open `/lessons/02-sounds/01-rz`, answer all three correctly → «3 из 3 — урок пройден!» and `✓` appears next to `2.1` in the sidebar; reload → `✓` persists. Stop the server.

- [ ] **Step 16: Full test run, lint, typecheck, commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add lesson quizzes with scoring and completion tracking

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 3: Vocabulary page

**Files:**
- Create: `app/utils/vocabulary.ts`, `app/pages/vocabulary.vue`
- Modify: `app/components/AppSidebar.vue` (add «Словарь»)
- Test: `tests/unit/vocabulary.test.ts`, `tests/nuxt/vocabulary-page.test.ts`

**Interfaces:**
- Consumes: `Word` (`shared/schemas.ts`), `normalizeLoose` (`app/utils/normalize.ts`), `POS_LABELS`, `GENDER_LABELS` (`app/utils/labels.ts`), `useWords`, `usePatterns`, `SpeakButton`, fixtures (Plan 2).
- Produces:
  - `interface WordFilter { query: string; chapter: number | null; topic: string | null; falseFriendsOnly: boolean }`
  - `filterWords(words: Word[], filter: WordFilter): Word[]` — query matches a substring of `normalizeLoose(pl)` or `normalizeLoose(ru)`; result sorted by `pl.localeCompare(…, 'pl')`
  - `listTopics(words: Word[]): string[]` (unique, sorted with `'ru'` locale), `listChapters(words: Word[]): number[]` (unique, ascending)
  - Route `/vocabulary`: filters (search input, chapter select, topic select, false-friends checkbox), count `Найдено слов: N`, table rows `tr#<wordId>`; `#wordId` in the URL highlights that row via `:target`

- [ ] **Step 1: Write the failing unit tests**

`tests/unit/vocabulary.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import type { Word } from '../../shared/schemas'
import { filterWords, listChapters, listTopics } from '../../app/utils/vocabulary'

const words: Word[] = [
  { id: 'rzeka', pl: 'rzeka', ru: 'река', pos: 'noun', pron: 'жэ́ка', pattern: 'rz-р', topic: 'природа', chapter: 2 },
  { id: 'zab', pl: 'ząb', ru: 'зуб', pos: 'noun', pron: 'зомп', topic: 'тело', chapter: 2 },
  { id: 'uroda', pl: 'uroda', ru: 'красота', pos: 'noun', pron: 'уро́да', falseFriend: { ru: 'урод', meaning: 'красота' }, topic: 'люди', chapter: 3 },
  { id: 'cmentarz', pl: 'cmentarz', ru: 'кладбище', pos: 'noun', pron: 'цмэ́нташ', topic: 'город', chapter: 1 },
]

const all = { query: '', chapter: null, topic: null, falseFriendsOnly: false }

describe('filterWords', () => {
  it('returns all words sorted by Polish collation', () => {
    expect(filterWords(words, all).map((w) => w.pl)).toEqual(['cmentarz', 'rzeka', 'uroda', 'ząb'])
  })

  it('searches Polish without diacritics and Russian', () => {
    expect(filterWords(words, { ...all, query: 'zab' }).map((w) => w.id)).toEqual(['zab'])
    expect(filterWords(words, { ...all, query: 'КРАС' }).map((w) => w.id)).toEqual(['uroda'])
  })

  it('filters by chapter, topic and false friends', () => {
    expect(filterWords(words, { ...all, chapter: 2 }).map((w) => w.id)).toEqual(['rzeka', 'zab'])
    expect(filterWords(words, { ...all, topic: 'тело' }).map((w) => w.id)).toEqual(['zab'])
    expect(filterWords(words, { ...all, falseFriendsOnly: true }).map((w) => w.id)).toEqual(['uroda'])
  })
})

describe('listTopics / listChapters', () => {
  it('returns unique sorted values', () => {
    expect(listTopics(words)).toEqual(['город', 'люди', 'природа', 'тело'])
    expect(listChapters(words)).toEqual([1, 2, 3])
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project unit tests/unit/vocabulary.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/utils/vocabulary.ts`**

```ts
import type { Word } from '../../shared/schemas'
import { normalizeLoose } from './normalize'

export interface WordFilter {
  query: string
  chapter: number | null
  topic: string | null
  falseFriendsOnly: boolean
}

export function filterWords(words: Word[], filter: WordFilter): Word[] {
  const query = normalizeLoose(filter.query)
  return words
    .filter((w) => filter.chapter === null || w.chapter === filter.chapter)
    .filter((w) => filter.topic === null || w.topic === filter.topic)
    .filter((w) => !filter.falseFriendsOnly || w.falseFriend !== undefined)
    .filter(
      (w) => !query || normalizeLoose(w.pl).includes(query) || normalizeLoose(w.ru).includes(query),
    )
    .sort((a, b) => a.pl.localeCompare(b.pl, 'pl'))
}

export function listTopics(words: Word[]): string[] {
  return [...new Set(words.map((w) => w.topic))].sort((a, b) => a.localeCompare(b, 'ru'))
}

export function listChapters(words: Word[]): number[] {
  return [...new Set(words.map((w) => w.chapter))].sort((a, b) => a - b)
}
```

- [ ] **Step 4: Run them to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/vocabulary.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Write the failing page test**

`tests/nuxt/vocabulary-page.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import VocabularyPage from '~/pages/vocabulary.vue'

const { wordsApi, patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)
mockNuxtImport('usePatterns', () => patternsApi)

describe('vocabulary page', () => {
  it('lists all words with anchors and notes', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    expect(wrapper.find('.count').text()).toBe('Найдено слов: 5')
    expect(wrapper.find('tr#rzeka').exists()).toBe(true)
    expect(wrapper.find('tr#rzeka .pattern').text()).toContain('rz ↔ р')
    expect(wrapper.find('tr#uroda .ff').text()).toContain('урод')
    expect(wrapper.find('tr#glowa td.meta').text()).toBe('сущ., ж. р.')
  })

  it('filters by search text without diacritics', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    await wrapper.find('input[type="search"]').setValue('glowa')
    expect(wrapper.findAll('tbody tr').map((tr) => tr.attributes('id'))).toEqual(['glowa'])
  })

  it('filters false friends only', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(wrapper.findAll('tbody tr').map((tr) => tr.attributes('id'))).toEqual(['uroda'])
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm vitest run --project nuxt tests/nuxt/vocabulary-page.test.ts`
Expected: FAIL — page not found.

- [ ] **Step 7: Implement `app/pages/vocabulary.vue`**

```vue
<script setup lang="ts">
import { GENDER_LABELS, POS_LABELS } from '~/utils/labels'
import { filterWords, listChapters, listTopics } from '~/utils/vocabulary'

useSeoMeta({
  title: 'Словарь',
  description: 'Все слова курса с переводом, произношением и соответствиями русскому.',
})

const { words } = useWords()
const { byId: patternsById } = usePatterns()

const query = ref('')
const chapter = ref<number | null>(null)
const topic = ref<string | null>(null)
const falseFriendsOnly = ref(false)

const chapters = computed(() => listChapters(words.value))
const topics = computed(() => listTopics(words.value))
const rows = computed(() =>
  filterWords(words.value, {
    query: query.value,
    chapter: chapter.value,
    topic: topic.value,
    falseFriendsOnly: falseFriendsOnly.value,
  }),
)
</script>

<template>
  <article class="content vocabulary">
    <h1>Словарь</h1>
    <form class="filters" role="search" @submit.prevent>
      <input
        v-model="query"
        type="search"
        placeholder="Поиск по-польски или по-русски"
        aria-label="Поиск слова"
      />
      <select v-model="chapter" aria-label="Глава">
        <option :value="null">Все главы</option>
        <option v-for="c in chapters" :key="c" :value="c">Глава {{ c }}</option>
      </select>
      <select v-model="topic" aria-label="Тема">
        <option :value="null">Все темы</option>
        <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
      </select>
      <label class="checkbox">
        <input v-model="falseFriendsOnly" type="checkbox" />
        Только ложные друзья
      </label>
    </form>
    <p class="count">Найдено слов: {{ rows.length }}</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Таблица слов">
      <table>
        <thead>
          <tr>
            <th scope="col">Польский</th>
            <th scope="col">Русский</th>
            <th scope="col">Произношение</th>
            <th scope="col">Грамматика</th>
            <th scope="col">Заметка</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="word in rows" :id="word.id" :key="word.id">
            <td lang="pl" class="pl">{{ word.pl }} <SpeakButton :text="word.pl" /></td>
            <td>{{ word.ru }}</td>
            <td class="pron">[{{ word.pron }}]</td>
            <td class="meta">
              {{ POS_LABELS[word.pos] }}<template v-if="word.gender">, {{ GENDER_LABELS[word.gender] }}</template>
            </td>
            <td>
              <span v-if="word.falseFriend" class="ff">
                ⚠ не «{{ word.falseFriend.ru }}»: {{ word.falseFriend.meaning }}
              </span>
              <span v-else-if="word.pattern && patternsById.get(word.pattern)" class="pattern">
                <span lang="pl">{{ patternsById.get(word.pattern)?.pl }}</span> ↔
                {{ patternsById.get(word.pattern)?.ru }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin: 1rem 0;
}
.filters input[type='search'],
.filters select {
  font: inherit;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--fg);
}
.filters input[type='search'] {
  flex: 1 1 14rem;
}
.count {
  color: var(--muted);
  font-size: 0.875rem;
}
.pl {
  color: var(--accent-pl);
  font-weight: 600;
  white-space: nowrap;
}
.pron,
.meta {
  color: var(--muted);
  font-style: italic;
}
.ff {
  color: var(--false-friend);
}
.pattern {
  color: var(--cognate);
}
tr:target td {
  background: var(--highlight);
}
</style>
```

- [ ] **Step 8: Run the page test to verify it passes**

Run: `pnpm vitest run --project nuxt tests/nuxt/vocabulary-page.test.ts`
Expected: PASS (3 tests). If the `td.meta` text contains extra whitespace, compare with `.text().replace(/\s+/g, ' ').trim()`.

- [ ] **Step 9: Add the sidebar link**

In `app/components/AppSidebar.vue` set:
```ts
const sections = [
  { to: '/stories', label: 'Истории' },
  { to: '/vocabulary', label: 'Словарь' },
  { to: '/cheatsheet', label: 'Шпаргалка' },
]
```

- [ ] **Step 10: Verify generated page**

Run: `pnpm generate && grep -c 'id="rzeka"' .output/public/vocabulary/index.html`
Expected: ≥ 1.

- [ ] **Step 11: Full test run, lint, typecheck, commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add vocabulary page with search and filters

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 4: Leitner scheduling and flashcards

**Files:**
- Create: `app/utils/leitner.ts`, `app/utils/deck.ts`, `app/composables/useLessonWords.ts`, `app/components/FlashcardSession.vue`, `app/pages/flashcards.vue`
- Modify: `app/composables/useProgress.ts` (add `reviewCard`), `app/components/AppSidebar.vue` (add «Карточки»)
- Test: `tests/unit/leitner.test.ts`, `tests/unit/deck.test.ts`, `tests/nuxt/use-progress.test.ts` (extend), `tests/nuxt/flashcard-session.test.ts`

**Interfaces:**
- Consumes: `Word` (`shared/schemas.ts`); `useProgress`, `Settings` (Task 1); `useWords`, `usePatterns`, `SpeakButton`, fixtures (Plan 2).
- Produces (`app/utils/leitner.ts`):
  - `INTERVALS = [0, 1, 3, 7, 14] as const`, `MAX_BOX = 5`, `NEW_CARDS_PER_SESSION = 10`
  - `interface CardState { box: number; due: string }`
  - `toDay(date: Date): string` (local `YYYY-MM-DD`), `addDays(day: string, days: number): string`
  - `review(state: CardState | undefined, remembered: boolean, now: Date): CardState` — remembered → `min(box + 1, 5)` (new card counts as box 1); forgotten → box 1; `due = today + INTERVALS[box - 1]`
  - `isDue(state: CardState, now: Date): boolean` — `due <= today`
  - `buildSession(ids: string[], cards: Record<string, CardState>, now: Date, newLimit?: number): string[]` — due cards (by due date, then input order) followed by up to `newLimit` ids without state (input order)
- Produces (`app/utils/deck.ts`):
  - `type DeckFilter = { kind: 'chapter'; chapter: number } | { kind: 'topic'; topic: string } | { kind: 'learned' } | { kind: 'false-friends' }`
  - `learnedWordIds(lessons: { path: string; words?: string[] }[], isCompleted: (path: string) => boolean): Set<string>`
  - `selectWords(words: Word[], filter: DeckFilter, learned: Set<string>): Word[]`
  - `type CardSide = 'pl-ru' | 'ru-pl'`; `resolveDirection(setting: Settings['direction'], random?: () => number): CardSide` — `mixed` → `random() < 0.5 ? 'pl-ru' : 'ru-pl'`
- Produces (other):
  - `useProgress().reviewCard(wordId: string, remembered: boolean): void`
  - `useLessonWords()` — `useAsyncData('content:lesson-words')` returning `{ path, words }[]` of all lessons
  - `<FlashcardSession :words="Word[]" :direction="Settings['direction']" @review="(wordId, remembered)" @finish="({ remembered, forgotten })" />` — `.card-front`, `.card-back` (after flip), buttons `.flip`, `.forgot`, `.remember`; keys Space/Enter flip, `1` forgot, `2` remember (answer keys ignored before flip)
  - Route `/flashcards`

- [ ] **Step 1: Write the failing unit tests**

`tests/unit/leitner.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { addDays, buildSession, isDue, review, toDay } from '../../app/utils/leitner'

const now = new Date(2026, 8, 14, 23, 30) // 14 Sep 2026, local time

describe('toDay / addDays', () => {
  it('formats local dates', () => {
    expect(toDay(now)).toBe('2026-09-14')
  })

  it('adds days across month boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-09-14', 0)).toBe('2026-09-14')
  })
})

describe('review', () => {
  it('moves a new remembered card to box 2 due tomorrow', () => {
    expect(review(undefined, true, now)).toEqual({ box: 2, due: '2026-09-15' })
  })

  it('keeps a forgotten card in box 1 due today', () => {
    expect(review(undefined, false, now)).toEqual({ box: 1, due: '2026-09-14' })
  })

  it('uses the interval of the new box', () => {
    expect(review({ box: 2, due: '2026-09-14' }, true, now)).toEqual({ box: 3, due: '2026-09-17' })
    expect(review({ box: 3, due: '2026-09-14' }, true, now)).toEqual({ box: 4, due: '2026-09-21' })
  })

  it('caps at box 5 with a 14-day interval', () => {
    expect(review({ box: 5, due: '2026-09-14' }, true, now)).toEqual({ box: 5, due: '2026-09-28' })
  })

  it('resets any box to 1 when forgotten', () => {
    expect(review({ box: 4, due: '2026-09-14' }, false, now)).toEqual({ box: 1, due: '2026-09-14' })
  })
})

describe('isDue', () => {
  it('is due on or after the due date', () => {
    expect(isDue({ box: 2, due: '2026-09-14' }, now)).toBe(true)
    expect(isDue({ box: 2, due: '2026-09-13' }, now)).toBe(true)
    expect(isDue({ box: 2, due: '2026-09-15' }, now)).toBe(false)
  })
})

describe('buildSession', () => {
  it('puts due cards first by due date, then new cards up to the limit', () => {
    const cards = {
      a: { box: 2, due: '2026-09-14' },
      b: { box: 3, due: '2026-09-10' },
      c: { box: 4, due: '2026-10-01' },
    }
    expect(buildSession(['n1', 'a', 'n2', 'b', 'c', 'n3'], cards, now, 2)).toEqual(['b', 'a', 'n1', 'n2'])
  })

  it('defaults to 10 new cards', () => {
    const ids = Array.from({ length: 15 }, (_, i) => `w${i}`)
    expect(buildSession(ids, {}, now)).toHaveLength(10)
  })
})
```

`tests/unit/deck.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import type { Word } from '../../shared/schemas'
import { learnedWordIds, resolveDirection, selectWords } from '../../app/utils/deck'

const words: Word[] = [
  { id: 'rzeka', pl: 'rzeka', ru: 'река', pos: 'noun', pron: 'жэ́ка', topic: 'природа', chapter: 2 },
  { id: 'uroda', pl: 'uroda', ru: 'красота', pos: 'noun', pron: 'уро́да', falseFriend: { ru: 'урод', meaning: 'красота' }, topic: 'люди', chapter: 2 },
  { id: 'dom', pl: 'dom', ru: 'дом', pos: 'noun', pron: 'дом', topic: 'дом', chapter: 3 },
]

describe('learnedWordIds', () => {
  it('collects words of completed lessons only', () => {
    const lessons = [
      { path: '/a', words: ['rzeka', 'uroda'] },
      { path: '/b', words: ['dom'] },
      { path: '/c' },
    ]
    expect([...learnedWordIds(lessons, (p) => p !== '/b')]).toEqual(['rzeka', 'uroda'])
  })
})

describe('selectWords', () => {
  const learned = new Set(['dom'])

  it('selects by chapter, topic, learned and false friends', () => {
    expect(selectWords(words, { kind: 'chapter', chapter: 2 }, learned).map((w) => w.id)).toEqual(['rzeka', 'uroda'])
    expect(selectWords(words, { kind: 'topic', topic: 'дом' }, learned).map((w) => w.id)).toEqual(['dom'])
    expect(selectWords(words, { kind: 'learned' }, learned).map((w) => w.id)).toEqual(['dom'])
    expect(selectWords(words, { kind: 'false-friends' }, learned).map((w) => w.id)).toEqual(['uroda'])
  })
})

describe('resolveDirection', () => {
  it('keeps fixed directions and randomizes mixed', () => {
    expect(resolveDirection('ru-pl')).toBe('ru-pl')
    expect(resolveDirection('mixed', () => 0.2)).toBe('pl-ru')
    expect(resolveDirection('mixed', () => 0.7)).toBe('ru-pl')
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project unit tests/unit/leitner.test.ts tests/unit/deck.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `app/utils/leitner.ts`**

```ts
export const INTERVALS = [0, 1, 3, 7, 14] as const
export const MAX_BOX = 5
export const NEW_CARDS_PER_SESSION = 10

export interface CardState {
  box: number
  due: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function toDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(day: string, days: number): string {
  const [year, month, date] = day.split('-').map(Number)
  return toDay(new Date(year!, month! - 1, date! + days))
}

export function review(state: CardState | undefined, remembered: boolean, now: Date): CardState {
  const box = remembered ? Math.min((state?.box ?? 1) + 1, MAX_BOX) : 1
  return { box, due: addDays(toDay(now), INTERVALS[box - 1]!) }
}

export function isDue(state: CardState, now: Date): boolean {
  return state.due <= toDay(now)
}

export function buildSession(
  ids: string[],
  cards: Record<string, CardState>,
  now: Date,
  newLimit: number = NEW_CARDS_PER_SESSION,
): string[] {
  const due = ids
    .map((id, index) => ({ id, index, state: cards[id] }))
    .filter((entry): entry is { id: string; index: number; state: CardState } =>
      entry.state !== undefined ? isDue(entry.state, now) : false,
    )
    .sort((a, b) => a.state.due.localeCompare(b.state.due) || a.index - b.index)
    .map((entry) => entry.id)
  const fresh = ids.filter((id) => cards[id] === undefined).slice(0, newLimit)
  return [...due, ...fresh]
}
```

- [ ] **Step 4: Implement `app/utils/deck.ts`**

```ts
import type { Word } from '../../shared/schemas'

export type DeckFilter =
  | { kind: 'chapter'; chapter: number }
  | { kind: 'topic'; topic: string }
  | { kind: 'learned' }
  | { kind: 'false-friends' }

export type CardSide = 'pl-ru' | 'ru-pl'

export function learnedWordIds(
  lessons: { path: string; words?: string[] }[],
  isCompleted: (path: string) => boolean,
): Set<string> {
  return new Set(lessons.filter((l) => isCompleted(l.path)).flatMap((l) => l.words ?? []))
}

export function selectWords(words: Word[], filter: DeckFilter, learned: Set<string>): Word[] {
  switch (filter.kind) {
    case 'chapter':
      return words.filter((w) => w.chapter === filter.chapter)
    case 'topic':
      return words.filter((w) => w.topic === filter.topic)
    case 'learned':
      return words.filter((w) => learned.has(w.id))
    case 'false-friends':
      return words.filter((w) => w.falseFriend !== undefined)
  }
}

export function resolveDirection(
  setting: 'pl-ru' | 'ru-pl' | 'mixed',
  random: () => number = Math.random,
): CardSide {
  if (setting !== 'mixed') return setting
  return random() < 0.5 ? 'pl-ru' : 'ru-pl'
}
```

- [ ] **Step 5: Run unit tests to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/leitner.test.ts tests/unit/deck.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 6: Add `reviewCard` to `useProgress` (test first)**

Append to the `describe` block in `tests/nuxt/use-progress.test.ts`:
```ts
  it('schedules reviewed cards', () => {
    const { reviewCard, progress } = useProgress()
    reviewCard('rzeka', true)
    expect(progress.value.cards.rzeka?.box).toBe(2)
    reviewCard('rzeka', false)
    expect(progress.value.cards.rzeka?.box).toBe(1)
  })
```

Run: `pnpm vitest run --project nuxt tests/nuxt/use-progress.test.ts`
Expected: FAIL — `reviewCard is not a function`.

In `app/composables/useProgress.ts` add the import:
```ts
import { review } from '~/utils/leitner'
```
add inside `useProgress()`:
```ts
  function reviewCard(wordId: string, remembered: boolean) {
    progress.value = {
      ...progress.value,
      cards: {
        ...progress.value.cards,
        [wordId]: review(progress.value.cards[wordId], remembered, new Date()),
      },
    }
  }
```
and add `reviewCard` to the returned object.

Run: `pnpm vitest run --project nuxt tests/nuxt/use-progress.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Write the failing `FlashcardSession` test**

`tests/nuxt/flashcard-session.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import FlashcardSession from '~/components/FlashcardSession.vue'
import { nextTick } from 'vue'

const { words, patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('usePatterns', () => patternsApi)

const deck = [words[0]!, words[3]!] // rzeka, uroda
let wrapper: VueWrapper | undefined

afterEach(() => wrapper?.unmount())

async function press(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }))
  await nextTick()
}

describe('FlashcardSession', () => {
  it('flips and answers with the keyboard, then finishes', async () => {
    wrapper = await mountSuspended(FlashcardSession, { props: { words: deck, direction: 'pl-ru' } })
    expect(wrapper.find('.card-front').text()).toContain('rzeka')
    expect(wrapper.find('.card-back').exists()).toBe(false)

    await press('2')
    expect(wrapper.emitted('review')).toBeUndefined()

    await press(' ')
    expect(wrapper.find('.card-back').text()).toContain('река')
    expect(wrapper.find('.card-back').text()).toContain('rz ↔ р')

    await press('2')
    expect(wrapper.emitted('review')?.[0]).toEqual(['rzeka', true])
    expect(wrapper.find('.card-front').text()).toContain('uroda')

    await wrapper.find('button.flip').trigger('click')
    expect(wrapper.find('.card-back').text()).toContain('Ложный друг')
    await wrapper.find('button.forgot').trigger('click')

    expect(wrapper.emitted('review')?.[1]).toEqual(['uroda', false])
    expect(wrapper.emitted('finish')?.[0]).toEqual([{ remembered: 1, forgotten: 1 }])
  })

  it('shows Russian on the front for ru-pl', async () => {
    wrapper = await mountSuspended(FlashcardSession, { props: { words: deck, direction: 'ru-pl' } })
    expect(wrapper.find('.card-front').text()).toContain('река')
    await wrapper.find('button.flip').trigger('click')
    expect(wrapper.find('.card-back [lang="pl"]').text()).toBe('rzeka')
  })
})
```

- [ ] **Step 8: Run it to verify it fails**

Run: `pnpm vitest run --project nuxt tests/nuxt/flashcard-session.test.ts`
Expected: FAIL — component not found.

- [ ] **Step 9: Implement `app/components/FlashcardSession.vue`**

```vue
<script setup lang="ts">
import type { Word } from '#shared/schemas'
import { resolveDirection } from '~/utils/deck'

const props = defineProps<{ words: Word[]; direction: 'pl-ru' | 'ru-pl' | 'mixed' }>()
const emit = defineEmits<{
  review: [wordId: string, remembered: boolean]
  finish: [summary: { remembered: number; forgotten: number }]
}>()

const { byId: patternsById } = usePatterns()

// Directions are fixed per session so a card does not change sides on re-render.
const sides = props.words.map(() => resolveDirection(props.direction))

const index = ref(0)
const flipped = ref(false)
const remembered = ref(0)
const forgotten = ref(0)

const word = computed(() => props.words[index.value] ?? null)
const side = computed(() => sides[index.value] ?? 'pl-ru')
const pattern = computed(() =>
  word.value?.pattern ? (patternsById.value.get(word.value.pattern) ?? null) : null,
)

function flip() {
  flipped.value = true
}

function answer(ok: boolean) {
  if (!word.value || !flipped.value) return
  emit('review', word.value.id, ok)
  if (ok) remembered.value++
  else forgotten.value++
  flipped.value = false
  index.value++
  if (index.value >= props.words.length) {
    emit('finish', { remembered: remembered.value, forgotten: forgotten.value })
  }
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target
  if (target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return
  if ((event.key === ' ' || event.key === 'Enter') && !flipped.value) {
    event.preventDefault()
    flip()
  } else if (event.key === '1') {
    answer(false)
  } else if (event.key === '2') {
    answer(true)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="word" class="flashcard-session">
    <p class="counter">{{ index + 1 }} / {{ words.length }}</p>
    <div class="card">
      <div class="card-front">
        <template v-if="side === 'pl-ru'">
          <span lang="pl" class="card-word">{{ word.pl }}</span>
          <SpeakButton :text="word.pl" />
        </template>
        <span v-else class="card-word">{{ word.ru }}</span>
      </div>
      <div v-if="flipped" class="card-back">
        <span v-if="side === 'pl-ru'" class="card-answer">{{ word.ru }}</span>
        <span v-else class="card-answer">
          <span lang="pl">{{ word.pl }}</span>
          <SpeakButton :text="word.pl" />
        </span>
        <span class="card-pron">[{{ word.pron }}]</span>
        <span v-if="pattern" class="card-pattern">
          <span lang="pl">{{ pattern.pl }}</span> ↔ {{ pattern.ru }}
        </span>
        <span v-if="word.falseFriend" class="card-ff">
          ⚠ Ложный друг: не «{{ word.falseFriend.ru }}»
        </span>
      </div>
    </div>
    <div class="actions">
      <button v-if="!flipped" type="button" class="flip" @click="flip">
        Показать ответ <kbd>Пробел</kbd>
      </button>
      <template v-else>
        <button type="button" class="forgot" @click="answer(false)">Не помню <kbd>1</kbd></button>
        <button type="button" class="remember" @click="answer(true)">Помню <kbd>2</kbd></button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.counter {
  color: var(--muted);
  text-align: center;
}
.card {
  border: 1px solid var(--border);
  border-radius: 8px;
  min-height: 12rem;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
}
.card-word {
  font-size: 2rem;
  font-weight: 600;
}
.card-front [lang='pl'],
.card-back [lang='pl'] {
  color: var(--accent-pl);
}
.card-back {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.card-answer {
  font-size: 1.5rem;
}
.card-pron {
  color: var(--muted);
  font-style: italic;
}
.card-pattern {
  color: var(--cognate);
}
.card-ff {
  color: var(--false-friend);
}
.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
.actions button {
  font: inherit;
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--callout-bg);
  color: var(--fg);
  cursor: pointer;
}
kbd {
  font-size: 0.75em;
  color: var(--muted);
  margin-left: 0.25rem;
}
</style>
```

- [ ] **Step 10: Run the component test to verify it passes**

Run: `pnpm vitest run --project nuxt tests/nuxt/flashcard-session.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 11: Implement `useLessonWords` and the flashcards page**

`app/composables/useLessonWords.ts`:
```ts
export function useLessonWords() {
  return useAsyncData('content:lesson-words', () =>
    queryCollection('lessons').select('path', 'words').all(),
  )
}
```

`app/pages/flashcards.vue`:
```vue
<script setup lang="ts">
import type { Word } from '#shared/schemas'
import { learnedWordIds, selectWords, type DeckFilter } from '~/utils/deck'
import { buildSession, isDue } from '~/utils/leitner'
import { listTopics } from '~/utils/vocabulary'

useSeoMeta({ title: 'Карточки', description: 'Повторение слов по системе Лейтнера.' })

const { words } = useWords()
const { progress, loaded, isLessonCompleted, reviewCard, updateSettings } = useProgress()
const { data: lessonWords } = await useLessonWords()
const { data: chapters } = await useAsyncData('content:chapters', () =>
  queryCollection('chapters').first(),
)

const kind = ref<DeckFilter['kind']>('learned')
const chapter = ref(1)
const topics = computed(() => listTopics(words.value))
const topic = ref('')
watch(
  topics,
  (list) => {
    if (!topic.value && list[0]) topic.value = list[0]
  },
  { immediate: true },
)

const direction = computed({
  get: () => progress.value.settings.direction,
  set: (value) => updateSettings({ direction: value }),
})

const filter = computed<DeckFilter>(() => {
  if (kind.value === 'chapter') return { kind: 'chapter', chapter: chapter.value }
  if (kind.value === 'topic') return { kind: 'topic', topic: topic.value }
  return { kind: kind.value }
})

const learned = computed(() => learnedWordIds(lessonWords.value ?? [], isLessonCompleted))
const deck = computed(() => selectWords(words.value, filter.value, learned.value))
const sessionIds = computed(() =>
  buildSession(
    deck.value.map((w) => w.id),
    progress.value.cards,
    new Date(),
  ),
)
const dueCount = computed(() => {
  const now = new Date()
  return deck.value.filter((w) => {
    const card = progress.value.cards[w.id]
    return card !== undefined && isDue(card, now)
  }).length
})
const newCount = computed(() => sessionIds.value.length - dueCount.value)

const session = ref<Word[] | null>(null)
const summary = ref<{ remembered: number; forgotten: number } | null>(null)

function start() {
  const byId = new Map(words.value.map((w) => [w.id, w]))
  session.value = sessionIds.value.map((id) => byId.get(id)).filter((w): w is Word => !!w)
  summary.value = null
}

function onFinish(result: { remembered: number; forgotten: number }) {
  summary.value = result
  session.value = null
}
</script>

<template>
  <article class="content flashcards">
    <h1>Карточки</h1>
    <ClientOnly>
      <template #fallback><p>Загрузка…</p></template>
      <p v-if="!loaded">Загрузка…</p>
      <FlashcardSession
        v-else-if="session"
        :words="session"
        :direction="direction"
        @review="reviewCard"
        @finish="onFinish"
      />
      <template v-else>
        <p v-if="summary" class="summary" role="status">
          Сессия завершена. Помню: {{ summary.remembered }} · Не помню: {{ summary.forgotten }}
        </p>
        <form class="setup" @submit.prevent="start">
          <fieldset>
            <legend>Какие слова</legend>
            <label><input v-model="kind" type="radio" value="learned" /> Изученные слова</label>
            <label>
              <input v-model="kind" type="radio" value="chapter" /> Глава
              <select v-model="chapter" :disabled="kind !== 'chapter'" aria-label="Глава">
                <option v-for="c in chapters?.chapters ?? []" :key="c.number" :value="c.number">
                  {{ c.number }}. {{ c.title }}
                </option>
              </select>
            </label>
            <label>
              <input v-model="kind" type="radio" value="topic" /> Тема
              <select v-model="topic" :disabled="kind !== 'topic'" aria-label="Тема">
                <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>
            <label>
              <input v-model="kind" type="radio" value="false-friends" /> Только ложные друзья
            </label>
          </fieldset>
          <fieldset>
            <legend>Направление</legend>
            <label><input v-model="direction" type="radio" value="pl-ru" /> Польский → русский</label>
            <label><input v-model="direction" type="radio" value="ru-pl" /> Русский → польский</label>
            <label><input v-model="direction" type="radio" value="mixed" /> Вперемешку</label>
          </fieldset>
          <p class="counts">К повторению: {{ dueCount }} · новых: {{ newCount }}</p>
          <p v-if="kind === 'learned' && deck.length === 0" class="hint">
            Пока нет изученных слов — пройдите урок или выберите главу.
          </p>
          <button type="submit" :disabled="sessionIds.length === 0">Начать</button>
        </form>
      </template>
    </ClientOnly>
  </article>
</template>

<style scoped>
fieldset {
  border: 1px solid var(--border);
  border-radius: 6px;
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
}
label {
  display: block;
  padding: 0.15rem 0;
}
select {
  font: inherit;
  margin-left: 0.25rem;
}
.counts,
.hint {
  color: var(--muted);
}
.summary {
  font-weight: 600;
}
button[type='submit'] {
  font: inherit;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
}
</style>
```

In `app/components/AppSidebar.vue` set:
```ts
const sections = [
  { to: '/stories', label: 'Истории' },
  { to: '/vocabulary', label: 'Словарь' },
  { to: '/flashcards', label: 'Карточки' },
  { to: '/cheatsheet', label: 'Шпаргалка' },
]
```

- [ ] **Step 12: Verify generation and a manual session**

Run: `pnpm generate`
Expected: exit 0, `/flashcards` prerendered.

Manual: `pnpm preview`, open `/flashcards`, choose «Глава 2. Звуковые соответствия», press «Начать»: cards appear; Space flips; `2` / `1` answer; the summary appears after the last card; reopen the setup and «К повторению» / «новых» counts reflect the reviewed cards after reload. Stop the server.

- [ ] **Step 13: Full test run, lint, typecheck, commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add Leitner flashcards

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 5: Settings page, settings wiring and home progress summary

**Files:**
- Create: `app/utils/pron.ts`, `app/pages/settings.vue`
- Modify: `app/components/content/Pron.vue` (transcription visibility), `app/pages/lessons/[...slug].vue` (provide chapter), `app/pages/stories/[slug].vue` and `app/components/content/BilingualStory.vue` (story mode from settings), `app/components/AppTopbar.vue` (⚙ link), `app/pages/index.vue` (progress summary)
- Test: `tests/unit/pron.test.ts`, `tests/nuxt/pron.test.ts` (extend), `tests/nuxt/settings-page.test.ts`, `tests/nuxt/app.test.ts` (extend)

**Interfaces:**
- Consumes: `useProgress`, `exportProgress`, `importProgress`, `Settings` (Task 1); `toDay`, `isDue` (Task 4); `learnedWordIds` (Task 4); `useLessonWords` (Task 4).
- Produces:
  - `type PronSetting = 'auto' | 'always' | 'never'`, `AUTO_PRON_MAX_CHAPTER = 3`
  - `shouldShowPron(setting: PronSetting, chapter: number | null): boolean` — `auto` shows when `chapter` is `null` or `≤ 3`
  - `LESSON_CHAPTER_KEY: InjectionKey<number | null>` — provided by the lesson page
  - Route `/settings`: radio groups `name="theme" | "showPron" | "translationMode" | "direction"`; button `.export`; file input `input[type=file]`; status `.settings-message.is-ok | .is-error`
  - Home page `.progress-summary` text `Изучено слов: N · к повторению сегодня: M` (after progress loads)

- [ ] **Step 1: Write the failing unit test**

`tests/unit/pron.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { shouldShowPron } from '../../app/utils/pron'

describe('shouldShowPron', () => {
  it('always and never override the chapter', () => {
    expect(shouldShowPron('always', 9)).toBe(true)
    expect(shouldShowPron('never', 1)).toBe(false)
  })

  it('auto shows in chapters 1–3 and outside lessons', () => {
    expect(shouldShowPron('auto', 3)).toBe(true)
    expect(shouldShowPron('auto', 4)).toBe(false)
    expect(shouldShowPron('auto', null)).toBe(true)
  })
})
```

Run: `pnpm vitest run --project unit tests/unit/pron.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 2: Implement `app/utils/pron.ts`**

```ts
import type { InjectionKey } from 'vue'

export type PronSetting = 'auto' | 'always' | 'never'

export const AUTO_PRON_MAX_CHAPTER = 3

export const LESSON_CHAPTER_KEY: InjectionKey<number | null> = Symbol('lesson-chapter')

export function shouldShowPron(setting: PronSetting, chapter: number | null): boolean {
  if (setting === 'always') return true
  if (setting === 'never') return false
  return chapter === null || chapter <= AUTO_PRON_MAX_CHAPTER
}
```

Run: `pnpm vitest run --project unit tests/unit/pron.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 3: Extend the `Pron` test (failing)**

Add to `tests/nuxt/pron.test.ts` (imports: add `beforeEach` from `vitest`, `defaultProgress` from `~/utils/progress`, `LESSON_CHAPTER_KEY` from `~/utils/pron`):
```ts
describe('Pron transcription visibility', () => {
  beforeEach(() => {
    useProgress().replace(defaultProgress())
  })

  it('hides transcription when the setting is never', async () => {
    useProgress().updateSettings({ showPron: 'never' })
    const wrapper = await mountSuspended(Pron, { props: { id: 'rzeka' } })
    expect(wrapper.find('.pron-ru').exists()).toBe(false)
    expect(wrapper.find('.pron-pl').text()).toBe('rzeka')
  })

  it('hides transcription in auto mode after chapter 3', async () => {
    const wrapper = await mountSuspended(Pron, {
      props: { id: 'rzeka' },
      global: { provide: { [LESSON_CHAPTER_KEY as symbol]: 4 } },
    })
    expect(wrapper.find('.pron-ru').exists()).toBe(false)
  })

  it('shows transcription in auto mode in chapter 2', async () => {
    const wrapper = await mountSuspended(Pron, {
      props: { id: 'rzeka' },
      global: { provide: { [LESSON_CHAPTER_KEY as symbol]: 2 } },
    })
    expect(wrapper.find('.pron-ru').exists()).toBe(true)
  })
})
```

Run: `pnpm vitest run --project nuxt tests/nuxt/pron.test.ts`
Expected: FAIL — the first two new tests find `.pron-ru`.

- [ ] **Step 4: Update `Pron.vue` and provide the lesson chapter**

In `app/components/content/Pron.vue` replace the `<script setup>` block with:
```vue
<script setup lang="ts">
import { LESSON_CHAPTER_KEY, shouldShowPron } from '~/utils/pron'

const props = defineProps<{ id?: string; pl?: string; ru?: string }>()

const { byId } = useWords()
const { progress } = useProgress()
const chapter = inject(LESSON_CHAPTER_KEY, null)

const word = computed(() => (props.id ? (byId.value.get(props.id) ?? null) : null))
const polish = computed(() => props.pl ?? word.value?.pl ?? '')
const transcription = computed(() => props.ru ?? word.value?.pron ?? '')
const showTranscription = computed(() =>
  shouldShowPron(progress.value.settings.showPron, chapter),
)
</script>
```
and change the transcription span to:
```vue
    <span v-if="transcription && showTranscription" class="pron-ru">[{{ transcription }}]</span>
```

In `app/pages/lessons/[...slug].vue` add the import `import { LESSON_CHAPTER_KEY } from '~/utils/pron'` and, right after the 404 check, add:
```ts
provide(LESSON_CHAPTER_KEY, page.value.chapter)
```

Run: `pnpm vitest run --project nuxt tests/nuxt/pron.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Use the story mode setting**

In `app/pages/stories/[slug].vue` add `const { progress } = useProgress()` to the script and change the component to:
```vue
    <StoryView :story="story" :initial-mode="progress.settings.translationMode" />
```

Replace `app/components/content/BilingualStory.vue` with:
```vue
<script setup lang="ts">
const props = defineProps<{ id: string }>()
const { data: story } = await useStory(props.id)
const { progress } = useProgress()
</script>

<template>
  <StoryView v-if="story" :story="story" :initial-mode="progress.settings.translationMode" />
</template>
```

- [ ] **Step 6: Write the failing settings page test**

`tests/nuxt/settings-page.test.ts`:
```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SettingsPage from '~/pages/settings.vue'
import { defaultProgress, exportProgress, markLessonRead } from '~/utils/progress'

beforeEach(() => {
  const { replace, loaded } = useProgress()
  replace(defaultProgress())
  loaded.value = true
})

async function upload(wrapper: Awaited<ReturnType<typeof mountSuspended>>, text: string) {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', {
    value: [new File([text], 'progress.json', { type: 'application/json' })],
    configurable: true,
  })
  await input.trigger('change')
  await flushPromises()
}

describe('settings page', () => {
  it('updates settings from radio groups', async () => {
    const wrapper = await mountSuspended(SettingsPage)
    await wrapper.find('input[name="showPron"][value="never"]').setValue(true)
    await wrapper.find('input[name="translationMode"][value="hide"]').setValue(true)
    await wrapper.find('input[name="direction"][value="mixed"]').setValue(true)
    expect(useProgress().progress.value.settings).toEqual({
      showPron: 'never',
      translationMode: 'hide',
      direction: 'mixed',
    })
  })

  it('imports a valid progress file', async () => {
    const wrapper = await mountSuspended(SettingsPage)
    const saved = markLessonRead(defaultProgress(), '/lessons/a', new Date('2026-09-14T10:00:00Z'))
    await upload(wrapper, exportProgress(saved, 'dark'))
    expect(wrapper.find('.settings-message').classes()).toContain('is-ok')
    expect(useProgress().progress.value.lessons['/lessons/a']?.completed).toBe(true)
  })

  it('rejects an invalid file without touching progress', async () => {
    const wrapper = await mountSuspended(SettingsPage)
    await upload(wrapper, '{"version": 42}')
    expect(wrapper.find('.settings-message').classes()).toContain('is-error')
    expect(useProgress().progress.value).toEqual(defaultProgress())
  })
})
```

Run: `pnpm vitest run --project nuxt tests/nuxt/settings-page.test.ts`
Expected: FAIL — page not found.

- [ ] **Step 7: Implement `app/pages/settings.vue`**

```vue
<script setup lang="ts">
import { toDay } from '~/utils/leitner'
import { exportProgress, importProgress, THEMES, type Settings } from '~/utils/progress'

useSeoMeta({ title: 'Настройки', description: 'Тема, произношение, режим историй и перенос прогресса.' })

const colorMode = useColorMode()
const { progress, loaded, updateSettings, replace } = useProgress()

const themeLabels: Record<(typeof THEMES)[number], string> = {
  system: 'Системная',
  light: 'Светлая',
  sepia: 'Сепия',
  dark: 'Тёмная',
}

const groups = [
  {
    key: 'showPron',
    legend: 'Произношение кириллицей',
    options: [
      { value: 'auto', label: 'Авто (главы 1–3)' },
      { value: 'always', label: 'Всегда' },
      { value: 'never', label: 'Никогда' },
    ],
  },
  {
    key: 'translationMode',
    legend: 'Перевод в историях',
    options: [
      { value: 'tap', label: 'По нажатию' },
      { value: 'show', label: 'Показывать' },
      { value: 'hide', label: 'Скрывать' },
    ],
  },
  {
    key: 'direction',
    legend: 'Карточки',
    options: [
      { value: 'pl-ru', label: 'Польский → русский' },
      { value: 'ru-pl', label: 'Русский → польский' },
      { value: 'mixed', label: 'Вперемешку' },
    ],
  },
] as const

const message = ref<{ kind: 'ok' | 'error'; text: string } | null>(null)

function setOption(key: keyof Settings, value: string) {
  updateSettings({ [key]: value } as Partial<Settings>)
}

function download() {
  const text = exportProgress(progress.value, colorMode.preference)
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `polski-progress-${toDay(new Date())}.json`
  link.click()
  URL.revokeObjectURL(url)
}

async function upload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const result = importProgress(await file.text())
  if (!result) {
    message.value = { kind: 'error', text: 'Этот файл не похож на сохранённый прогресс курса.' }
    return
  }
  replace(result.progress)
  if (result.theme) colorMode.preference = result.theme
  message.value = { kind: 'ok', text: 'Прогресс загружен.' }
  input.value = ''
}
</script>

<template>
  <article class="content settings">
    <h1>Настройки</h1>

    <fieldset>
      <legend>Тема</legend>
      <label v-for="theme in THEMES" :key="theme">
        <input
          type="radio"
          name="theme"
          :value="theme"
          :checked="colorMode.preference === theme"
          @change="colorMode.preference = theme"
        />
        {{ themeLabels[theme] }}
      </label>
    </fieldset>

    <fieldset v-for="group in groups" :key="group.key" :disabled="!loaded">
      <legend>{{ group.legend }}</legend>
      <label v-for="option in group.options" :key="option.value">
        <input
          type="radio"
          :name="group.key"
          :value="option.value"
          :checked="progress.settings[group.key] === option.value"
          @change="setOption(group.key, option.value)"
        />
        {{ option.label }}
      </label>
    </fieldset>

    <fieldset :disabled="!loaded">
      <legend>Прогресс</legend>
      <p class="hint">Прогресс хранится только в этом браузере. Скачайте файл, чтобы перенести его на другое устройство.</p>
      <button type="button" class="export" @click="download">Скачать прогресс</button>
      <label class="import">
        Загрузить из файла:
        <input type="file" accept="application/json,.json" @change="upload" />
      </label>
      <p v-if="message" class="settings-message" :class="`is-${message.kind}`" role="status">
        {{ message.text }}
      </p>
    </fieldset>
  </article>
</template>

<style scoped>
fieldset {
  border: 1px solid var(--border);
  border-radius: 6px;
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
}
label {
  display: block;
  padding: 0.15rem 0;
}
.hint {
  color: var(--muted);
  margin-top: 0;
}
.export {
  font: inherit;
  cursor: pointer;
  margin-bottom: 0.5rem;
}
.is-ok {
  color: var(--cognate);
}
.is-error {
  color: var(--false-friend);
}
</style>
```

Run: `pnpm vitest run --project nuxt tests/nuxt/settings-page.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 8: Add the ⚙ link to the top bar**

In `app/components/AppTopbar.vue` replace `<div class="topbar-right" />` with:
```vue
    <div class="topbar-right">
      <NuxtLink to="/settings" class="icon-button" aria-label="Настройки" title="Настройки">⚙</NuxtLink>
    </div>
```

- [ ] **Step 9: Home page progress summary (test first)**

Replace `tests/nuxt/app.test.ts` with:
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'
import { defaultProgress, markLessonRead } from '~/utils/progress'

const { lessonWords } = vi.hoisted(() => ({
  lessonWords: [
    { path: '/lessons/a', words: ['rzeka', 'brzeg'] },
    { path: '/lessons/b', words: ['dom'] },
  ],
}))
mockNuxtImport('useLessonWords', () => () => Promise.resolve({ data: { value: lessonWords } }))

beforeEach(() => {
  const { replace, loaded } = useProgress()
  replace(defaultProgress())
  loaded.value = false
})

describe('index page', () => {
  it('renders the course title and a start link', async () => {
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.text()).toContain('Польский для русскоговорящих')
    expect(wrapper.find('a[href="/lessons/01-alphabet/01-letters"]').exists()).toBe(true)
    expect(wrapper.find('.progress-summary').exists()).toBe(false)
  })

  it('summarizes learned and due words once progress is loaded', async () => {
    const { replace, loaded } = useProgress()
    const progress = markLessonRead(defaultProgress(), '/lessons/a', new Date())
    progress.cards = { rzeka: { box: 2, due: '2000-01-01' }, dom: { box: 3, due: '2999-01-01' } }
    replace(progress)
    loaded.value = true

    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.find('.progress-summary').text().replace(/\s+/g, ' ')).toBe(
      'Изучено слов: 2 · к повторению сегодня: 1',
    )
  })
})
```

Run: `pnpm vitest run --project nuxt tests/nuxt/app.test.ts`
Expected: FAIL — `.progress-summary` not found in the second test.

Replace `app/pages/index.vue` with:
```vue
<script setup lang="ts">
import { learnedWordIds } from '~/utils/deck'
import { isDue } from '~/utils/leitner'

const { progress, loaded, isLessonCompleted } = useProgress()
const { data: lessonWords } = await useLessonWords()

const learnedCount = computed(() => learnedWordIds(lessonWords.value ?? [], isLessonCompleted).size)
const dueCount = computed(() => {
  const now = new Date()
  return Object.values(progress.value.cards).filter((card) => isDue(card, now)).length
})
</script>

<template>
  <article class="content">
    <h1>Польский для русскоговорящих</h1>
    <p>
      Курс польского языка, построенный на сходстве с русским. Выберите урок в оглавлении слева
      или начните с первого.
    </p>
    <p v-if="loaded" class="progress-summary">
      Изучено слов: {{ learnedCount }} · к повторению сегодня:
      <NuxtLink to="/flashcards">{{ dueCount }}</NuxtLink>
    </p>
    <p><NuxtLink to="/lessons/01-alphabet/01-letters">Начать: 1.1 Буквы →</NuxtLink></p>
  </article>
</template>
```

Run: `pnpm vitest run --project nuxt tests/nuxt/app.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 10: Verify generation and manual checks**

Run: `pnpm generate`
Expected: exit 0, `/settings` prerendered.

Manual (`pnpm preview`):
1. `/settings` → «Никогда» for transcription → `/lessons/02-sounds/01-rz` shows `rzeka` without `[жэ́ка]`.
2. «Скрывать» for stories → `/stories/kot-i-mysz` opens with no translations.
3. «Скачать прогресс» downloads a JSON file; clear site data in devtools; upload the file → «Прогресс загружен.» and sidebar ✓ marks return.
Stop the server.

- [ ] **Step 11: Full test run, lint, typecheck, commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add settings page, progress export/import and home summary

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```
