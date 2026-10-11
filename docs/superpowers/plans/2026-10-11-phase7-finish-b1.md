# Phase 7 — Finish B1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** close the gaps the grammar-only B1 track left: B1 topic vocabulary (chapter 28),
eight B1 stories, a B1 test (chapter 29) and placement questions for chapters 22–28.

**Architecture:** content only — Markdown lessons, word YAML, story YAML, placement YAML.
No code changes: `LEVELS` already has B1/B2, the placement page takes the last chapter from
the nav, stories list themselves under a chapter's last lesson.

**Tech Stack:** Nuxt Content collections, zod schemas in `shared/schemas.ts`, the
`pnpm validate` / `pnpm lexicon` gates.

**Spec:** `docs/superpowers/specs/2026-10-11-path-to-b2-design.md` (section «Phase 7»).

## Global Constraints

- Every new file carries `<!-- review -->` (Markdown) or `# review` (YAML) on line 1/after
  frontmatter; no native reviewer exists, so a reviewer agent reads every chapter.
- Lessons: frontmatter `title description chapter order level words`; `level: B1`; ≥ 10
  `:pron` examples, ≥ 8 questions (aim 15–25), a `## Типичные ошибки` section; no `ru=` on
  `:pron` (chapters ≥ 4); every standalone Polish example wrapped in `:pron{pl="…"}`.
- `pron` transcriptions follow CLAUDE.md «Content conventions» (ł → у, nasals by next
  sound, stress = Cyrillic vowel + U+0301).
- Word ids are ASCII and unique across `content/words/*.yml` — `grep -rn "id: <id>[,}]"
  content/words` before adding one.
- Stories: `words` map exact case-sensitive forms to word ids whose `chapter` ≤ the story's
  `chapter`; all YAML `ru` values containing commas are quoted.
- Never edit chapters 1–27 lessons except where a task names the file.
- Commit messages go through a file (`git commit -F`) and end with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Gate for every task: `pnpm -s validate` (only the known «Что дальше» warning may remain),
  `pnpm -s lexicon`, `pnpm -s prettier --check <files>`.

---

### Task 1: Chapter 28 «Темы B1» — six topic lessons

**Files:**
- Modify: `content/chapters.yml` (append `- number: 28` / `title: Темы B1`)
- Create: `content/lessons/20-b1-topics/01-career.md` … `06-society.md` (orders 1–6)
- Create: `content/words/ch28-career.yml`, `ch28-health.yml`, `ch28-media.yml`,
  `ch28-housing.yml`, `ch28-nature.yml`, `ch28-society.yml` (each `{ words: [...] }`,
  every entry `chapter: 28`)

**Interfaces:**
- Produces: word ids at chapter 28 that Task 4 (stories) and Task 5 (test) may use.

- [ ] **Step 1: Add the chapter** to `content/chapters.yml` after 27:

```yaml
  - number: 28
    title: Темы B1
```

- [ ] **Step 2: Dispatch six writer agents in parallel**, one per lesson, with this brief
  (fill `<N>`, `<slug>`, `<topic>`, `<A2 lesson>`):

