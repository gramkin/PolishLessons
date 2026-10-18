# Per-row form examples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every table cell of a dictionary card shows examples of its own case, three per row, or a stated reason why the row has none.

**Architecture:** Form examples already carry an optional `cell` (the row label, commits `0e731b31`, `7e347cce`). This plan adds row-level skips, a per-row minimum for tagged forms (a warning while the backlog is open, an error once it is cleared), then works through the data in stages: the reported card, inanimate vocatives, authoring the real gaps, tagging the untagged nouns, numerals and pronouns, and finally adjectives.

**Tech Stack:** Nuxt 4, Vue SFCs, zod (`shared/dictionary.ts`), Vitest, card YAML in `content/dictionary/`, Python batch scripts in the session scratchpad.

**Spec:** the owner's reports of 2026-10-18 — «examples for the prepositional and vocative cases are mixed together» and «we have a rule "3 examples for each form", and now the vocative has only one»; decision: row skip with a reason for inanimate vocatives.

## Global Constraints

- Three examples per affirmative form stays the rule for untagged forms (`MIN_FORM_EXAMPLES`).
- Once any example of a form carries `cell`, every row the form fills needs 3 examples tagged for that row, or a row skip with a reason.
- Sourced Polish is never edited (`kind: tatoeba` verbatim both sides, `kind: translated` keeps the Polish).
- New and edited Polish keeps the `# review` marker; translation is done by me in batches, no auxiliary agents.
- Commit message through a file, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; stage `content/dictionary content/forms` together.
- Each stage ends green: `pnpm validate`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, `npx prettier --check`.

## Measured backlog (2026-10-18)

| Item | Count |
|---|---|
| Tagged forms with a short row | 1,200 forms, 972 cards |
| — inanimate masculine vocative rows | 1,864 sentences → row skips |
| — animate vocative rows | 1,560 sentences |
| — nominative rows | 448 sentences |
| — prepositional rows | 295 sentences |
| — feminine/neuter vocative rows (animacy unknown) | 15 sentences |
| Untagged shared forms: nouns | 5,735 forms, 2,605 cards |
| Untagged shared forms: adjectives | 5,962 forms, 680 cards |
| Untagged shared forms: numerals / pronouns / verbs | 153 / 33 / 9 forms |
| Upper bound if every untagged row needed 3 | ≈ 61,000 sentences |

