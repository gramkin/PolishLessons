# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static Nuxt 4 website teaching Polish (A1–A2) to Russian speakers, styled like an mdBook (_The Rust Programming Language_). UI text is Russian. Design spec: `docs/superpowers/specs/2026-09-14-polish-for-russians-design.md`; implementation plans: `docs/superpowers/plans/`.

## Commands

- `pnpm dev` — build the search index, then start the dev server
- `pnpm generate` — validate content → build search index → static site in `.output/public`
- `pnpm preview` — serve `.output/public` at http://localhost:4173
- `pnpm validate` — content schema and cross-reference check (fails with file-prefixed errors)
- `pnpm test` — Vitest; projects `unit` (`tests/unit`, node) and `nuxt` (`tests/nuxt`, Nuxt runtime + happy-dom)
- `pnpm vitest run --project unit tests/unit/quiz.test.ts -t "almost"` — one file / one test
- `pnpm test:e2e` — Playwright against `generate` + `preview`; `pnpm test:e2e tests/e2e/a11y.spec.ts` for one spec
- `pnpm lint`, `pnpm format`, `pnpm typecheck`

## Architecture

- **`shared/schemas.ts` is the single source of truth for content shape.** It feeds both `content.config.ts` (Nuxt Content collections) and `scripts/lib/validate.ts` (strict keys + cross-references). When you change a content field, update the schema, the validator tests and any component reading the field.
- **Content** (`content/`): `lessons/**/*.md` (frontmatter `title chapter order level words`), `words/*.yml` (each file is `{ words: [...] }`), `patterns.yml`, `chapters.yml`, `stories/*.yml`, `cheatsheet.md`. Lesson order and labels (`2.3`) come from `chapter` + `order`, not file names.
- **Markdown components** live in `app/components/content/`: `:pl-word{id}`, `:pron{id}` or `:pron{pl ru}`, `:false-friend{id}`, `::cognate-list{pattern}`, `::compare-table` (YAML props `headers`, `rows`, `plColumns`; a first cell starting with `!` highlights the row), `::quiz` (YAML props `questions`, `final`). The validator checks ids in `pl-word`, `pron`, `false-friend`, `cognate-list`.
- **Word and pattern data** is awaited once in `app/layouts/default.vue` via `useWords()` / `usePatterns()` (shared `useAsyncData` keys); components read it synchronously.
- **Pure logic** is in `app/utils/*.ts` (`nav`, `normalize`, `pattern`, `quiz`, `leitner`, `deck`, `progress`, `story`, `search`, `vocabulary`, `pron`, `speech`). These use no Nuxt auto-imports, so they run in plain Node tests and in `tsx` scripts. Import runtime values from `shared/` through `#shared/...` in `app/` code (Nuxt keeps `shared/` external in the server build, so relative value imports break `pnpm generate`; `tests/unit/app-shared-imports.test.ts` guards this). Scripts and type-only imports may use relative paths. Put new rules here, not in components.
- **Progress** is one `useState('progress')` object validated by zod (`app/utils/progress.ts`). `app/plugins/progress.client.ts` loads `localStorage['polski:v1']` on `app:mounted` (after hydration, so prerendered HTML never mismatches) and saves on change. UI depending on progress must check `useProgress().loaded`. The theme is stored separately by `@nuxtjs/color-mode` under `polski:theme`.
- **Search**: `scripts/build-search-index.ts` writes `public/search-index.json` (gitignored); `useSearch()` fetches it on first open and builds a MiniSearch index using `normalizeLoose`, so diacritics and ё/е are ignored.

## Dictionary workflow

- **Card format versioning.** `CARD_FORMAT` in `shared/dictionary.ts` is the current shape; every card declares `format:`. Format 1 = senses, notes, collocations, family. Format 2 = adds three examples per affirmative form, etymology, memory hook and at least one idiom. The validator enforces the current format's requirements, warns for lower formats (they need an upgrade) and errors for higher ones. When the card shape changes, bump `CARD_FORMAT`, document the new level here, and leave existing cards at their old number.
- **Word depth.** Every card declares `depth:` — `standard` (the default, omit it) or `deep`. Depth is about semantics, not structure: `ten` has 13 forms and is easy («этот», regular), `się` has one form and is hard. Mark a word `deep` if any of these is yes — it carries several unrelated grammatical functions (`się`, `to`); it maps one-to-many onto Russian or Russian builds the idea differently (`w`, `na`, `mieć` vs «у меня есть»); it governs a case or word order Russian does not (prepositions, the `by` clitic); or it is a systematic trap (`wiedzieć`/`znać` for one Russian «знать»). The negative test protects simple frequent words: if a teacher would explain it in one sentence, it is `standard` however common it is. A deep card owes at least 3 senses, 4 notes, 12 example sentences (senses and forms together) and 3 idioms; `content/dictionary/sie.yml` is the reference. Falling short is an **error**: the backlog of under-written deep cards was cleared, so a card marked deep must now meet the bar or `pnpm validate` fails. Mark a word `deep` only when you are ready to write it to that standard.
- **`data/ranked.json` carries the status of all 2000 lemmas**: `format` is the card's format and `depth` its depth, or `null` when no card exists. Run `pnpm dict:status` after adding or upgrading a card; `pnpm dict:rank` re-applies it so re-ranking never loses it.
- **`data/words.json` is the second registry**, same shape as `ranked.json` (`rank`, `id`, `lemma`, `pos`, `format`, `depth`) plus provenance (`source`, `sourceLines`, `surfaceForms`, `examples`). `ranked.json` is _generated_ by `dict:rank` from the frequency corpus, so anything hand-curated must live here instead or the next re-rank drops it; new words get ranks from 2001 up. `dict:draft`, `pnpm validate` and `dict:status` read both files, and `dict:status` stamps each one back to its own path — never merge them on disk.
- Pipeline order for a new word: `dict:draft --ids <id>` → author `content/dictionary/<id>.yml` → `dict:build` → `pnpm validate` → `dict:status` → `pnpm generate`.

## Content conventions

- Word ids are ASCII (`ą→a ć→c ę→e ł→l ń→n ó→o ś→s ź/ż→z`); homographs get a suffix (`czesc` vs `czesc-noun`).
- `pron` transcription: `sz→ш cz→ч rz/ż→ж ś→сь ć→ць ź→зь dź/dzi→дзь ń→нь ł→у y→ы ó/u→у ą→он/ом ę→эн/эм (final э) ch→х`, devoice final consonants, mark stress with `́`.
- A word has at most one `pattern`, and the pattern's letters must occur in both `pl` and `ru` (validator enforces).
- Story `words` map exact, case-sensitive forms in the Polish sentence (multi-word forms allowed) to word ids.
- `<!-- review -->` (Markdown) or `# review` (YAML) marks Polish the owner has not checked yet — keep it on new or edited content.
- E2E tests depend on: lessons `01-alphabet/01-letters` and `01-alphabet/02-stress`, the 3-question final quiz in `02-sounds/01-rz`, story `kot-i-mysz`, word `zab`. Update `tests/e2e` in the same change if you alter them.

## Testing notes

- Component tests mock composables with `mockNuxtImport`; shared fixtures come from `tests/nuxt/fixtures.ts` via `await vi.hoisted(() => import('./fixtures'))`.
- Accessibility tests check key pages in light, sepia and dark themes with axe (`wcag2a`, `wcag2aa`); fix contrast failures by adjusting variables in `app/assets/css/themes.css`.