```text
Project /Users/gramkin/Projects/PolishLessons. Read CLAUDE.md, the plan
docs/superpowers/plans/2026-10-11-phase7-finish-b1.md («Global Constraints»), and as
format exemplars read fully content/lessons/12-daily/12-work.md (an A2 topic lesson)
and content/lessons/19-formal/03-urzad.md (a B1 lesson).

Write content/lessons/20-b1-topics/0<N>-<slug>.md (chapter 28, order <N>, level B1)
on «<topic>», and its words file content/words/ch28-<slug>.yml.

- This is B1, not A2: first read <A2 lesson> and do NOT re-teach its words; build on
  them (abstract nouns, verbs with government, collocations, register).
- 45–60 words in the file, each { id, pl, ru, pos, gender (nouns), pron, topic, chapter: 28 },
  preferring words that have a dictionary card (ls content/dictionary/<id>.yml); list
  them in the lesson's `words` frontmatter.
- 4–5 sections, each with :pron examples and a section ::quiz (match, translate,
  choice, input), two dialogues (each line :pron), «Типичные ошибки» (2–4 real mistakes
  Russian speakers make with this vocabulary: false friends, government, aspect), and a
  final quiz (`final: true`). Examples up to ~15 words, using B1 grammar from chapters
  22–27 where natural (participles, passive, reported speech, formal Pan/Pani).
- Every claim true of standard modern Polish; no invented facts (laws, prices, dates).
- Check: pnpm -s validate, pnpm -s lexicon, pnpm -s prettier --write <your two files>.
  Touch only your two files. Do not commit.
- Report: sections, :pron count, question count, word ids, Polish you are unsure of.
```

| N | slug | topic | A2 lesson to read first |
|---|---|---|---|
| 1 | career | работа и карьера | `12-daily/12-work.md` |
| 2 | health | здоровье и медицина | `12-daily/10-health.md` |
| 3 | media | СМИ и новости | `12-daily/14-leisure.md` |
| 4 | housing | жильё и аренда | `12-daily/05-home.md` |
| 5 | nature | природа и экология | `12-daily/01-weather.md` |
| 6 | society | общество и государство | `19-formal/03-urzad.md` |

- [ ] **Step 3: Resolve collisions.** Run `pnpm -s validate`; if two agents added the same
  word id, keep it in the file of the lesson that teaches it more and point the other
  lesson's `words` at that id.

- [ ] **Step 4: Gate** — validate, lexicon, prettier check on the 12 files. Expected: valid,
  every Polish word known.

- [ ] **Step 5: Commit**

```bash
git add content/chapters.yml content/lessons/20-b1-topics content/words/ch28-*.yml
git commit -F <msg>   # "feat(lessons): chapter 28 «Темы B1», six topic lessons"
```

### Task 2: Review chapter 28 and add its review lesson

**Files:**
- Modify: `content/lessons/20-b1-topics/0[1-6]-*.md`, `content/words/ch28-*.yml`
- Create: `content/lessons/20-b1-topics/07-review.md` (order 99)

- [ ] **Step 1: Dispatch three reviewer agents in parallel** (lessons 1–2, 3–4, 5–6) with the
  brief below:

```text
Project /Users/gramkin/Projects/PolishLessons. Read CLAUDE.md. No native speaker will
check these lessons; you are the second pair of eyes. Read every line of
content/lessons/20-b1-topics/<files> and their content/words/ch28-*.yml as a strict
Polish teacher:
1. Polish: case government, agreement (masculine-personal), aspect, clitic position,
   z/ze w/we, naturalness, register.
2. Russian: faithful translations; correct explanations; no Latin letters in Russian;
   no aside self-corrections.
3. Claims: true of standard modern Polish; soften or remove what you cannot confirm.
4. Quizzes: answer index right; distractors really wrong; translate answers list every
   natural variant and no unnatural one; explain matches the answer.
5. pron: ł → у, nasals by next sound, stress = Cyrillic vowel + U+0301.
Fix every clear error in place (keep the review marks). Run pnpm -s validate,
pnpm -s lexicon, pnpm -s prettier --write <files>. Do not commit.
Report each fix (file, before → after, why) and the doubtful points you left.
```

- [ ] **Step 2: Write `07-review.md`** (chapter 28, order 99, level B1): 25–30 questions of
  every type, ~60 % chapter 28 vocabulary, ~40 % chapters 22–27 grammar used with that
  vocabulary; ≥ 10 `:pron`; «Типичные ошибки» recapping the chapter's; a final quiz.
  Exemplar: `content/lessons/19-formal/04-review.md`.

- [ ] **Step 3: Gate**, then **commit**:
  `fix(lessons): review chapter 28; add its review lesson`.