The last line is why stages 6 and 7 start with a re-measurement and an owner checkpoint: tagging decides how many rows are real gaps and how many are grammatical identities (an adjective's vocative is always its nominative).

---

### Task 1: Row-level skips and the per-row minimum

**Files:**
- Modify: `shared/dictionary.ts` (`formExamplesSkip` entry gains `cell`)
- Modify: `scripts/lib/validate-dictionary.ts` (row-skip checks, per-row minimum)
- Modify: `app/components/dictionary/FormsTables.vue`, `app/components/dictionary/Table.vue`, `app/components/dictionary/Header.vue` (row skips are not form skips)
- Modify: `app/utils/dictionary.ts` (`hasRowSkip` helper if the template needs it)
- Test: `tests/unit/dictionary-validate.test.ts`, `tests/nuxt/dictionary-card.test.ts`
- Modify: `CLAUDE.md` (Shared spellings paragraph)

**Interfaces:**
- Produces: `formExamplesSkip: { form: string; reason: string; cell?: string }[]` — without `cell` the whole form is skipped (as today); with `cell` only that row.
- Produces validator messages, used by the batch scripts of later tasks:
  - warning `<path>: "<form>" in row "<row>" has <n> example(s), need 3` (Task 5 turns it into an error)
  - error `<path>: formExamplesSkip puts "<form>" in row "<row>", which does not hold it`
  - error `<path>: "<form>" in row "<row>" is both skipped and exemplified`

- [ ] **Step 1: Failing validator tests** — in the `formExamples cell` describe: a tagged form short in one row warns with the message above; a row skip for that row silences it; a row skip naming a row the form does not fill errors; a row skip plus a tagged example for that row errors; an untagged form keeps the per-form rule only.
- [ ] **Step 2: Run** `pnpm vitest run --project unit tests/unit/dictionary-validate.test.ts` — expect the new cases to FAIL.
- [ ] **Step 3: Implement** — schema `cell: text.optional()` on the skip entry; validator splits skips into form skips (no `cell`, existing rules unchanged) and row skips (checked against `rowsByForm`); for every form with at least one tagged example, count tagged examples per row and push the warning for rows under 3 that have no row skip.
- [ ] **Step 4: Failing component test** — a form with a row skip on «Звательный» and examples only on «Предложный»: the vocative cell is plain text with the `is-skipped` class, the reason is listed under the table, and the prepositional cell still opens its examples. Header's conjugation helper receives only form skips.
- [ ] **Step 5: Implement UI** — `FormsTables.vue` passes form skips as today and row skips as `Record<"row|form", reason>`; `Table.vue` marks a row-skipped cell and lists the reason in `tableSkips`; `orphanSkips` and `Header.vue` ignore entries with `cell`.
- [ ] **Step 6: Run** the unit and nuxt suites, typecheck, lint, prettier, `pnpm validate` (expect ~1,200 new warnings, no errors).
- [ ] **Step 7: Commit** `feat(dictionary): row-level form-example skips and a per-row minimum`.

### Task 2: Complete «tchórz»

**Files:** Modify `content/dictionary/tchorz.yml`

- [ ] **Step 1:** List the card's per-row warnings (`pnpm validate 2>&1 | grep tchorz.yml`).
- [ ] **Step 2:** Author the missing rows (at least one more prepositional and two vocative sentences for *tchórzu*; the plural *tchórze* rows as the warnings name them), tagged with `cell`.
- [ ] **Step 3:** `pnpm dict:build`, `pnpm validate` shows no tchorz warnings; `pnpm dict:publish --ids tchorz`.
- [ ] **Step 4: Commit** `content(dictionary): tchórz — three examples in every row`.

### Task 3: Row skips for inanimate vocatives

**Files:** Modify the cards named by the warnings; script `scratchpad/voc/skip_inanimate.py`

- [ ] **Step 1:** Script: for each card whose forms `grammarLabel` contains «неодушевлённый», each tagged form whose «Звательный» row is short and has **no** tagged vocative example, append `{ form, cell: "Звательный", reason: "<reason>" }` to `formExamplesSkip` (creating the key if absent, flow style). Reason text: «к неодушевлённому предмету почти не обращаются, поэтому звательный падеж здесь встречается разве что в поэзии». Dry run prints counts and 40 samples.
- [ ] **Step 2:** Read the sample; list nouns where an address is ordinary (personified things like *los*, *świat*, *Boże*-type words) and exclude them by id.
- [ ] **Step 3:** Write, `pnpm validate` (no errors; warnings drop by the skipped rows), commit `content(dictionary): row skips for inanimate vocatives`.
- [ ] **Step 4:** The 15 feminine/neuter vocative gaps: classify by hand (skip or author) in the same commit or the next.

### Task 4: Author the real gaps

**Files:** the cards still warned about after Task 3, ~20 cards per batch

- [ ] **Step 1:** Script prints the next batch: card id, form, row, missing count, the existing examples of that form, and the card's senses.
- [ ] **Step 2:** Author the sentences directly in YAML (`cell` set, `source: { kind: authored }`), animate vocatives as natural addresses, nominatives as subjects, prepositionals with *w / o / na / przy / po*.
- [ ] **Step 3:** `pnpm dict:build`, `pnpm validate` — the batch's warnings are gone, nothing new; mixed-script check on the touched files.
- [ ] **Step 4:** Commit per batch `content(dictionary): per-row examples, batch N (<first>…<last>)`.
- [ ] Repeat until the per-row warning count is 0 (≈ 2,300 sentences, ≈ 50 batches).

### Task 5: Make the per-row minimum an error

Runs last, after Task 7, once the warning count is 0 — earlier tagging stages add new warnings, and they must not break validation mid-way.

**Files:** `scripts/lib/validate-dictionary.ts`, its test, `CLAUDE.md`

- [ ] **Step 1:** Change the test to expect an error; run it — FAIL.
- [ ] **Step 2:** Move the message from `warnings` to `errors`; run all suites and `pnpm validate` — green.
- [ ] **Step 3: Commit** `feat(dictionary): a tagged form needs three examples in every row`.

### Task 6: Tag the untagged nouns, numerals and pronouns

**Files:** script `scratchpad/voc/tag_position.py`; the cards it touches

- [ ] **Step 1:** Rules, applied only where the form's rows include the target row and the rule leaves exactly one candidate: preceding preposition decides the case (*w, we, o, na, po, przy* → «Предложный» when the form fills it; *do, bez, od, z, u, dla, obok, koło, podczas* → «Родительный»; *z, ze, nad, pod, przed, za, między* + instrumental never collide, so skip); the vocative rule from `tag.py`; a form opening the sentence and followed by a finite verb → «Именительный» when the form fills it and not «Винительный» of the same number.
- [ ] **Step 2:** Dry run, read 60 samples per rule, tighten until no false tag is seen.
- [ ] **Step 3:** Write, validate, commit `content(dictionary): tag shared noun forms by position`.
- [ ] **Step 4:** Re-measure the per-row warnings the new tags opened. **Owner checkpoint** with the numbers before authoring.
- [ ] **Step 5:** Repeat Tasks 3–4 on the new gaps.

### Task 7: Adjectives

**Files:** script `scratchpad/voc/tag_adj.py`; adjective cards

- [ ] **Step 1:** Grammar identity: the adjective «Звательный» row always repeats «Именительный». Proposal for the owner: treat it as an alias (the cell shows the nominative's examples under «звательный совпадает с именительным», no separate examples required), implemented as a validator and UI rule rather than 680 skips.
- [ ] **Step 2:** Tag by agreement: the noun right after the adjective is looked up in the noun cards' forms files; the intersection of the rows both fill decides the row when it is a single one.
- [ ] **Step 3:** Dry run, sample, write, validate, commit; re-measure and author the gaps in batches as in Task 4.
