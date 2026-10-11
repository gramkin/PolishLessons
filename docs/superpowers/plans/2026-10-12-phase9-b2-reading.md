# Phase 9 — B2 Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** nine authored B2 texts, one register each, readable after chapters 30–36, joining
`rozmowa-kwalifikacyjna` (chapter 27).

**Architecture:** content only — `content/stories/<slug>.yml` (storySchema) and one words file
per text, `content/words/stories-b2-NN.yml`. Each text lists itself under its chapter's last
lesson (the chapter's `04-review`) and on `/stories`.

**Tech Stack:** Nuxt Content, `pnpm validate` / `pnpm lexicon`.

**Spec:** `docs/superpowers/specs/2026-10-11-path-to-b2-design.md` (section «Phase 9»).

## Global Constraints

- `# review` on line 1 of every new file; a reviewer agent reads every text.
- `level: B2`; 40–60 sentences `{ pl, ru, words }`; 6 Russian `choice` questions whose
  `explain` quotes the text, one `listen` dictation of a sentence from the text; no `skill`.
- `words` map exact case-sensitive forms to ids whose `chapter` ≤ the text's chapter and whose
  meaning matches the form (no homographs, no wrong sense).
- Natural modern Polish in the named register; every sentence translated faithfully; no real
  people, outlets, brands, laws, statistics or events.
- Commits through `git commit -F <file>`, ending with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Gate: `pnpm -s validate`, `pnpm -s lexicon`, `pnpm -s prettier --check <files>`.

| NN | Ch. | Slug | Register | Text |
|---|---|---|---|---|
| 01 | 30 | `budzet-gminy` | press | a local news piece on a town budget: amounts, percentages, dates, fractions of residents (numerals in all cases), passive and -no/-to |
| 02 | 31 | `wywiad-z-lekarka` | spoken, formal | a radio interview with a sleep doctor about habits: iteratives (sypiać, bywać), aspect in advice and prohibitions, «nie da się» |
| 03 | 32 | `reklamacja-lotu` | official | a complaint about a cancelled flight and the airline's reply: bookish prepositions (w związku z, ze względu na, w wyniku), verb government |
| 04 | 33 | `felieton-o-pracy-zdalnej` | argument | an opinion column on remote work: thesis, arguments, counter-argument, conclusion, the chapter's connectors |
| 05 | 34 | `audycja-o-gwarze` | spoken | a radio talk about regional speech: particles (przecież, chyba, właśnie, aż / dopiero), fronting, clitics |
| 06 | 35 | `czat-znajomych` | colloquial | a group chat planning a weekend trip: spoko, serio, sorki, abbreviations, softening, one character who writes very formally (the joke) — no vulgarity |
| 07 | 36 | `wesele-u-cioci` | narrative | a family wedding told by a niece, full of idioms, proverbs and collocations |
| 08 | 33 | `recenzja-filmu` | review | a film review: evaluation vocabulary, concession (mimo że, choć), cause (ponieważ, skoro) |
| 09 | 36 | `debata-szkolna` | debate | a school debate on banning phones: formal argument from both sides, a moderator, reported speech, idioms in the closing remarks |

---

### Task 1: Write the nine texts

**Files:** Create `content/stories/<slug>.yml` and `content/words/stories-b2-NN.yml` per row.

- [ ] **Step 1: Dispatch nine writer agents in parallel** with this brief (fill the row):

```text
Project /Users/gramkin/Projects/PolishLessons. Read CLAUDE.md, shared/schemas.ts (storySchema,
quizSchema), docs/superpowers/plans/2026-10-12-phase9-b2-reading.md («Global Constraints»),
the exemplar content/stories/rozmowa-kwalifikacyjna.yml and content/words/stories-e.yml, and
the lessons of chapter <C> (content/lessons/<folder>/) so the text uses their language.

Write content/stories/<slug>.yml (level B2, chapter <C>, title, titleRu, description in one
Russian sentence) — <text>. Register: <register>.
`words`: map the important forms to ids in content/words with chapter ≤ <C> (grep the id's
file; check the meaning matches). New words go in content/words/stories-b2-<NN>.yml
(`# review` on line 1, `words:` list, chapter <C>, unique ids — grep `id: <id>[,} ]` in
content/words first — quote every ru value). Eight other agents write the other texts at the
same time, each in its own files.
Check: pnpm -s validate, pnpm -s lexicon, pnpm -s prettier --write <your files>. Ignore
errors in files that are not yours. Do not commit. Report: sentence count, new word ids,
Polish you are unsure of.
```

- [ ] **Step 2: Resolve collisions** (duplicate ids across `stories-b2-*.yml`; keep the one with
  the lower chapter) until `pnpm -s validate` passes.

### Task 2: Review

- [ ] **Step 1: Dispatch three reviewer agents** (texts 01–03, 04–06, 07–09) with the Phase 7
  reviewer brief plus: register must be consistent and natural for the genre; a choice question
  has exactly one right option; `words` mappings must match meaning.
- [ ] **Step 2: Gate**, then **commit** `feat(stories): nine B2 texts for chapters 30–36`.

### Task 3: Full check and docs

- [ ] **Step 1:** `CLAUDE.md` (one sentence in the B2 bullet: the B2 texts), the roadmap (a
  Phase 9 line).
- [ ] **Step 2:** `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm generate`; confirm each slug
  appears in its chapter's `04-review/index.html` and `/stories` has a B2 group of ten; e2e
  against `pnpm preview`.
- [ ] **Step 3: Commit** `docs: Phase 9 done — B2 reading`.
