# Dictionary Plan 3 — Pilot and End-to-End Coverage

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ten complete pilot cards produced through the real pipeline, and browser-level tests that cover the dictionary end to end.

**Architecture:** Pilot drafts come from `pnpm dict:draft --ids …`; cards are authored against the drafts under the rules below; `dict:build` + `validate` + `dict:publish` + `generate` produce the site.

**Tech Stack:** YAML content, Playwright, axe.

**Spec:** `docs/superpowers/specs/2026-09-14-frequency-dictionary-design.md` (§7, §9, §10)

**Prerequisite:** `2026-09-14-dictionary-01-pipeline.md` and `2026-09-14-dictionary-02-site.md` complete.

## Global Constraints

All constraints in `2026-09-14-dictionary-00-overview.md` → "Global Constraints" apply. Pilot ids: `dom, mama, miec, robic, zrobic, dobry, dobrze, on, dwa, w`.

---

### Task 9: Pilot cards

**Files:**
- Create: `data/batches/pilot.md` (generated), `content/dictionary/{dom,mama,miec,robic,zrobic,dobry,dobrze,on,dwa,w}.yml`, `content/forms/{…}.json` (generated)

**Interfaces:**
- Consumes: `pnpm dict:draft`, `pnpm dict:build`, `pnpm validate`, `pnpm dict:publish` (plan 1); card page (plan 2).
- Produces: ten published cards used by Task 10's tests: `dom` (noun, in lesson 1.1), `miec` (verb with past, future and conditional tables), `robic`/`zrobic` (aspect pair).

- [ ] **Step 1: Draft the pilot**

Run:
```bash
pnpm dict:draft --ids dom,mama,miec,robic,zrobic,dobry,dobrze,on,dwa,w
```
Expected: `✓ 10 drafts in data/drafts, report data/batches/pilot.md`.

Open `data/batches/pilot.md`. Every pilot word must be listed. Note flags: a word with `мало примеров` needs `translated`/`authored` examples; `расхождения форм` must be looked at in `data/drafts/<id>.json` → `mismatches` and, if PoliMorf is wrong, reported in the final summary (do not edit generated forms).

- [ ] **Step 2: Author the ten cards**

For each id, read `data/drafts/<id>.json` and write `content/dictionary/<id>.yml`. Rules:

1. First line `# review`. Copy `id`, `lemma`, `rank`, `pos` from the draft. Verbs: `aspect` from the draft (`imperf` for *mieć* and *robić*, `perf` for *zrobić*); `aspectPair: zrobic` in `robic.yml` and `aspectPair: robic` in `zrobic.yml`; omit `aspectPair` elsewhere.
2. `pron.cyr`: Cyrillic transcription by the course convention (`sz→ш cz→ч rz/ż→ж ś/si→сь ć/ci→ць ź/zi→зь dź/dzi→дзь ń/ni→нь ł→у y→ы e→э ó/u→у ą→он/ом ę→эн/эм, final ę→э ch→х`, devoice final consonants, stress mark on the penultimate syllable of words with 2+ syllables). Lesson words keep the transcription already used in `content/words/*.yml` (e.g. *dom* «дом», *mama* «ма́ма», *mieć* «мьець», *dobrze* «до́бжэ», *on* «он»).
3. `senses`: 2–4 learner-relevant senses built from `wiktionary.senses` (Polish glosses) and `wiktionary.translationsRu`; merge near-duplicates; each `ru` is a concise Russian meaning (several synonyms separated by commas are fine); optional `note` for a sense-specific remark. Sense ids are short ASCII slugs (`house`, `home`, `have`, `must`).
4. `examples`: 5–8 per card, at least one per sense, grouped under the sense they illustrate. Order of preference:
   - a candidate with `ru` → `source: { kind: tatoeba, id: <id> }`, copying `pl` and `ru` **exactly**;
   - a Polish-only candidate → `source: { kind: translated, id: <id> }`, copying `pl` exactly and writing a natural Russian translation;
   - otherwise a short, natural A1–A2 sentence → `source: { kind: authored }`.
   Every example must contain a form listed in the draft's `allForms`. Skip candidates that are vulgar, dated or confusing for learners.
5. `notes`: at least one note that helps a Russian speaker, choosing the right `kind`:
   - `dom`: `usage` — *do domu* «домой», *w domu* «дома»;
   - `mama`: `usage` — vocative *mamo!*;
   - `miec`: `usage` — possession with *mieć* where Russian uses «у меня есть»; genitive after negation *nie mam czasu*; *mieć* + infinitive «должен»;
   - `robic`/`zrobic`: `usage` — aspect pair and the simple future of *zrobić* («сделаю»), compound future of *robić*;
   - `dobry`: `usage` — suppletive *lepszy/najlepszy*; `government` if relevant (*dobry dla kogoś*);
   - `dobrze`: `usage` — *dobrze* as «хорошо / ладно» in replies; comparison *lepiej*;
   - `on`: `pronunciation`/`usage` — long, short and post-prepositional forms *jego / go / niego*;
   - `dwa`: `usage` — *dwaj / dwóch* with masculine-personal nouns, *dwie* with feminine, *dwoje* collective;
   - `w`: `government` — *w* + locative (where) vs *w* + accusative (into, on days of the week), *we* before hard consonant clusters (*we wtorek*).
