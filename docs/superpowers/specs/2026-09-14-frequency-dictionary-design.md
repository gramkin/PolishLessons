# Frequency Dictionary with Detailed Word Cards — Design Spec

Date: 2026-09-14
Status: approved design

## 1. Goal

Add a frequency dictionary of the 2000 most frequent Polish lemmas to the site. Every word gets a
detailed card for Russian speakers — all inflected forms, every sense with a Russian translation,
5–8 examples, notes on differences from Russian, pronunciation and word family — on its own page.
Short translations are not enough: each card is a full entry.

## 2. Decisions

| Topic | Decision |
|---|---|
| Scale | Top 2000 lemmas, built in batches of 200 in rank order, plus a final batch for lesson words outside the top 2000 |
| Approach | Data layer generated from open dictionaries + an authored teaching layer; forms are never hand-written |
| Examples | Tatoeba sentences with human Russian translations first, then real Polish sentences translated by Claude, then Claude-authored sentences; 5–8 per card; non-human ones marked for review |
| Card sections | All forms and grammar; senses with examples and collocations; notes for Russian speakers; IPA + Cyrillic pronunciation, audio, word family and aspect pair |
| Placement | One page per word at `/slovo/<id>`; `/vocabulary` becomes the frequency-ordered list |
| Lesson words | One shared dictionary: the 162 lesson word ids are kept and get cards |
| Rollout | Engine + 10-card pilot first (owner approves the format), then batches |

## 3. Sources and licenses

| Source | Version / file | Used for | License |
|---|---|---|---|
| FrequencyWords (hermitdave) | `content/2018/pl/pl_50k.txt` (OpenSubtitles 2018) | word-form frequencies | CC BY-SA 4.0 |
| PoliMorf | 0.6.7 `PoliMorf-0.6.7.tab.gz` | lemmas, all inflected forms, tags (NKJP tagset) | BSD 2-clause |
| Polish Wiktionary via kaikki.org | `pl-extract.jsonl.gz` | senses (Polish glosses), Polish examples, Russian translations per sense, IPA, audio references, related words, inflection tables for cross-checking | CC BY-SA |
| Tatoeba | per-language exports `pol_sentences`, `pol-rus_links`, `rus_sentences` | example sentences and human translations | CC BY 2.0 FR |
| Wikimedia Commons | per-file (e.g. `Pl-dom.ogg`) | pronunciation audio | per file; only public-domain or CC files are used, license and author stored per file |

Measured on the trial top-2000 list:
- Wiktionary: entry 94%, senses 94%, Polish examples 88%, inflection table 71%, Russian translation 78%, IPA 87%, audio 92%.
- Tatoeba: ≥8 Polish sentences for 96% of lemmas; ≥5 sentences with a Russian translation for 54%.

Derived data from CC BY-SA sources is published under CC BY-SA. A `/sources` page lists all sources, licenses and links; every card lists its own sources.

## 4. Pipeline

Downloaded sources live in `data/sources/` (git-ignored; `pnpm dict:fetch` records versions and SHA-256 checksums in `data/sources.lock.json`, which is committed).

### 4.1 Ranking — `pnpm dict:rank` → `data/ranked.json`
1. Read the top 20 000 word forms from the frequency list.
2. Map each form to candidate lemmas with PoliMorf. Forms not found directly are retried after stripping agglutinated person/conditional endings (`byśmy byście śmy ście bym byś em eś m ś`), e.g. *byłem* → *był*.
3. Ambiguous forms are split between candidates in proportion to each candidate's current total, iterated 5 times, starting from a prior equal to the frequency of the lemma's citation form + 1. Lowercase lemmas are preferred over capitalised ones unless no lowercase candidate exists.
4. `data/overrides.yml` applies manual fixes: form→lemma mappings (e.g. `taka → taki`, `jaka → jaki`), lemmas to add (e.g. `siebie`, `Niemiec`), lemmas to exclude.
5. Output per lemma: `rank`, `lemma`, `id` (ASCII, see §5.3), `pos`, `estimatedCount`. Committed.

