# Polish for Russian Speakers — Design Spec

Date: 2026-09-14
Status: approved design, pending spec review

## 1. Goal

A static website teaching Polish (levels A1–A2) to Russian speakers. It looks and reads like an
online book in the style of *The Rust Programming Language* (mdBook): chapters in a sidebar,
a single readable column, prev/next navigation, themes, search. Its core teaching idea is to
exploit Russian–Polish similarity: regular sound correspondences, cognates, false friends and
side-by-side grammar comparisons.

UI language: Russian. Taught language: Polish.

### In scope (v1)
- Lessons organized into chapters, with embedded exercises
- Vocabulary list with filters and flashcards (spaced repetition)
- Bilingual stories (Polish / Russian, sentence-aligned)
- Russian↔Polish cheat sheet page
- Pronunciation via browser speech synthesis + Cyrillic transcription
- Progress stored in the browser, with export/import

### Out of scope (v1)
- User accounts, backend, cross-device sync
- Recorded or pre-generated audio
- Hosting and CI (decided later; site must build to static files)
- Levels above A2

## 2. Stack

- **Nuxt 4**, static generation (`nuxt generate`), TypeScript, Vue 3
- **@nuxt/content v3** — typed collections with zod schemas
- **@nuxtjs/color-mode** — themes
- **@nuxt/fonts** — self-hosted Open Sans + Source Code Pro (Latin Extended + Cyrillic)
- **VueUse** (`useLocalStorage`, etc.), **zod**, **MiniSearch**
- Custom CSS, no UI library
- Tooling: pnpm, Vitest, `@nuxt/test-utils`, `@vue/test-utils`, Playwright, `@axe-core/playwright`, ESLint, Prettier

## 3. Content model

Defined in `content.config.ts`.

| Collection | Source | Fields |
|---|---|---|
| `lessons` | `content/lessons/**/*.md` | `title`, `chapter: number`, `order: number`, `level: 'A1'\|'A2'`, `words: string[]` (word ids introduced), `description?` |
| `stories` | `content/stories/*.yml` | `title`, `titleRu`, `level`, `sentences: { pl, ru, words?: Record<form, wordId> }[]` |
| `words` | `content/words/*.yml` | `id`, `pl`, `ru`, `pos`, `gender?: 'm'\|'f'\|'n'`, `pron` (Cyrillic), `pattern?: patternId`, `falseFriend?: { ru, meaning }`, `topic`, `chapter` |
| `patterns` | `content/patterns.yml` | `id` (e.g. `rz-р`), `pl`, `ru` (letter groups), `rule` (short Russian explanation) |
| `cheatsheet` | `content/cheatsheet.md` | single page |

Rules:
- A word is defined once in `words` and referenced by id everywhere else.
- Inflected forms in stories are mapped explicitly (`words: { rzekę: rzeka }`); no automatic lemmatization.
- Lessons use MDC component syntax, e.g. `:false-friend{id="uroda"}`, `::cognate-list{pattern="rz-р"}`, `::quiz` blocks with YAML bodies.

## 4. Pages and routing

| Route | Content |
|---|---|
| `/` | Intro, course overview, progress summary («Изучено слов: N · к повторению сегодня: M») |
| `/lessons/[...slug]` | Lesson page |
| `/stories`, `/stories/[slug]` | Story list, story |
| `/vocabulary` | Word list; filters by chapter, topic, false friends; `#wordId` anchors highlight a word |
| `/flashcards` | Flashcard sessions |
| `/cheatsheet` | Correspondences, false friends table, grammar differences |
| `/settings` | Theme, transcription, story mode, card direction, progress export/import |

Lesson order (sidebar numbering, prev/next) is derived from `chapter` + `order`.

## 5. Teaching components

Located in `app/components/content/` (auto-available in Markdown). All word data flows through `useWord(id)`.

