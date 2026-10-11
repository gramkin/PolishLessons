# Phase 8 — B2 Grammar and Usage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** the B2 grammar and usage track — a second public-domain book (Prus) and chapters
30–36, each three teaching lessons and a review.

**Architecture:** content only. The book follows `bookSchema` (Frank-method chunks; `/books`
and the chapter navigation already handle several books, grouped by title). Lessons follow
the B1 track's shape. A numeral drill is added only if the forms data supports it.

**Tech Stack:** Nuxt Content, zod schemas (`shared/schemas.ts`), `pnpm validate` /
`pnpm lexicon` gates.

**Spec:** `docs/superpowers/specs/2026-10-11-path-to-b2-design.md` (section «Phase 8»).

## Global Constraints

- Everything new carries `<!-- review -->` / `# review`; a reviewer agent reads every file.
- Lessons: frontmatter `title description chapter order level words`, `level: B2`; teaching
  lessons orders 1–3, review `04-review.md` order 99; ≥ 10 `:pron` (no `ru=`), ≥ 8
  questions (aim 15–25), `## Типичные ошибки`; every standalone Polish example in
  `:pron{pl="…"}`; prose 600–900 words of Russian.
- Each teaching lesson quotes one or two real sentences showing its point, verbatim, as a
  `> ` blockquote with a Russian translation and a link — from Prus
  (`/books/prus-0N-…`, Task 1) or *Alicja* (`/books/alicja-pl-…`). Never edit a quote;
  skip it if no real sentence fits.
- Word ids ASCII and unique across `content/words` (grep `id: <id>[,} ]` first); a lesson
  may list an id defined in an earlier chapter instead of redefining it.
- Every claim true of standard modern Polish; name the register (speech, press, officialese,
  literature); no invented facts.
- Commits through `git commit -F <file>`, ending with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Gate for every task: `pnpm -s validate` (only the known «Что дальше» warning),
  `pnpm -s lexicon`, `pnpm -s prettier --check <files>`.

| Ch. | Folder | Words file | Title |
|---|---|---|---|
| 30 | `22-numerals` | `ch30-numerals.yml` | Числительные во всех падежах |
| 31 | `23-aspect` | `ch31-aspect.yml` | Вид: тонкости |
| 32 | `24-government` | `ch32-government.yml` | Управление и предлоги |
| 33 | `25-cohesion` | `ch33-cohesion.yml` | Связный текст и аргументация |
| 34 | `26-particles` | `ch34-particles.yml` | Частицы и порядок слов |
| 35 | `27-colloquial` | `ch35-colloquial.yml` | Разговорный польский и регистр |
| 36 | `28-phraseology` | `ch36-phraseology.yml` | Фразеология |

---

### Task 1: The Prus book — «Nowele» (Kamizelka, Katarynka)

**Files:**
- Create: `content/books/prus-01-kamizelka-i.yml`, `prus-02-kamizelka-ii.yml`,
  `prus-03-katarynka-i.yml`, `prus-04-katarynka-ii.yml`

Source: `https://wolnelektury.pl/media/book/txt/{kamizelka,katarynka}.txt` — «Ten utwór
jest w domenie publicznej»; the footnotes and motifs (Free Art Licence) are not in the
plain text and are not used.

- [ ] **Step 1: Prepare the paragraphs.** Download both texts into the scratchpad, drop the
  header (author, title, ISBN) and the licence footer, keep paragraphs verbatim, and split
  each story at a paragraph boundary near its middle into `<slug>.txt` (one paragraph per
  line). These files are what Task 2 writers quote from.

- [ ] **Step 2: Dispatch four book agents in parallel**, one per chapter file:

