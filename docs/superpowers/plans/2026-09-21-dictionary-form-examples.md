# Dictionary — Per-form Examples, Saved Sentences, Memory Aids

**Status:** implemented on 2026-09-21 — pilot word `zrobić` rebuilt with 53 form examples, etymology, memory hook and idioms.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development) to implement this plan task-by-task.

**Goal:** Cards carry an example for every form, any sentence can be saved for study and practised in a «Фразы» flashcard mode, and cards explain word origin and memory hooks. `zrobić` is rebuilt as the showcase.

**Spec:** `docs/superpowers/specs/2026-09-14-frequency-dictionary-design.md` (addendum 2026-09-21)

**Architecture:** Additive: new optional fields in the authored card schema, new per-form candidates in drafts, new validator rules, new card page sections and a phrase store inside the existing progress object reusing Leitner scheduling.

## Global Constraints

Constraints from `2026-09-14-dictionary-00-overview.md` apply. Plus:
- Progress schema version 2 with migration from v1 (add empty `phrases`); `parseProgress` accepts both.
- Phrase ids: `t<tatoeba id>` when the sentence has one, else `a` + first 8 hex chars of a SHA-256 of the Polish text (stable, computed in a pure util).
- Negated forms are excluded from `formExamples` (rule line instead).
- Runtime values from `shared/` are imported through `#shared/...` in `app/` code.

---

### Task 1: Schema, phrase store and scheduling

**Files:** `shared/dictionary.ts`, `app/utils/progress.ts`, `app/utils/phrases.ts` (new), `app/composables/useProgress.ts`
**Tests:** `tests/unit/dictionary-schemas.test.ts` (extend), `tests/unit/progress.test.ts` (extend), `tests/unit/phrases.test.ts` (new), `tests/nuxt/use-progress.test.ts` (extend)

- `cardSchema` gains optional `formExamples: { form, pl, ru, source }[]`, `etymology: string`, `memory: string`, `idioms: { pl, ru }[]`, `synonyms: string[]`, `antonyms: string[]` (arrays default `[]`).
- `app/utils/phrases.ts`: `phraseId(example): string`, `toPhrase(example, meta): Phrase`, `addPhrase/removePhrase(progress, phrase)`, `phraseList(progress): Phrase[]` (sorted by added date), `duePhrases(progress, now)`.
- `progressSchema`: `version: z.literal(2)`, `phrases: z.record(...).default({})`; `parseProgress` migrates `{version: 1}` by adding `phrases: {}`; `importProgress` accepts both versions.
- `useProgress()` gains `savePhrase`, `deletePhrase`, `hasPhrase`, `reviewPhrase` (reuses `review()` from leitner).

### Task 2: Draft per-form candidates and Wiktionary extras

**Files:** `scripts/dictionary/lib/wiktionary.ts`, `scripts/dictionary/lib/draft.ts`, `scripts/dictionary/lib/tatoeba.ts`
**Tests:** `tests/unit/dictionary-wiktionary.test.ts`, `tests/unit/dictionary-tatoeba.test.ts`, `tests/unit/dictionary-draft.test.ts` (extend)

- `wiktionary.ts`: parse `etymology_texts`, `proverbs`, `synonyms`, `antonyms`; `mergeEntries` exposes them.
- `tatoeba.ts`: `candidatesForForm(sentences, index, form, limit)` — exact whole-word match, translated first, shortest first.
- `draft.ts`: `formCandidates: Record<string, TatoebaSentence[]>` for affirmative forms; draft carries `etymology`, `idioms`, `synonyms`, `antonyms`; report flags forms without any candidate.

### Task 3: Validation

**Files:** `scripts/lib/validate-dictionary.ts`
**Tests:** `tests/unit/dictionary-validate.test.ts` (extend)

- When `formExamples` is present: one entry per affirmative form (`allForms` minus `nie`+form), no duplicates, each sentence contains that exact form (whole word, case-insensitive), sources validated as sense examples (including Tatoeba text equality).
- Missing coverage lists the first five missing forms in the error message.

### Task 4: Card page

**Files:** `app/components/dictionary/Table.vue`, `FormsTables.vue`, `Senses.vue`, `Related.vue`, `Sources.vue`, `Origin.vue` (new), `SaveSentence.vue` (new), `app/pages/slovo/[id].vue`, `app/utils/dictionary.ts`
**Tests:** `tests/nuxt/dictionary-card.test.ts` (extend)

- `Table.vue`: forms with an example render as buttons (`aria-expanded`, `aria-controls`); the selected example appears in a panel under the table (`aria-live="polite"`) with bolded form, translation, 🔊, source badge and `SaveSentence`.
- `FormsTables.vue`: collapsible «Все примеры к формам» list; negation rule line under participle tables.
- `SaveSentence.vue`: ⊕ / ✓ toggle calling `useProgress().savePhrase/deletePhrase`, `aria-pressed`, title «В список фраз».
- `Origin.vue`: section «Происхождение и как запомнить» (etymology + memory).
- `Related.vue`: adds synonyms and antonyms; `Sources.vue`: mentions Wiktionary for etymology and idioms; section order and the header menu follow the spec.

### Task 5: «Фразы» mode

**Files:** `app/pages/flashcards.vue`, `app/components/FlashcardSession.vue`, `app/components/PhraseList.vue` (new), `app/pages/index.vue`
**Tests:** `tests/nuxt/flashcard-session.test.ts` (extend), `tests/nuxt/phrase-list.test.ts` (new)

- Mode switch Слова | Фразы; phrase sessions built with `buildSession` over phrase ids; `FlashcardSession` accepts `phrases` items (front Polish sentence, back Russian + link to the card).
- `PhraseList.vue`: saved phrases with ✕; counters on the setup screen; home summary gains «фраз: N».

### Task 6: Rebuild `zrobić` and verify

**Files:** `content/dictionary/zrobic.yml`, `content/forms/zrobic.json` (generated), `tests/e2e/dictionary.spec.ts`, `tests/e2e/a11y.spec.ts`
- Re-draft, author `formExamples` for all 53 affirmative forms, etymology, memory, idioms, synonyms, antonyms.
- E2E: save a sentence from `/slovo/zrobic`, practise it in «Фразы», reload and see it persist; a11y covers the rebuilt card.
- Full verification: `pnpm validate && pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`.