### 4.2 Draft — `pnpm dict:draft --batch N` → `data/drafts/<id>.json` + `data/batches/N.md`
Batch N covers ranks `(N−1)·200+1 … N·200`. For each lemma the draft contains:
- all PoliMorf rows for the lemma filtered to the card's part of speech;
- Wiktionary senses, Polish examples, Russian translations by sense, IPA, audio references, related words, inflection table;
- 20–30 Tatoeba candidates containing a form of the lemma: first sentences with a Russian translation, then Polish-only; shorter sentences and more distinct forms preferred.

The batch report lists the lemmas and flags: no Wiktionary entry, no Russian translation, fewer than 5 candidates, overrides applied. Drafts are git-ignored; reports are committed.

### 4.3 Authoring
Claude writes `content/dictionary/<id>.yml` for the batch (§5.1). Forms are never authored.

### 4.4 Build — `pnpm dict:build` → `content/forms/<id>.json`
Generates the forms layer (§5.2) for every authored card, including the audio license fetched from the Commons API and a snapshot of the exact Tatoeba texts used by the card. Deterministic: running it twice produces no diff. `pnpm generate` does not require the downloaded sources; `dict:build` does.

## 5. Data model

### 5.1 Authored layer — `content/dictionary/<id>.yml`
```yaml
# review
id: miec
lemma: mieć
rank: 13
pos: verb                 # noun verb adj adv pron num prep conj part interj
aspect: imperf            # verbs only: imperf | perf | biaspectual
aspectPair: null          # id of the other-aspect card, or null
pron: { cyr: "мьець" }
senses:
  - id: have
    ru: "иметь; у кого-то есть"
    note: "optional sense-level note"
    examples:
      - pl: "Mam brata i siostrę."
        ru: "У меня есть брат и сестра."
        source: { kind: tatoeba, id: 348570 }   # tatoeba | translated | authored
notes:
  - kind: usage           # government | false-friend | stress | register | pronunciation | usage
    text: "…"
collocations:
  - { pl: "mieć rację", ru: "быть правым" }
family:
  - { pl: "majątek", ru: "имущество", relation: derived, id: null }   # derived | aspect | root | antonym
```
`source.kind: tatoeba` requires `id`; `translated` requires `id` of the Polish Tatoeba sentence; `authored` has no id.

### 5.2 Generated layer — `content/forms/<id>.json`
```json
{
  "generated": true,
  "sources": { "polimorf": "0.6.7", "wiktionary": "<dump date>", "tatoeba": "<export date>" },
  "id": "miec",
  "lemma": "mieć",
  "pos": "verb",
  "ipa": "mjɛt͡ɕ",
  "audio": { "file": "Pl-mieć.ogg", "url": "…", "license": "…", "author": "…" },
  "allForms": ["mieć", "mam", "masz", "…"],
  "tables": { "…": "part-of-speech specific, see below" },
  "tatoeba": { "348570": { "pl": "…", "ru": "…" } }
}
```

