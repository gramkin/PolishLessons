# Polish for Russian Speakers — Implementation Plan (Overview)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, mdBook-style website teaching Polish (A1–A2) to Russian speakers, with lessons, vocabulary + flashcards, bilingual stories and a cheat sheet.

**Architecture:** Nuxt 4 static site (`nuxt generate`). Content lives in `content/` as Markdown (lessons, cheat sheet) and YAML (words, patterns, chapters, stories), loaded through typed @nuxt/content v3 collections whose zod schemas are shared with a standalone validator script. Pure logic (normalization, pattern highlighting, quiz checking, Leitner scheduling, progress schema, navigation) lives in framework-free modules with unit tests; Vue components consume it through a few composables; progress is kept in `localStorage`.

**Tech Stack:** Nuxt 4.5, @nuxt/content 3.16, @nuxtjs/color-mode 4, @nuxt/fonts 0.14, @nuxtjs/sitemap 8, zod 3.25, MiniSearch 7, TypeScript 5.9, Vitest 5 + @nuxt/test-utils 4 + @vue/test-utils + happy-dom, Playwright 1.63 + @axe-core/playwright, ESLint (@nuxt/eslint) + Prettier, pnpm 10, Node ≥ 22.19.

**Spec:** `docs/superpowers/specs/2026-09-14-polish-for-russians-design.md`

## Plan files (execute in order)

| # | File | Delivers |
|---|---|---|
| 1 | `2026-09-14-polish-site-01-foundation.md` | Project scaffold, tooling, shared schemas, content collections, content validator, pure utils (normalize, pattern, nav), mdBook layout with sidebar / prev-next / themes / fonts, lesson page |
| 2 | `2026-09-14-polish-site-02-teaching-components.md` | useWords/usePatterns, speech, PlWord, Pron, SpeakButton, CognateList, FalseFriend, CompareTable, BilingualStory, story pages |
| 3 | `2026-09-14-polish-site-03-exercises-progress.md` | Progress schema + storage, Quiz (4 types), lesson completion + sidebar ✓, Leitner + flashcards, vocabulary page, settings page (export/import), home progress summary |
| 4 | `2026-09-14-polish-site-04-search-seo-e2e.md` | Search index + panel, SEO meta + sitemap, Playwright E2E + axe accessibility tests |
| 5 | `2026-09-14-polish-site-05-content.md` | Chapters 1–3, ~150 words, patterns, 2 stories, cheat sheet, CLAUDE.md |

Each plan file ends in a working, tested site. Sample content created in plans 1–4 is replaced/extended in plan 5.

## Global Constraints

- Node `^22.19.0 || ^24.11.0 || >=26`; package manager **pnpm** only.
- Pinned majors: `nuxt@^4.5.2`, `@nuxt/content@^3.16.0`, `@nuxtjs/color-mode@^4.0.1`, `@nuxt/fonts@^0.14.0`, `@nuxtjs/sitemap@^8.5.1`, `zod@^3.25.76` (same major as @nuxt/content's own dependency; import from `'zod'`), `minisearch@^7.2.0`, `typescript@5.9.3` (not 6/7 — vue-tsc compatibility), `vitest@^5.0.0`, `@nuxt/test-utils@^4.3.2`.
- Output is fully static: `pnpm generate` → `.output/public`. No server routes, no runtime API.
- UI language Russian (`<html lang="ru">`); every Polish text element carries `lang="pl"`.
- Levels: `A1`, `A2` only.
- Pure logic modules in `app/utils/` and `shared/` import only relative paths or npm packages (no `~`/`#` aliases, no Nuxt auto-imports) so they run under plain Vitest `node` environment and in `tsx` scripts.
- Word ids: `^[a-z0-9-]+$` (ASCII transliteration, e.g. `zab` for *ząb*, `zamek-castle` for homographs).
- localStorage keys: progress `polski:v1`; theme `polski:theme` (owned by @nuxtjs/color-mode).
- Pass threshold for a lesson quiz: score ≥ 80%.
- Leitner intervals (days) for boxes 1–5: `0, 1, 3, 7, 14`; new cards per session: 10.
- Speech: `lang='pl-PL'`, `rate=0.9`; hide speak UI when no Polish voice.
- Mobile breakpoint: `1080px`. Content column max width `750px`. Sidebar width `300px`. Base font 16px / line-height 1.6.
- Themes: `light`, `sepia`, `dark`, default preference `system`; colors from spec §9, adjustable only to pass WCAG AA.
- Commit after every task, messages in Conventional Commits style, ending with the line `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

## Deviations from spec (decided during planning)

1. **Theme is not stored in `polski:v1`.** @nuxtjs/color-mode persists it under `polski:theme` and applies it before hydration (no flash of wrong theme). Export/import includes it as a separate `theme` field.
2. **VueUse is not used.** Progress persistence is a small client plugin with explicit load/validate/save, which is easier to test.
3. **`content/chapters.yml` added** — chapter numbers and titles for the sidebar; the validator checks every lesson's `chapter` exists there.
4. **`public/search-index.json` stores search documents**, and MiniSearch builds the index in the browser on first open (index build for a few hundred documents is instant; avoids MiniSearch version-coupled serialization).
5. **Progress blob has `version: 1`** field, so imported files can be version-checked.

## Complete file map

```
package.json, pnpm-workspace.yaml, nuxt.config.ts, content.config.ts, tsconfig.json
vitest.config.ts, playwright.config.ts, eslint.config.mjs, .prettierrc, .gitignore
shared/schemas.ts                     zod schemas + inferred types for all content and quiz questions
app/app.vue                           <NuxtLayout><NuxtPage/></NuxtLayout>
app/assets/css/themes.css             CSS variables per theme
app/assets/css/base.css               typography, layout primitives, content styles
app/layouts/default.vue               top bar + sidebar + content column + page nav
app/components/AppTopbar.vue          ☰ 🖌 🔍 title ⚙
app/components/AppSidebar.vue         chapter tree + section links + ✓
app/components/ThemePicker.vue        theme menu
app/components/PageNav.vue            prev/next chevrons (+ ← → keys)
app/components/SearchPanel.vue        search overlay
app/components/FlashcardSession.vue   one flashcard session
app/components/content/PlWord.vue, Pron.vue, SpeakButton.vue, CognateList.vue, FalseFriend.vue,
                       CompareTable.vue, BilingualStory.vue, Quiz.vue, LessonDone.vue
app/composables/useWords.ts, usePatterns.ts, useLessonNav.ts, useSpeech.ts, useProgress.ts, useSearch.ts
app/plugins/progress.client.ts        load/validate/save progress
app/utils/normalize.ts, pattern.ts, nav.ts, speech.ts, quiz.ts, leitner.ts, progress.ts, story.ts, search.ts
app/pages/index.vue, lessons/[...slug].vue, stories/index.vue, stories/[slug].vue,
          vocabulary.vue, flashcards.vue, cheatsheet.vue, settings.vue
content/chapters.yml, patterns.yml, words/*.yml, lessons/**/*.md, stories/*.yml, cheatsheet.md
scripts/lib/load-content.ts           read content/ from disk into plain objects
scripts/lib/validate.ts               pure validateContent()
scripts/validate-content.ts           CLI
scripts/lib/search-docs.ts            pure buildSearchDocs()
scripts/build-search-index.ts         CLI → public/search-index.json
tests/unit/**, tests/nuxt/**, tests/e2e/**
CLAUDE.md
```