- **`PlWord id`** — inline Polish word in accent color; hover/tap/keyboard opens a popover with translation, transcription, part of speech, speak button. Dotted green underline = cognate (has `pattern`), red = false friend. Unknown id: build fails (validator); in dev renders a red `?id` marker.
- **`CognateList pattern`** — table Polish | Russian | transcription of all words with that pattern; highlights the corresponding letter groups in both words.
- **`FalseFriend`** — callout with red border and ⚠: «*uroda* ≠ урод. Значит: красота». Props `pl`, `ru`, `meaning`, or `id` to read from `words.falseFriend`.
- **`CompareTable`** — styling wrapper around a Markdown table; rows marked with `!` are highlighted as differences from Russian. No logic.
- **`Pron`** — shows Cyrillic transcription (from dictionary or `ru` prop) plus speak button; visibility governed by the `showPron` setting (`auto` = on for chapters 1–3, `always`, `never`).
- **`SpeakButton text`** + **`useSpeech()`** — Web Speech API, `lang='pl-PL'`, rate 0.9. Hidden if no Polish voice is available.
- **`BilingualStory id`** — sentence pairs. Wide screens: two columns, hovering a sentence highlights its pair. Narrow screens: Polish only, tap reveals Russian. Toolbar: translation mode (show / hide / on tap), read aloud. Mapped words render as `PlWord`.

## 6. Exercises

`::quiz` block, YAML body, list of questions. Types:

| Type | Behavior |
|---|---|
| `choice` | Pick one option |
| `input` | Free text; trimmed, case-insensitive. Match ignoring Polish diacritics = "almost right" with hint «проверьте диакритику» |
| `match` | Pair 4–6 Polish words with Russian ones by click-click |
| `pattern` | Guess a Polish word from a Russian one using a named correspondence; checked like `input` |

- Immediate feedback per question with optional `explain`.
- Final score («4 из 5») and «Пройти ещё раз».
- Lesson counts as completed when its final quiz score ≥ 80%, or when the user presses «Урок прочитан».
- Checking logic lives in `utils/quiz.ts` (pure functions).

## 7. Flashcards

- Session setup: word set (chapter, topic, all learned words, false friends only) and direction (PL→RU, RU→PL, mixed).
- Front: word + speak button. Back: translation, transcription, pattern, false-friend warning.
- Answers: «Не помню» / «Помню»; keys Space (flip), 1 / 2 (answer).
- Leitner system, 5 boxes with intervals 0, 1, 3, 7, 14 days. Correct → box + 1 (max 5); wrong → box 1.
- Session = due cards + up to 10 new cards; ends with a summary.
- Logic in `utils/leitner.ts`, pure functions taking `now` as a parameter.
- "Learned words" = words listed in `words` of completed lessons.

## 8. Progress storage

Single `localStorage` key `polski:v1`:

```ts
{
  lessons:  { [slug: string]: { completed: boolean; bestScore: number; at: string } },
  cards:    { [wordId: string]: { box: 1|2|3|4|5; due: string } },
  settings: { theme: 'light'|'sepia'|'dark'|'system'; showPron: 'auto'|'always'|'never';
              translationMode: 'show'|'hide'|'tap'; direction: 'pl-ru'|'ru-pl'|'mixed' }
}
```

- Validated with a zod schema (`utils/progress-schema.ts`) on load and on import. Invalid or unknown-version data → defaults + console warning; the app never crashes on bad storage.
- `useProgress()` composable over VueUse `useLocalStorage`, initialized in a client-only plugin.
- Progress-dependent UI (sidebar ✓, counters) wrapped in `<ClientOnly>` to avoid hydration mismatch.
- Export downloads JSON; import uploads JSON and validates it.

## 9. Layout, themes, navigation

- mdBook layout: top bar (☰ sidebar toggle, 🖌 theme, 🔍 search, title, ⚙ settings; hides on scroll down), left sidebar (~300px, collapsible, state remembered), content column max 750px.
- Sidebar: Введение; numbered chapters and sub-lessons with ✓; separator; Истории, Словарь, Карточки, Шпаргалка. Current page highlighted and scrolled into view.
- Prev/next: large chevrons at viewport edges on wide screens, below content on narrow; ← → keys.
- Breakpoint 1080px: sidebar becomes an overlay that closes on selection.
- Themes via CSS variables, default follows system:

| Theme | Background | Text | Polish accent | Sidebar |
|---|---|---|---|---|
| Светлая | `#fff` | `#333` | `#1f5fa8` | `#fafafa` |
| Сепия | `#e1e1db` | `#262625` | `#a33` | `#3b2e2a` |
| Тёмная | `#141617` | `#98a3ad` | `#6bb0f0` | `#292c2f` |