### Task 3: Placement questions for chapters 22–28

**Files:**
- Modify: `content/placement.yml`

- [ ] **Step 1: Update the header comment** `по два вопроса на главу 1–20` →
  `по два вопроса на главу 1–20 и 22–28 (21 — тесты)`.

- [ ] **Step 2: Append 14 questions** (two per chapter 22–28) in the file's existing
  one-line flow style, each `{ chapter, type, q, options|answer, answer, explain }`,
  `choice` or `input`, testing that chapter's core point. Example rows:

```yaml
  - { chapter: 22, type: choice, q: "«Читающий человек»:", options: ["czytany człowiek", "czytający człowiek", "czytając człowiek"], answer: 1, explain: "Действительное причастие на -ący: czytają → czytający." }
  - { chapter: 23, type: input, q: "___ gazetę, pił kawę. (czytać, «читая»)", answer: "Czytając", explain: "Деепричастие на -ąc: czytają → czytając." }
```

- [ ] **Step 3: Gate.** `pnpm -s validate` (placement chapters must exist; 28 now does) and
  `pnpm vitest run --project unit tests/unit/placement.test.ts tests/unit/validate.test.ts`.
  Expected: PASS.

- [ ] **Step 4: Commit** `feat(placement): questions for chapters 22–28`.

### Task 4: Eight B1 stories