6. `collocations`: 2–5 frequent combinations with Russian translations.
7. `family`: 2–5 related words from `wiktionary.related` useful to learners, each with `ru` and `relation`; set `id` only for pilot cards (the aspect pair).

- [ ] **Step 3: Generate forms and validate**

Run:
```bash
pnpm dict:build && pnpm validate
```
Expected: `✓ 10 forms files in content/forms`, then `✓ content is valid` (lesson-word warnings only). Fix every reported error in the YAML (never in `content/forms/`), re-running `pnpm dict:build` when an example's Tatoeba id changes.

Run the determinism check:
```bash
pnpm dict:build && git status --short content/forms
```
Expected: no changes after the second build (once the files are committed or staged).

- [ ] **Step 4: Publish and generate**

Run: `pnpm generate`
Expected: exit 0; the log lists `/slovo/dom`, `/slovo/miec` and the other eight card routes.

Run:
```bash
f=.output/public/slovo/miec/index.html
grep -c 'Прошедшее время (ед. ч.)' $f
grep -c 'miałem' $f
grep -c 'Все формы' $f
grep -c 'href="/slovo/miec"' .output/public/vocabulary/index.html
```
Expected: every count ≥ 1.

- [ ] **Step 5: Commit**

```bash
git add content/dictionary content/forms data/batches/pilot.md
git commit -m "content(dictionary): add ten pilot word cards

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: End-to-end and accessibility coverage

**Files:**
- Create: `tests/e2e/dictionary.spec.ts`
- Modify: `tests/e2e/a11y.spec.ts` (add card pages and `/sources`)

**Interfaces:**
- Consumes: `gotoHydrated` (`tests/e2e/helpers.ts`); pilot cards (Task 9).

- [ ] **Step 1: Write the dictionary spec**

`tests/e2e/dictionary.spec.ts`:
```ts
import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test('a lesson word popover links to its detailed card', async ({ page }) => {
  await gotoHydrated(page, '/lessons/01-alphabet/01-letters')
  const word = page.locator('.pl-word', { has: page.locator('button.pl-word-trigger', { hasText: /^dom$/ }) }).first()
  await word.locator('button.pl-word-trigger').click()
  await word.locator('a.card-more').click()
  await expect(page).toHaveURL(/\/slovo\/dom\/?$/)
  await expect(page.locator('h1')).toHaveText('dom')
})

test('card pages move through words by frequency rank', async ({ page }) => {
  await gotoHydrated(page, '/slovo/miec')
  const next = page.locator('nav[aria-label="Соседние слова"] a[rel="next"]')
  await expect(next).toBeVisible()
  await next.click()
  await expect(page).not.toHaveURL(/\/slovo\/miec\/?$/)
  await page.locator('.book[data-ready]').waitFor()
  await page.keyboard.press('ArrowLeft')
  await expect(page).toHaveURL(/\/slovo\/miec\/?$/)
})

test('search finds a verb by an inflected form', async ({ page }) => {
  await gotoHydrated(page, '/')
  await page.keyboard.press('/')
  await page.getByRole('searchbox', { name: 'Поиск' }).fill('mam')
  await page.locator('a.search-hit', { hasText: 'mieć' }).first().click()
  await expect(page).toHaveURL(/\/slovo\/miec\/?$/)
})

test('verb cards show tense tables and extra forms', async ({ page }) => {
  await gotoHydrated(page, '/slovo/miec')
  await expect(page.locator('caption', { hasText: 'Прошедшее время (ед. ч.)' })).toBeVisible()
  await expect(page.locator('caption', { hasText: 'Безличная форма' })).toBeHidden()
  await page.locator('details.all-forms summary').click()
  await expect(page.locator('caption', { hasText: 'Безличная форма' })).toBeVisible()
})

test('the vocabulary filters by frequency band', async ({ page }) => {
  await gotoHydrated(page, '/vocabulary')
  await page.locator('select[aria-label="Частотность"]').selectOption({ label: '1–200' })
  const ranks = await page.locator('tbody td.rank').allTextContents()
  expect(ranks.length).toBeGreaterThan(0)
  expect(ranks.every((r) => Number(r) >= 1 && Number(r) <= 200)).toBe(true)
  await expect(page.locator('tr#zab')).toHaveCount(0)
})
```

- [ ] **Step 2: Extend the accessibility spec**

In `tests/e2e/a11y.spec.ts` add `'/slovo/dom'`, `'/slovo/miec'` and `'/sources'` to `PAGES`.

- [ ] **Step 3: Run the suites**

Run: `pnpm test:e2e`
Expected: all specs PASS (previous 32 + 5 dictionary + 9 new accessibility checks). Fix causes, not assertions: contrast issues by theme variables, markup issues in the named component.

- [ ] **Step 4: Final verification**

Run:
```bash
pnpm validate && pnpm format && pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e
```
Expected: every command exits 0.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e
git commit -m "test(dictionary): cover card pages, search and vocabulary end to end

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

After this task the pilot is ready for the owner's format review (spec §10); batches 1–10 start only after that review.