- Typography: Open Sans body, Source Code Pro for paradigm tables, 16px / 1.6.
- All theme color pairs must meet WCAG AA; exact values may be adjusted to pass.

## 10. Search

- Opened by 🔍, `S` or `/`.
- Index generated at build time (`scripts/build-search-index.ts`) into `public/search-index.json`, lazy-loaded on first open. Sources: lesson sections, words (pl + ru), story titles and sentences.
- Normalization (`utils/normalize.ts`): lowercase, strip Polish diacritics (ą→a, ł→l, ż/ź→z, …), ё→е. Applied to both index and query.
- Results grouped Уроки / Словарь / Истории; ↑↓ Enter; match highlighted. Word results link to `/vocabulary#id`.

## 11. Accessibility and SEO

- Visible focus styles, `aria-label` on icon buttons, keyboard-openable popovers, `prefers-reduced-motion` respected.
- `lang="pl"` on Polish text spans; document `lang="ru"`.
- Per-page `<title>` and `description` from content; `sitemap.xml` generated.

## 12. Content validation

`scripts/validate-content.ts`, run by `pnpm validate` and before `pnpm generate`. Fails the build on:
- schema violations in any collection;
- duplicate word ids;
- word ids referenced from lessons (`words` field, `PlWord`, `FalseFriend id`) or stories that do not exist;
- unknown pattern ids;
- a word's `pattern` letter groups not present in its `pl` / `ru` forms;
- stories with empty `pl` or `ru` sentences;
- duplicate (`chapter`, `order`) pairs among lessons.

## 13. Testing

| Level | Tool | Coverage |
|---|---|---|
| Unit | Vitest | quiz checking incl. diacritics tolerance; Leitner transitions and due dates with fixed `now`; normalization; pattern highlighting; progress schema fallback |
| Component | `@nuxt/test-utils`, `@vue/test-utils` | PlWord, Quiz (all types, score), BilingualStory (3 modes), Flashcards (flip, keys), SpeakButton (hidden without voice, mocked `speechSynthesis`) |
| E2E | Playwright against generated site | sidebar + prev/next + arrow keys; quiz pass → sidebar ✓; flashcard session; theme persists across reload; search `zab` finds `ząb`; 390px viewport: overlay menu, tap-to-translate |
| A11y | `@axe-core/playwright` | key pages in all 3 themes |

Scripts: `dev`, `test`, `test:e2e`, `lint`, `typecheck`, `validate`, `generate`.

## 14. Course outline

Full A1–A2 outline:
1. Алфавит и произношение
2. Звуковые соответствия
3. Первые фразы
4. Существительные и род
5. Глаголы: настоящее время
6. Падежи I (винительный, родительный)
7. Падежи II (творительный, местный, дательный, звательный)
8. Прошедшее время
9. Будущее время и вид
10. Прилагательные и сравнение
11. Ложные друзья
12. Повседневные темы

v1 content deliverable:
- Chapters 1–3 complete (≈8–10 lessons with quizzes)
- ≈150 words, including 30+ false friends
- 2 A1 stories: *W sklepie*, *Kot i mysz*
- Complete cheat sheet
- Content is drafted by Claude and reviewed by the project owner; Polish text needing review is marked with `<!-- review -->`.

## 15. Project structure

```
app/
  pages/               index, lessons/[...slug], stories/, vocabulary, flashcards, cheatsheet, settings
  layouts/default.vue  sidebar + top bar + page nav
  components/          AppSidebar, AppTopbar, SearchPanel, PageNav, ThemePicker, …
  components/content/  PlWord, CognateList, FalseFriend, CompareTable, Pron, SpeakButton, Quiz, BilingualStory
  composables/         useWord, useSpeech, useProgress, useSearch, useLessonNav
  utils/               quiz.ts, leitner.ts, normalize.ts, pattern.ts, progress-schema.ts
  assets/css/          themes.css, typography.css
content/               lessons/, stories/, words/, patterns.yml, cheatsheet.md
content.config.ts
scripts/               validate-content.ts, build-search-index.ts
tests/                 unit/, components/, e2e/
nuxt.config.ts
CLAUDE.md
```

## 16. Known limitations (accepted)

- Speech quality depends on the device's Polish voice.
- Progress is per browser; export/import is the workaround.
- Inflected forms in stories are mapped manually.