Tables by part of speech (NKJP tags from PoliMorf; merged case slots such as `acc.inst` are expanded into separate cells; rows filtered to the card's part of speech):

| Part of speech | Tables |
|---|---|
| noun | 7 cases × sg/pl; gender (m1 personal, m2 animate, m3 inanimate, f, n); plurale tantum flag |
| verb | infinitive; `fin` present (imperfective) or simple future (perfective) × 6 persons; past = `praet` + agglutinated endings by person × sg m/f/n and pl virile/non-virile; compound future for imperfective (`będę` + infinitive and `będę` + l-participle); conditional = `praet` + `by` + endings; imperative (`impt`); impersonal (`imps`); adverbial participles (`pcon`, `pant`); adjectival participles (`pact`, `ppas`) nominative forms, affirmative only; gerund (`ger`) nominative |
| adj | 7 cases × sg m/f/n and pl virile/non-virile; comparative and superlative (PoliMorf `com`/`sup`, suppletive forms from Wiktionary) |
| adv | positive, comparative, superlative |
| pron | case table with long, short and post-prepositional forms (`akc`, `nakc`, `praep`) |
| num | cases × gender groups |
| prep, conj, part, interj | no table; government goes into `notes` |

Assembled forms (past with endings, conditional, compound future) are cross-checked against Wiktionary inflection tables where present; mismatches are listed in the batch report.

### 5.3 Ids and lesson words
- Ids are ASCII transliterations as in the lesson vocabulary (`ą→a … ż→z`); homographs get a suffix.
- The 162 existing ids in `content/words/*.yml` are reused when the lemma matches.
- Lesson short entries stay in `content/words/*.yml` and remain the source for lessons, popovers and flashcards.

## 6. Site

### 6.1 Card page `/slovo/<id>`
- Header: lemma (`lang="pl"`), speak button (Commons audio when present, otherwise speech synthesis), IPA + Cyrillic, part of speech, aspect, frequency rank, in-page section links.
- **Значения**: numbered senses with examples; the headword form is bold in each example (from `allForms`); origin badge: ✓ for human Tatoeba translation, «на проверке» for `translated`/`authored`.
- **Формы**: main tables visible; participles, gerund and impersonal forms inside a `<details>` «Все формы»; tables use `scope` headers and a focusable scrolling region.
- **Заметки для русскоговорящих**: callouts by `kind` (false-friend in red).
- **Сочетания**, **Родственные слова и видовая пара** (links to existing cards).
- **Источники**: Wiktionary, PoliMorf, linked Tatoeba sentence ids, audio author and license.
- Previous/next by rank using `PageNav` (← → keys).

### 6.2 `/vocabulary`
One list ordered by rank: rank, lemma, first sense, part of speech; filters: text search, part of speech, rank band (1–200, 201–400, …), «встречается в уроках». Rows link to cards; lesson words without a card are listed without a link.

### 6.3 Integration
- `PlWord` popover gets «Подробнее →» when a card with the same id exists.
- Search indexes each card by lemma, Russian senses and all forms (e.g. *mam* finds *mieć*); the index remains lazily loaded.
- `/sources` page linked from the sidebar footer and from every card.
- All card pages are prerendered.

## 7. Batch workflow
1. `pnpm dict:draft --batch N` → drafts + report.
2. Owner checks the lemma list in the report and adjusts `data/overrides.yml` (re-run rank/draft if changed).
3. Claude writes the 200 authored cards; `pnpm dict:build`.
4. `pnpm validate`, unit/component tests, E2E; commit on a batch branch.
5. Owner reviews examples marked «на проверке» and notes (listed with links in the report), sends corrections or edits YAML, removes `# review` markers.

## 8. Validation (`pnpm validate`)
- Authored cards match the zod schema; every sense has ≥1 example; each card has 5–8 examples; every example has a source kind.
- `tatoeba` examples match the snapshot text in `content/forms/<id>.json` exactly (edited human translations must change kind to `translated`).
- Every example contains a form from `allForms` (whole-word, case-insensitive, including forms with agglutinated endings).
- `aspectPair` and `family[].id` reference existing cards.
- Each authored card has a forms file and vice versa; forms files carry `generated: true` and source versions.
- Ranks are unique and match `data/ranked.json`; audio entries carry a license.
- Lesson word without a card: warning until the final batch, error afterwards (config flag).

## 9. Testing
- **Unit (Vitest)** on committed source excerpts in `tests/fixtures/dictionary/`: agglutinate stripping, prior-weighted disambiguation, overrides, table builders for noun/verb (aspect pair)/adjective/pronoun from real PoliMorf rows, merged-tag expansion, past/conditional/compound-future assembly, headword highlighting in examples, card schema, validator rules, deterministic build.
- **Component**: card sections, forms tables (noun, verb, adjective), origin badges, «Подробнее →» link in `PlWord`.
- **E2E (Playwright)**: open a card from a lesson popover; rank navigation; search *mam* → *mieć*; rank-band filter on `/vocabulary`; axe on a noun card and a verb card in light/sepia/dark.

## 10. Rollout
1. **Engine + pilot**: pipeline (fetch, rank, draft, build), validation, card page, `/vocabulary` rework, `/sources`, search and popover integration; pilot cards *dom, mama, mieć, robić, zrobić, dobry, dobrze, on, dwa, w*. Owner approves the pilot format before batches.
2. **Batches 1–10** (ranks 1–2000), content only.
3. **Final batch**: lesson words outside the top 2000; then the lesson-word check becomes an error.

## 11. Out of scope
- Words beyond rank 2000 (other than lesson words).
- Editing Wiktionary or Tatoeba upstream.
- Audio recordings of our own; words without a Commons recording use speech synthesis.
- Flashcards built from the frequency dictionary (lesson flashcards stay as they are).

## 12. Risks
- **Ranking noise** in the subtitle corpus (colloquial bias, residual lemma ambiguity) — mitigated by overrides and the owner's lemma-list check per batch.
- **Wiktionary extract format changes** — the draft step validates the fields it reads and fails loudly.
- **Review load** (~1200 examples per batch) — human Tatoeba translations are marked ✓ and need no review; only `translated`/`authored` examples and notes are queued.
- **Build time** grows with 2000+ prerendered pages.

---

# Addendum (2026-09-21): per-form examples, saved sentences, memory aids

Approved design for three additions requested after the pilot review.

## A1. Per-form examples

- Authored cards gain `formExamples`: one entry per **affirmative** form of the word — `{ form, pl, ru, source }` with the same source kinds and Tatoeba text protection as sense examples.
- Negated forms (`nie` + affirmative, 28% of verb forms and all mechanical) are not separate entries: the card shows one rule line and a single example.
- `dict:draft` collects candidates **per form** (exact whole-word match, translated first, shortest first, max 3) into `formCandidates`.
- Validation: an entry for every affirmative form of the card's forms file; the sentence must contain that exact form; sources checked as elsewhere.
- Measured coverage (Tatoeba): *zrobić* 53 affirmative forms — 40 with a real sentence (21 already translated). Across the 20 most frequent verbs, 46% of key forms have a sentence, 28% a translated one.

## A2. Saved sentences and «Фразы» mode

- Every sentence on a card (meanings, form examples, full list) carries ⊕ to save and ✓ to remove.
- Progress format v2 adds `phrases: { [id]: { pl, ru, from, form, source, box, due } }`; ids are `t<tatoeba id>` or `a<8-char hash>`. v1 files import with an empty list.
- `/flashcards` gains a mode switch Слова | Фразы; phrase cards use the existing Leitner schedule (boxes 0/1/3/7/14 days, 10 new per session), front Polish + 🔊, back Russian + link to the source card.
- The setup screen lists saved phrases with ✕ to delete; the home summary shows their count; export/import carries them.

## A3. Etymology, memory aids, idioms

- New card fields: `etymology` (Wiktionary text in Russian; falls back to the aspect pair when the entry only says "perfective of X"), `memory` (authored hook for Russian speakers), `idioms` (≤5 from Wiktionary with translations), `synonyms`, `antonyms`.
- Coverage in the top 2000: etymology 46%, idioms 54% (≥3: 32%), synonyms 72%, antonyms 32%.
- Card sections become: Значения · Формы (+ примеры) · Происхождение и как запомнить · Сочетания и выражения · Родственные слова · Заметки · Источники.

## A4. Rollout

- *zrobić* is rebuilt in full as the showcase.
- The rule for the remaining words (full per-form coverage vs key forms only) is decided after the owner reviews that page: full coverage for all 2000 words would need ~60 000 authored or translated sentences.
