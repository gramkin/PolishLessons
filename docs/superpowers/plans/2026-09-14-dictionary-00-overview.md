# Frequency Dictionary — Implementation Plan (Overview)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the frequency-dictionary engine (sources → ranking → drafts → generated forms → published cards), the card pages and integrations, and a 10-card pilot for owner approval.

**Architecture:** Node/TypeScript pipeline in `scripts/dictionary/` reads downloaded sources (PoliMorf, Polish Wiktionary extract, Tatoeba, FrequencyWords) and writes `data/ranked.json`, git-ignored drafts, and committed generated forms (`content/forms/<id>.json`). Authored cards (`content/dictionary/<id>.yml`) plus forms are validated by `pnpm validate` and published by `pnpm dict:publish` into static JSON (`public/dictionary/`), which card pages fetch. Nuxt Content is not used for dictionary data.

**Tech Stack:** Nuxt 4, TypeScript 5.9, zod 3.25, yaml, Node streams (`node:zlib`, `node:readline`, `bzcat` via `node:child_process`), Vitest 5, @nuxt/test-utils, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-09-14-frequency-dictionary-design.md`

## Plan files (execute in order)

| # | File | Delivers |
|---|---|---|
| 1 | `2026-09-14-dictionary-01-pipeline.md` | Tasks 1–6: setup and fixtures, schemas, PoliMorf reader and ranking, forms-table builders, Wiktionary/Tatoeba/Commons readers, draft/build/publish commands, validator rules |
| 2 | `2026-09-14-dictionary-02-site.md` | Tasks 7–8: card page and components, `/vocabulary` rework, popover link, search integration, `/sources` page |
| 3 | `2026-09-14-dictionary-03-pilot.md` | Tasks 9–10: pilot run (10 cards), E2E and accessibility coverage, final verification |

## Global Constraints

- Work on branch `feat/dictionary-engine`; commit after every task; commit messages end with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Downloaded sources live in `data/sources/` (git-ignored). Required files and URLs:
  - `pl_50k.txt` — `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pl/pl_50k.txt`
  - `PoliMorf-0.6.7.tab.gz` — `http://zil.ipipan.waw.pl/PoliMorf?action=AttachFile&do=get&target=PoliMorf-0.6.7.tab.gz`
  - `pl-extract.jsonl.gz` — `https://kaikki.org/dictionary/downloads/pl/pl-extract.jsonl.gz`
  - `pol_sentences.tsv.bz2`, `pol-rus_links.tsv.bz2` — `https://downloads.tatoeba.org/exports/per_language/pol/<file>`
  - `rus_sentences.tsv.bz2` — `https://downloads.tatoeba.org/exports/per_language/rus/rus_sentences.tsv.bz2`
- Reading `.bz2` requires the `bzcat` command (bzip2), present on macOS and Linux.
- Pipeline modules in `scripts/dictionary/lib/` use relative imports only (no Nuxt aliases) and are unit-tested under Vitest `node` with small committed fixtures in `tests/fixtures/dictionary/`. Unit tests never read `data/sources/`.
- Ids match `^[a-z0-9-]+$`; lesson word ids from `content/words/*.yml` are reused for the same lemma.
- Card parts of speech: `noun verb adj adv pron num prep conj part interj`. Aspects: `imperf perf biaspectual`. Example source kinds: `tatoeba translated authored`. Note kinds: `government false-friend stress register pronunciation usage`. Family relations: `derived aspect root antonym`.
- Each authored card has 5–8 examples in total and at least one example per sense.
- Allowed audio licenses: `Public domain`, `CC0*`, `CC BY <version>`, `CC BY-SA <version>`.
- Generated JSON is deterministic: 2-space indentation, trailing newline, `allForms` sorted with `localeCompare(…, 'pl')`, tables in builder order.
- UI text is Russian; Polish text carries `lang="pl"`.
- `pnpm generate` and `pnpm dev` must not need `data/sources/`: they run `dict:publish`, which reads only `content/dictionary/` and `content/forms/`.

## Decisions made during planning