```text
Project /Users/gramkin/Projects/PolishLessons. Read CLAUDE.md, shared/schemas.ts (bookSchema,
bookParagraphSchema, bookChunkSchema and their comments), scripts/lib/validate.ts (the books
check: chunks must rebuild `clean` exactly; `words` forms must occur in `clean` and map to
card ids in content/dictionary), and read content/books/alicja-pl-01-krolicza-nora.yml as
the exemplar (Frank method: short chunks with Russian glosses and teaching notes).

Write content/books/<slug>.yml from the paragraphs in <scratchpad>/prus/<slug>.txt (one per
line; use them verbatim as `clean` — never modernise or correct Prus):
  `# review` on line 1; title: Nowele; titleRu: Новеллы; author: Bolesław Prus; no
  translator; source: { name: "Wolne Lektury (Bolesław Prus, «Nowele wybrane», PIW 1976)",
  url: https://wolnelektury.pl/katalog/lektura/<story>/, license: Public domain,
  licenseUrl: https://wolnelektury.pl/info/zasady-wykorzystania/ }; chapter: <N>;
  chapterTitle: "<Kamizelka|Katarynka> (I|II)"; chapterTitleRu: "<Жилетка|Шарманка> (I|II)";
  level: B2.
  Each paragraph: clean, chunks (3–12 words each, Russian `ru` faithful to the 1880s
  Polish, `note` on set phrases, archaic or literary forms (explain what modern Polish
  says), case government and false friends), and `words` mapping 3–8 useful forms per
  paragraph to existing card ids (ls content/dictionary/<id>.yml; never a homograph with
  the wrong meaning). No `en`, no `draft`.
Check: pnpm -s validate (must report nothing for your file), pnpm -s prettier --write
<your file>. Touch only your file. Do not commit. Report: paragraph count, archaic forms
you glossed, renderings you are unsure of.
```

- [ ] **Step 3: Review** — two reviewer agents (Kamizelka, Katarynka) with the Phase 7
  reviewer brief (`scratchpad/p7-review-brief.md`), adapted: the Polish is a 19th-century
  original and must not change; check the Russian glosses, notes and `words` mappings.

- [ ] **Step 4: Gate**, then `pnpm generate` and confirm `/books` lists both books and
  `/books/prus-01-kamizelka-i` links to `prus-02-kamizelka-ii` (not to an *Alicja* chapter).

- [ ] **Step 5: Commit** `feat(books): Prus «Nowele» — Kamizelka and Katarynka`.

### Task 2: Chapters 30–36 — writers

**Files:**
- Modify: `content/chapters.yml` (append chapters 30–36 with the titles in the table)
- Create: per chapter, `content/lessons/<folder>/01-….md … 03-….md`, `04-review.md`,
  `content/words/<words file>`

- [ ] **Step 1: Append chapters 30–36** to `content/chapters.yml`.

- [ ] **Step 2: Dispatch seven chapter agents in parallel** with this brief, filling the
  chapter row and its lesson list from the spec's Phase 8 table:

```text
Project /Users/gramkin/Projects/PolishLessons. Read CLAUDE.md and
docs/superpowers/plans/2026-10-11-phase8-b2-grammar.md («Global Constraints»). Exemplars to
read fully: content/lessons/17-reported/02-czy-zeby.md, content/lessons/19-formal/02-letter.md
(B1 teaching lessons) and content/lessons/19-formal/04-review.md (a review lesson).

You write chapter <C> «<title>» in content/lessons/<folder>/: three teaching lessons
(01-<slug>.md, 02-…, 03-…; orders 1–3) and 04-review.md (order 99), all level B2, plus
content/words/<words file> (`# review`, every entry chapter: <C>).
Lessons: <lesson list from the spec>.

- The learner finished A1–B1 (chapters 1–29): all cases, aspect, conditional, participles,
  -ąc/-wszy, passive, reported speech, word formation, formal style. Use it freely;
  cross-reference earlier lessons («см. урок 24.2») after reading them.
- B2 is precision: contrast Polish with Russian where the Russian speaker goes wrong, give
  the register of every form, and show what a Pole actually says.
- Reading companion: each teaching lesson quotes one or two verbatim sentences from Prus
  (<scratchpad>/prus/*.txt → links /books/prus-01-kamizelka-i, prus-02-kamizelka-ii,
  prus-03-katarynka-i, prus-04-katarynka-ii) or Alicja (content/books/alicja-pl-*.yml,
  field paragraphs[].clean) as a `> ` blockquote with a Russian translation and the link.
  Note that Prus wrote in the 1880s where his usage differs from today's.
- The review lesson: 25–30 questions, ~60 % this chapter, ~40 % earlier chapters (1–<C-1>).
- Other agents write the other chapters at the same time: touch only your folder and words
  file; reuse an existing word id rather than redefining it; ignore validate errors in
  files that are not yours.
Check: pnpm -s validate, pnpm -s lexicon, pnpm -s prettier --write <your files>. Do not
commit. Report per lesson: sections, :pron count, question count, quotes used, new word
ids, Polish you are unsure of.
```

Chapter 30 also gets: «Check whether a drill can practise numeral cases (read
`content/drills.yml`, `shared/schemas.ts` drillSchema, `scripts/lib/drills.ts`, and
`content/forms/{dwa,trzy,piec,oba,poltora}.json`). If one can, propose its YAML in your
report; do not edit drills.yml.» Chapter 31 likewise for iteratives (*bywać, czytywać*).

- [ ] **Step 3: Resolve collisions** (duplicate word ids, cross-references to lessons that
  moved) until `pnpm -s validate` passes.

- [ ] **Step 4: Gate.** No commit yet: drafts are committed per chapter after Task 3's review.

### Task 3: Chapters 30–36 — review

- [ ] **Step 1: Dispatch seven reviewer agents in parallel**, one per chapter, with the
  Phase 7 reviewer brief plus: «every B2 claim about register, frequency or "what Poles
  say" must be defensible; soften what you cannot confirm. Quotes from Prus and Alicja must
  match the source text exactly (grep it).» Pass each the writer's list of doubtful points.

- [ ] **Step 2: Gate.** Validate, lexicon, prettier.

- [ ] **Step 3: Commit per chapter**: `feat(lessons): chapter <C> «<title>»` (its folder, its
  words file; chapters.yml with chapter 30's commit).

### Task 4: Drills (only if Task 2 proposed workable ones)

**Files:**
- Modify: `content/drills.yml`; the lesson that embeds it (`::drill{id="…"}` then `::` on the
  next line, at the end of the lesson)

- [ ] **Step 1:** Add the proposed drill(s), run `pnpm drills`, and read 20 sampled items
  from `public/drills/<id>.json`. Keep a drill only if every sampled item is a correct,
  unambiguous gap; otherwise drop it and say so in the commit message.
- [ ] **Step 2:** Embed, gate, commit `feat(drills): …`.

### Task 5: Links, docs and the full check

**Files:**
- Modify: `content/lessons/21-b1-final/01-test-b1.md` intro (one line: what follows B1 —
  chapter 30), `CLAUDE.md` (Project line: B2 in chapters 30–36; a «B2 track (Phase 8)»
  bullet: folders, the Prus book as second reading companion), the roadmap (a Phase 8 line)

- [ ] **Step 1: Make the edits.**
- [ ] **Step 2: Full check:** `pnpm -s validate && pnpm -s lexicon && pnpm test && pnpm
  typecheck && pnpm lint && pnpm generate`, then e2e against `pnpm preview` with the
  temporary `playwright.reuse.tmp.config.ts` (deleted afterwards). Expected: all pass.
- [ ] **Step 3: Spot-check** `/books`, one Prus chapter, `/lessons/22-numerals/01-…` and the
  chapter 36 review in the browser.
- [ ] **Step 4: Commit** `docs: Phase 8 done — B2 chapters 30–36 and the Prus book`.