**Files:**
- Create: `content/stories/<slug>.yml` × 8, `content/words/stories-b1-<NN>.yml` (one per
  story, only if the story needs new words; `chapter` equal to the story's)

**Interfaces:**
- Consumes: word ids at chapters ≤ the story's chapter, including Task 1's chapter 28 ids.

- [ ] **Step 1: Dispatch eight writer agents in parallel** with this brief (fill the row):

```text
Project /Users/gramkin/Projects/PolishLessons. Read CLAUDE.md, shared/schemas.ts
(storySchema, quizSchema), and as exemplars content/stories/rozmowa-kwalifikacyjna.yml
and content/words/stories-e.yml. Also read the lessons of chapter <C>
(content/lessons/<folder>/) so the story uses their grammar.

Write content/stories/<slug>.yml: `# review` on line 1, level B1, chapter <C>,
title (Polish), titleRu, description (Russian, one sentence), 25–40 sentences
{ pl, ru, words }, then 5–6 Russian comprehension questions (choice, with explain
quoting the text) and one `listen` dictation of a sentence from the text.
Plot: <plot>. Natural modern Polish; every sentence translated faithfully.
`words`: map the important forms (nouns, verbs, adjectives) to ids in content/words;
an id's chapter must be ≤ <C> (grep its file). New words go in
content/words/stories-b1-<NN>.yml (`# review`, chapter <C>, unique ids, quoted ru).
Check: pnpm -s validate, pnpm -s lexicon, pnpm -s prettier --write <your files>.
Touch only your files. Do not commit. Report: sentence count, new word ids, Polish
you are unsure of.
```

| NN | C | slug | Plot (grammar focus) |
|---|---|---|---|
| 01 | 22 | `wiadomosci-z-miasta` | a local news report on a flooded street: residents waiting, a closed bridge (participles -ący, -ny/-ty) |
| 02 | 23 | `wycieczka-w-gory` | a mountain hike told by one hiker: walking, eating, getting lost, having reached the hut… (-ąc, -wszy) |
| 03 | 24 | `kradziez-roweru` | a police report and the newspaper note about a stolen bike that was found (być/zostać passive, -no/-to) |
| 04 | 25 | `plotki-w-biurze` | office gossip retold over coffee: who said what, who asked whom (że, czy, żeby, podobno) |
| 05 | 26 | `nowe-mieszkanie` | moving into a flat: packing, unpacking, repairs, neighbours (verbal nouns, prefixes, suffixes) |
| 06 | 27 | `reklamacja` | an exchange of letters: a complaint about a broken washing machine and the shop's replies (formal style) |
| 07 | 28 | `u-lekarza-specjalisty` | a visit to a specialist and a referral for tests (chapter 28 health vocabulary) |
| 08 | 28 | `sasiedzi-i-smog` | neighbours argue at a residents' meeting about smog and a new park (nature and society vocabulary) |

- [ ] **Step 2: Gate** — validate (catches word chapters and story shape), lexicon.

- [ ] **Step 3: Review.** Dispatch two reviewer agents (stories 01–04, 05–08) with Task 2's
  reviewer brief, files replaced by the stories and their word files.

- [ ] **Step 4: Check the listing.** `pnpm generate`, then confirm each story's chapter-last
  lesson lists it (grep the slug in `.output/public/lessons/<folder>/04-review/index.html`
  for 22–27 and `20-b1-topics/07-review` for 28) and `/stories` shows a B1 group.

- [ ] **Step 5: Commit** `feat(stories): eight B1 stories for chapters 22–28`.

### Task 5: Chapter 29 «Итоги B1» — the B1 test

**Files:**
- Modify: `content/chapters.yml` (append `- number: 29` / `title: Итоги B1`)
- Create: `content/lessons/21-b1-final/01-test-b1.md` (chapter 29, order 1, level B1,
  `words: []`)

- [ ] **Step 1: Add chapter 29** to `content/chapters.yml`.

- [ ] **Step 2: Write the test**, modelled line by line on
  `content/lessons/13-final/02-test-a2.md`: an intro naming the four parts and chapters
  22–28; one `final: true` quiz of ~40 questions, every one with `skill`
  (reading ~10: a short B1 text in a blockquote then `choice` questions; listening ~8:
  `choice` with `say:` and `listen` dictations; grammar ~14: participles, -ąc/-wszy,
  passive, -no/-to, reported speech, word formation, formal address; writing ~8:
  `translate` with every natural variant). Polish in the text is speakable (`:pron` or
  blockquote as in the A2 test).

- [ ] **Step 3: Review** with one reviewer agent (Task 2's brief, file replaced).

- [ ] **Step 4: Gate**, plus confirm the depth gate treats it as an exam (no thin-lesson
  warning for it).

- [ ] **Step 5: Commit** `feat(lessons): chapter 29 «Итоги B1», the B1 test`.

### Task 6: Docs, links and the full check

**Files:**
- Modify: `content/lessons/12-daily/04-what-next.md` («Как продолжать»: mention chapter
  28 topics and the B1 test after chapters 22–27)
- Modify: `content/lessons/13-final/02-test-a2.md` only if it promises what comes next
- Modify: `CLAUDE.md` (Project line: B1 in chapters 22–29; «B1 track» bullet: chapter 28
  topics, 29 test, B1 stories)
- Modify: `docs/superpowers/plans/2026-10-10-course-depth-roadmap.md` (a «Phase 7 ✓ done»
  line pointing to the spec)

- [ ] **Step 1: Make the edits above.**

- [ ] **Step 2: Full check**

```bash
pnpm -s validate && pnpm -s lexicon && pnpm test && pnpm typecheck && pnpm lint && pnpm generate
```

Expected: all pass; validate shows only the «Что дальше» warning.

- [ ] **Step 3: E2E** against the built site: create `playwright.reuse.tmp.config.ts`
  (`import base from './playwright.config'; export default { ...base, webServer: undefined }`),
  run `pnpm preview` in the background, `pnpm exec playwright test -c playwright.reuse.tmp.config.ts`,
  then delete the config and stop the server. Expected: all pass.

- [ ] **Step 4: Spot-check in the browser** `/lessons/20-b1-topics/01-career`,
  `/lessons/21-b1-final/01-test-b1` (per-skill result), `/placement` (chapters 22–28 in
  the result table), `/stories` (B1 group).

- [ ] **Step 5: Commit** `docs: Phase 7 done — B1 topics, stories and test`.