1. **Static JSON instead of Nuxt Content for cards.** Nuxt Content downloads a whole collection dump in the browser on client-side navigation; 2000 cards would add tens of megabytes. `dict:publish` writes `public/dictionary/cards/<id>.json` and `public/dictionary/index.json`; pages fetch only what they need.
2. **One generic table format.** Builders emit `{ title, columns, rows: [{ label, cells: string[][] }], extra }`; a single `FormsTables` component renders every part of speech. `extra: true` tables go into «Все формы».
3. **Past tense stem rule.** 1st/2nd person masculine singular uses the feminine stem when it differs from the masculine base only by `ó→o` (*mógł/mogła → mogłem*), otherwise the masculine base (*szedł → szedłem*). Conditional always uses the masculine base (*mógłbym*).
4. **Wiktionary cross-check is report-only.** Assembled past/conditional forms are compared with Wiktionary's single-word forms; differences go to the batch report, never silently replace data.
5. **Audio file choice.** From a Wiktionary entry's sounds, prefer the file named `Pl-<lemma>.ogg`; ignore other files (entries sometimes list homophones, e.g. *Pl-miedź.ogg* on *mieć*).
6. **Prepositions, conjunctions, particles, interjections have no tables**, as in the spec; their `allForms` still come from PoliMorf (e.g. *w, we*).
7. **Popover link loads the index lazily on the client** (`server: false`) so prerendered page payloads do not grow by the 2000-entry index.

## File map

```
.gitignore                                  + data/sources, data/drafts, data/cache, public/dictionary
package.json                                + dict:fetch dict:fixtures dict:rank dict:draft dict:build dict:publish; dev/generate run dict:publish
shared/dictionary.ts                        zod schemas + types: card, example, forms file, forms table, index entry, published card
scripts/dictionary/lib/paths.ts             source/data/content/public paths and source URLs
scripts/dictionary/lib/lines.ts             async line reader for plain, .gz, .bz2
scripts/dictionary/lib/polimorf.ts          PoliMorf line parser, tag expansion, reader
scripts/dictionary/lib/pos.ts               NKJP tag head → card part of speech
scripts/dictionary/lib/ids.ts               ASCII ids with lesson-id reuse
scripts/dictionary/lib/rank.ts              form index, agglutinate stripping, disambiguation, overrides, ranking
scripts/dictionary/lib/paradigm.ts          forms tables per part of speech, assembled forms, cross-check
scripts/dictionary/lib/wiktionary.ts        Wiktionary entry parser/reader, entry selection, aspect, audio choice
scripts/dictionary/lib/tatoeba.ts           sentence join, tokenizer, token index, candidate selection
scripts/dictionary/lib/commons.ts           Commons API license parsing and fetching
scripts/dictionary/lib/draft.ts             draft assembly and batch report
scripts/dictionary/lib/build.ts             forms file assembly, deterministic JSON
scripts/dictionary/lib/publish.ts           published card and index assembly
scripts/dictionary/cli/fetch.ts             download sources, write data/sources.lock.json
scripts/dictionary/cli/fixtures.ts          regenerate tests/fixtures/dictionary from sources
scripts/dictionary/cli/rank.ts              → data/ranked.json
scripts/dictionary/cli/draft.ts             → data/drafts/<id>.json, data/batches/<label>.md
scripts/dictionary/cli/build.ts             → content/forms/<id>.json
scripts/dictionary/cli/publish.ts           → public/dictionary/index.json, public/dictionary/cards/<id>.json
scripts/lib/load-content.ts                 + cards and forms files
scripts/lib/validate-dictionary.ts          dictionary validation rules
scripts/validate-content.ts                 + dictionary errors and warnings, data/ranked.json
scripts/lib/search-docs.ts                  + card documents (lemma, senses, all forms)
data/overrides.yml, data/ranked.json, data/sources.lock.json, data/batches/*.md
content/dictionary/<id>.yml, content/forms/<id>.json
app/utils/dictionary.ts                     highlighting, rank neighbours, bands, labels
app/composables/useDictionary.ts            index (lazy/eager) and card loaders
app/components/dictionary/Header.vue, Senses.vue, FormsTables.vue, Notes.vue, Related.vue, Sources.vue
app/pages/slovo/[id].vue, app/pages/sources.vue, app/pages/vocabulary.vue (rework)
app/components/content/PlWord.vue           + «Подробнее →»
app/components/AppSidebar.vue               + «Источники и лицензии»
tests/fixtures/dictionary/*                 committed source excerpts
tests/unit/dictionary-*.test.ts, tests/nuxt/dictionary-*.test.ts, tests/e2e/dictionary.spec.ts
```
