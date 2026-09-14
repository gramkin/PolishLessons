# Dictionary Plan 1 — Pipeline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A tested pipeline that ranks Polish lemmas by frequency, builds complete forms tables, drafts cards from Wiktionary and Tatoeba, generates committed forms files, publishes static card JSON, and validates authored cards.

**Architecture:** See `2026-09-14-dictionary-00-overview.md`. Pure logic lives in `scripts/dictionary/lib/`; thin CLIs in `scripts/dictionary/cli/` wire files and sources together.

**Tech Stack:** TypeScript via tsx, zod 3.25, yaml, Node streams, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-14-frequency-dictionary-design.md`

## Global Constraints

All constraints in `2026-09-14-dictionary-00-overview.md` → "Global Constraints" apply.

---

### Task 1: Setup, sources, fixtures and shared schemas

**Files:**
- Modify: `.gitignore`, `package.json`
- Create: `shared/dictionary.ts`, `scripts/dictionary/lib/paths.ts`, `scripts/dictionary/lib/lines.ts`, `scripts/dictionary/cli/fetch.ts`, `scripts/dictionary/cli/fixtures.ts`, `tests/fixtures/dictionary/*` (generated), `data/sources.lock.json` (generated)
- Test: `tests/unit/dictionary-schemas.test.ts`, `tests/unit/dictionary-lines.test.ts`

**Interfaces:**
- Produces (`shared/dictionary.ts`):
  - `CARD_POS`, `ASPECTS`, `SOURCE_KINDS`, `NOTE_KINDS`, `FAMILY_RELATIONS` constant tuples; types `CardPos`, `Aspect`, `SourceKind`, `NoteKind`
  - `exampleSchema`, `senseSchema`, `cardSchema` (authored layer) and types `Example`, `Sense`, `Card`
  - `formsTableSchema`, `audioSchema`, `formsFileSchema` and types `FormsTable`, `Audio`, `FormsFile`
  - `indexEntrySchema` `{ id, lemma, rank, pos, gloss }`, `publishedCardSchema` `{ card: Card, forms: FormsFile }`, types `IndexEntry`, `PublishedCard`
- Produces (`scripts/dictionary/lib/paths.ts`): `SOURCES`, `SOURCE_URLS`, `DATA`, `CONTENT`, `PUBLIC_DIR`
- Produces (`scripts/dictionary/lib/lines.ts`): `readLines(path: string): AsyncGenerator<string>` for plain, `.gz` and `.bz2` files
- Fixture files (committed): `polimorf-sample.tab`, `wiktionary-sample.jsonl`, `frequency-sample.txt`, `pol_sentences.tsv`, `pol-rus_links.tsv`, `rus_sentences.tsv`

- [ ] **Step 1: Create the branch, ignore rules and scripts**

Run: `git checkout -b feat/dictionary-engine`

Append to `.gitignore`:
```
data/sources
data/drafts
data/cache
public/dictionary
```

In `package.json` set these scripts (keep the others):
```json
    "dev": "pnpm search-index && pnpm dict:publish && nuxt dev",
    "generate": "pnpm validate && pnpm search-index && pnpm dict:publish && nuxt generate",
    "dict:fetch": "tsx scripts/dictionary/cli/fetch.ts",
    "dict:fixtures": "tsx scripts/dictionary/cli/fixtures.ts",
    "dict:rank": "tsx scripts/dictionary/cli/rank.ts",
    "dict:draft": "tsx scripts/dictionary/cli/draft.ts",
    "dict:build": "tsx scripts/dictionary/cli/build.ts",
    "dict:publish": "tsx scripts/dictionary/cli/publish.ts",
```

- [ ] **Step 2: Create `scripts/dictionary/lib/paths.ts`**

```ts
export const SOURCES = {
  frequency: 'data/sources/pl_50k.txt',
  polimorf: 'data/sources/PoliMorf-0.6.7.tab.gz',
  wiktionary: 'data/sources/pl-extract.jsonl.gz',
  tatoebaPol: 'data/sources/pol_sentences.tsv.bz2',
  tatoebaLinks: 'data/sources/pol-rus_links.tsv.bz2',
  tatoebaRus: 'data/sources/rus_sentences.tsv.bz2',
} as const

export type SourceName = keyof typeof SOURCES

export const SOURCE_URLS: Record<SourceName, string> = {
  frequency:
    'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pl/pl_50k.txt',
  polimorf:
    'http://zil.ipipan.waw.pl/PoliMorf?action=AttachFile&do=get&target=PoliMorf-0.6.7.tab.gz',
  wiktionary: 'https://kaikki.org/dictionary/downloads/pl/pl-extract.jsonl.gz',
  tatoebaPol: 'https://downloads.tatoeba.org/exports/per_language/pol/pol_sentences.tsv.bz2',
  tatoebaLinks: 'https://downloads.tatoeba.org/exports/per_language/pol/pol-rus_links.tsv.bz2',
  tatoebaRus: 'https://downloads.tatoeba.org/exports/per_language/rus/rus_sentences.tsv.bz2',
}

export const DATA = {
  lock: 'data/sources.lock.json',
  ranked: 'data/ranked.json',
  overrides: 'data/overrides.yml',
  drafts: 'data/drafts',
  batches: 'data/batches',
  audioCache: 'data/cache/audio.json',
} as const

export const CONTENT = {
  cards: 'content/dictionary',
  forms: 'content/forms',
  words: 'content/words',
} as const

export const PUBLIC_DIR = 'public/dictionary'

export const FIXTURES = 'tests/fixtures/dictionary'
```

- [ ] **Step 3: Write the failing line-reader test**

`tests/unit/dictionary-lines.test.ts`:
```ts
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { readLines } from '../../scripts/dictionary/lib/lines'

const dir = mkdtempSync(join(tmpdir(), 'dict-lines-'))
const text = 'dom\tdom\tsubst:sg:nom:m3\nmama\tmama\tsubst:sg:nom:f\n'

async function collect(path: string): Promise<string[]> {
  const out: string[] = []
  for await (const line of readLines(path)) out.push(line)
  return out
}

const hasBzip2 = spawnSync('bzip2', ['--help']).status === 0

describe('readLines', () => {
  it('reads plain text files', async () => {
    const path = join(dir, 'plain.tab')
    writeFileSync(path, text)
    expect(await collect(path)).toEqual(['dom\tdom\tsubst:sg:nom:m3', 'mama\tmama\tsubst:sg:nom:f'])
  })

  it('reads gzip files', async () => {
    const path = join(dir, 'file.tab.gz')
    writeFileSync(path, gzipSync(text))
    expect(await collect(path)).toHaveLength(2)
  })

  it.skipIf(!hasBzip2)('reads bzip2 files', async () => {
    const path = join(dir, 'file.tsv')
    writeFileSync(path, text)
    spawnSync('bzip2', ['-f', path])
    expect(await collect(`${path}.bz2`)).toHaveLength(2)
  })
})
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-lines.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `scripts/dictionary/lib/lines.ts`**

```ts
import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import type { Readable } from 'node:stream'
import { createGunzip } from 'node:zlib'

function openStream(path: string): Readable {
  if (path.endsWith('.bz2')) {
    const child = spawn('bzcat', [path], { stdio: ['ignore', 'pipe', 'inherit'] })
    return child.stdout
  }
  const file = createReadStream(path)
  return path.endsWith('.gz') ? file.pipe(createGunzip()) : file
}

export async function* readLines(path: string): AsyncGenerator<string> {
  const lines = createInterface({ input: openStream(path), crlfDelay: Infinity })
  for await (const line of lines) {
    if (line.length > 0) yield line
  }
}
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-lines.test.ts`
Expected: PASS (3 tests, or 2 + 1 skipped without bzip2).

- [ ] **Step 5: Write the failing schema tests**

`tests/unit/dictionary-schemas.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { cardSchema, formsFileSchema, indexEntrySchema } from '../../shared/dictionary'

const card = {
  id: 'dom',
  lemma: 'dom',
  rank: 120,
  pos: 'noun',
  pron: { cyr: 'дом' },
  senses: [
    {
      id: 'house',
      ru: 'дом, здание',
      examples: [
        { pl: 'Mój dom jest duży.', ru: 'Мой дом большой.', source: { kind: 'tatoeba', id: 348760 } },
      ],
    },
  ],
}

describe('cardSchema', () => {
  it('accepts a minimal card and fills defaults', () => {
    const parsed = cardSchema.parse(card)
    expect(parsed.notes).toEqual([])
    expect(parsed.collocations).toEqual([])
    expect(parsed.family).toEqual([])
  })

  it('requires an id for tatoeba and translated sources but not for authored', () => {
    const withSource = (source: unknown) => ({
      ...card,
      senses: [{ ...card.senses[0], examples: [{ pl: 'a', ru: 'б', source }] }],
    })
    expect(cardSchema.safeParse(withSource({ kind: 'tatoeba' })).success).toBe(false)
    expect(cardSchema.safeParse(withSource({ kind: 'translated', id: 1 })).success).toBe(true)
    expect(cardSchema.safeParse(withSource({ kind: 'authored' })).success).toBe(true)
  })

  it('rejects senses without examples, non-integer ranks and unknown note kinds', () => {
    expect(cardSchema.safeParse({ ...card, senses: [{ id: 'x', ru: 'y', examples: [] }] }).success).toBe(false)
    expect(cardSchema.safeParse({ ...card, rank: 1.5 }).success).toBe(false)
    expect(cardSchema.safeParse({ ...card, notes: [{ kind: 'gossip', text: 't' }] }).success).toBe(false)
  })

  it('accepts verb aspect data', () => {
    const verb = { ...card, id: 'robic', lemma: 'robić', pos: 'verb', aspect: 'imperf', aspectPair: 'zrobic' }
    expect(cardSchema.safeParse(verb).success).toBe(true)
  })
})

describe('formsFileSchema', () => {
  it('accepts a generated forms file', () => {
    const forms = {
      generated: true,
      sources: { polimorf: '0.6.7', wiktionary: 'x', tatoeba: 'y' },
      id: 'dom',
      lemma: 'dom',
      pos: 'noun',
      grammarLabel: 'мужской род, неодушевлённый',
      ipa: 'dɔm',
      audio: { file: 'Pl-dom.ogg', url: 'https://upload.wikimedia.org/x.ogg', license: 'Public domain', author: 'tsca' },
      allForms: ['dom', 'domu'],
      tables: [{ title: 'Склонение', columns: ['Ед. ч.', 'Мн. ч.'], rows: [{ label: 'Родительный', cells: [['domu'], ['domów']] }], extra: false }],
      tatoeba: { '348760': { pl: 'Mój dom jest duży.', ru: 'Мой дом большой.' } },
    }
    expect(formsFileSchema.safeParse(forms).success).toBe(true)
    expect(formsFileSchema.safeParse({ ...forms, generated: false }).success).toBe(false)
  })
})

describe('indexEntrySchema', () => {
  it('accepts an index entry', () => {
    expect(indexEntrySchema.safeParse({ id: 'dom', lemma: 'dom', rank: 120, pos: 'noun', gloss: 'дом' }).success).toBe(true)
  })
})
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-schemas.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 6: Implement `shared/dictionary.ts`**

```ts
import { z } from 'zod'

export const CARD_POS = ['noun', 'verb', 'adj', 'adv', 'pron', 'num', 'prep', 'conj', 'part', 'interj'] as const
export const ASPECTS = ['imperf', 'perf', 'biaspectual'] as const
export const SOURCE_KINDS = ['tatoeba', 'translated', 'authored'] as const
export const NOTE_KINDS = ['government', 'false-friend', 'stress', 'register', 'pronunciation', 'usage'] as const
export const FAMILY_RELATIONS = ['derived', 'aspect', 'root', 'antonym'] as const

export type CardPos = (typeof CARD_POS)[number]
export type Aspect = (typeof ASPECTS)[number]
export type SourceKind = (typeof SOURCE_KINDS)[number]
export type NoteKind = (typeof NOTE_KINDS)[number]

const text = z.string().min(1)
const cardId = z.string().regex(/^[a-z0-9-]+$/)
// Integers are declared as numbers with a refinement (Nuxt Content maps JSON-schema "integer" to TEXT).
const positiveInt = z.number().positive().refine(Number.isInteger, { message: 'Expected an integer' })

export const exampleSchema = z.object({
  pl: text,
  ru: text,
  source: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('tatoeba'), id: positiveInt }),
    z.object({ kind: z.literal('translated'), id: positiveInt }),
    z.object({ kind: z.literal('authored') }),
  ]),
})

export const senseSchema = z.object({
  id: cardId,
  ru: text,
  note: z.string().optional(),
  examples: z.array(exampleSchema).min(1),
})

export const cardSchema = z.object({
  id: cardId,
  lemma: text,
  rank: positiveInt,
  pos: z.enum(CARD_POS),
  aspect: z.enum(ASPECTS).optional(),
  aspectPair: cardId.nullable().optional(),
  pron: z.object({ cyr: text }),
  senses: z.array(senseSchema).min(1),
  notes: z.array(z.object({ kind: z.enum(NOTE_KINDS), text })).default([]),
  collocations: z.array(z.object({ pl: text, ru: text })).default([]),
  family: z
    .array(
      z.object({
        pl: text,
        ru: text,
        relation: z.enum(FAMILY_RELATIONS),
        id: cardId.nullable().optional(),
      }),
    )
    .default([]),
})

export const formsTableSchema = z.object({
  title: text,
  columns: z.array(z.string()),
  rows: z.array(z.object({ label: text, cells: z.array(z.array(text)) })),
  extra: z.boolean(),
})

export const audioSchema = z.object({ file: text, url: text, license: text, author: text })

export const formsFileSchema = z.object({
  generated: z.literal(true),
  sources: z.object({ polimorf: text, wiktionary: text, tatoeba: text }),
  id: cardId,
  lemma: text,
  pos: z.enum(CARD_POS),
  grammarLabel: z.string().nullable(),
  ipa: z.string().nullable(),
  audio: audioSchema.nullable(),
  allForms: z.array(text).min(1),
  tables: z.array(formsTableSchema),
  tatoeba: z.record(z.string(), z.object({ pl: text, ru: z.string().nullable() })),
})

export const indexEntrySchema = z.object({
  id: cardId,
  lemma: text,
  rank: positiveInt,
  pos: z.enum(CARD_POS),
  gloss: text,
})

export const publishedCardSchema = z.object({ card: cardSchema, forms: formsFileSchema })

export type Example = z.infer<typeof exampleSchema>
export type Sense = z.infer<typeof senseSchema>
export type Card = z.infer<typeof cardSchema>
export type FormsTable = z.infer<typeof formsTableSchema>
export type Audio = z.infer<typeof audioSchema>
export type FormsFile = z.infer<typeof formsFileSchema>
export type IndexEntry = z.infer<typeof indexEntrySchema>
export type PublishedCard = z.infer<typeof publishedCardSchema>
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-schemas.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 7: Implement the source fetcher `scripts/dictionary/cli/fetch.ts`**

```ts
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { spawnSync } from 'node:child_process'
import { DATA, SOURCE_URLS, SOURCES, type SourceName } from '../lib/paths'

const force = process.argv.includes('--force')

function sha256(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    createReadStream(path)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject)
  })
}

const lock: Record<string, { url: string; file: string; bytes: number; sha256: string }> = {}

for (const name of Object.keys(SOURCES) as SourceName[]) {
  const file = SOURCES[name]
  mkdirSync(dirname(file), { recursive: true })
  if (force || !existsSync(file)) {
    console.log(`↓ ${name}`)
    const result = spawnSync('curl', ['-sSL', '--retry', '3', '--max-time', '3000', '-o', file, SOURCE_URLS[name]], {
      stdio: 'inherit',
    })
    if (result.status !== 0) throw new Error(`download failed: ${name}`)
  }
  lock[name] = { url: SOURCE_URLS[name], file, bytes: statSync(file).size, sha256: await sha256(file) }
  console.log(`✓ ${name} ${lock[name].bytes} bytes`)
}

writeFileSync(DATA.lock, `${JSON.stringify(lock, null, 2)}\n`)
console.log(`✓ ${DATA.lock}`)
```

Run: `pnpm dict:fetch`
Expected: six `✓` lines and `✓ data/sources.lock.json`. (If the sources already exist in `data/sources/`, no download happens; only checksums are computed.)

- [ ] **Step 8: Implement the fixture generator `scripts/dictionary/cli/fixtures.ts`**

```ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { readLines } from '../lib/lines'
import { FIXTURES, SOURCES } from '../lib/paths'

const LEMMAS = new Set(['dom', 'mama', 'mieć', 'robić', 'zrobić', 'dobry', 'dobrze', 'on', 'dwa', 'w', 'nowy', 'być', 'się'])
const WIKI_WORDS = new Set(['dom', 'mama', 'mieć', 'robić', 'zrobić', 'dobry', 'dobrze', 'on', 'dwa', 'w', 'nowy'])
const SENTENCE_IDS = new Set([
  348629, 348760, 352381, 353931, 355239, 348626, 348716, 348737, 348630, 348636, 349048, 349061,
  348658, 348662, 348732,
])

mkdirSync(FIXTURES, { recursive: true })

const polimorf = new Set<string>()
for await (const line of readLines(SOURCES.polimorf)) {
  const lemma = line.split('\t')[1]
  if (lemma && LEMMAS.has(lemma)) polimorf.add(line)
}
writeFileSync(join(FIXTURES, 'polimorf-sample.tab'), `${[...polimorf].sort().join('\n')}\n`)

const wiki: string[] = []
for await (const line of readLines(SOURCES.wiktionary)) {
  const entry = JSON.parse(line) as Record<string, unknown>
  if (entry.lang_code !== 'pl' || !WIKI_WORDS.has(String(entry.word))) continue
  const senses = ((entry.senses as Record<string, unknown>[] | undefined) ?? []).map((s) => ({
    sense_index: s.sense_index,
    glosses: s.glosses,
    examples: ((s.examples as { text: string }[] | undefined) ?? []).slice(0, 2).map((e) => ({ text: e.text })),
  }))
  const trimmed = {
    word: entry.word,
    lang_code: entry.lang_code,
    pos: entry.pos,
    tags: entry.tags,
    senses,
    translations: ((entry.translations as { lang_code?: string }[] | undefined) ?? []).filter((t) => t.lang_code === 'ru'),
    sounds: ((entry.sounds as Record<string, unknown>[] | undefined) ?? []).map((s) => ({ ipa: s.ipa, audio: s.audio, tags: s.tags })),
    related: ((entry.related as unknown[] | undefined) ?? []).slice(0, 5),
    forms: entry.forms ?? [],
  }
  wiki.push(JSON.stringify(trimmed))
}
writeFileSync(join(FIXTURES, 'wiktionary-sample.jsonl'), `${wiki.join('\n')}\n`)

const freq = readFileSync(SOURCES.frequency, 'utf8').split('\n').slice(0, 300).join('\n')
writeFileSync(join(FIXTURES, 'frequency-sample.txt'), `${freq}\n`)

const pol: string[] = []
for await (const line of readLines(SOURCES.tatoebaPol)) {
  if (SENTENCE_IDS.has(Number(line.split('\t')[0]))) pol.push(line)
}
writeFileSync(join(FIXTURES, 'pol_sentences.tsv'), `${pol.join('\n')}\n`)

const links: string[] = []
const rusIds = new Set<number>()
for await (const line of readLines(SOURCES.tatoebaLinks)) {
  const [plId, ruId] = line.split('\t').map(Number)
  if (plId !== undefined && ruId !== undefined && SENTENCE_IDS.has(plId)) {
    links.push(line)
    rusIds.add(ruId)
  }
}
writeFileSync(join(FIXTURES, 'pol-rus_links.tsv'), `${links.join('\n')}\n`)

const rus: string[] = []
for await (const line of readLines(SOURCES.tatoebaRus)) {
  if (rusIds.has(Number(line.split('\t')[0]))) rus.push(line)
}
writeFileSync(join(FIXTURES, 'rus_sentences.tsv'), `${rus.join('\n')}\n`)

console.log(`✓ fixtures: polimorf ${polimorf.size}, wiktionary ${wiki.length}, pol ${pol.length}, links ${links.length}, rus ${rus.length}`)
```

Run: `pnpm dict:fixtures`
Expected: `✓ fixtures: polimorf 614, wiktionary 22, pol 15, links …, rus …` (links/rus ≥ 10).

- [ ] **Step 9: Commit**

Run: `pnpm prettier --write shared/dictionary.ts scripts/dictionary tests/unit/dictionary-*.test.ts && pnpm exec eslint shared/dictionary.ts scripts/dictionary tests/unit`
Expected: exit 0.

```bash
git add .gitignore package.json shared/dictionary.ts scripts/dictionary tests/unit/dictionary-lines.test.ts tests/unit/dictionary-schemas.test.ts tests/fixtures/dictionary data/sources.lock.json
git commit -m "feat(dictionary): add schemas, source fetching and test fixtures

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: PoliMorf reader, ids and frequency ranking

**Files:**
- Create: `scripts/dictionary/lib/polimorf.ts`, `scripts/dictionary/lib/pos.ts`, `scripts/dictionary/lib/ids.ts`, `scripts/dictionary/lib/rank.ts`, `scripts/dictionary/cli/rank.ts`, `data/overrides.yml`, `data/ranked.json` (generated)
- Test: `tests/unit/dictionary-polimorf.test.ts`, `tests/unit/dictionary-ids.test.ts`, `tests/unit/dictionary-rank.test.ts`

**Interfaces:**
- Consumes: `readLines` (Task 1); `CardPos` (Task 1); `foldDiacritics` (`app/utils/normalize.ts`).
- Produces:
  - `interface MorphRow { form: string; lemma: string; tag: string }`; `parsePolimorfLine(line): MorphRow | null`; `expandTag(tag): string[][]` (cartesian product of dot-separated alternatives); `tagHead(tag): string`; `readPolimorf(path, keep: (row) => boolean): Promise<MorphRow[]>` (deduplicated); `parsePolimorfText(text): MorphRow[]`
  - `HEAD_POS: Record<string, CardPos>`; `posOfHead(head): CardPos | null`; `posForHeads(heads: Map<string, number>): CardPos`
  - `transliterateId(lemma): string`; `assignId(lemma, reserved: Map<string, string>, taken: Set<string>): string`
  - `AGLT_SUFFIXES`; `interface FormIndex { forms: Map<string, Set<string>>; lemmaHeads: Map<string, Map<string, number>> }`; `buildFormIndex(rows): FormIndex`; `lemmaCandidates(index, form): Set<string>`; `interface FrequencyEntry { form: string; count: number }`; `parseFrequencyList(text, limit): FrequencyEntry[]`; `interface Overrides { forms: Record<string, string>; add: { lemma: string; pos: CardPos; forms: string[] }[]; exclude: string[]; pos: Record<string, CardPos> }`; `parseOverrides(yamlText): Overrides`; `interface RankedLemma { rank: number; id: string; lemma: string; pos: CardPos; estimatedCount: number; override: boolean }`; `rankLemmas(freq, index, overrides, options: { iterations: number; limit: number; reserved: Map<string, string> }): RankedLemma[]`

- [ ] **Step 1: Write the failing PoliMorf, pos and id tests**

`tests/unit/dictionary-polimorf.test.ts`:
```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { expandTag, parsePolimorfLine, parsePolimorfText, readPolimorf, tagHead } from '../../scripts/dictionary/lib/polimorf'
import { posForHeads, posOfHead } from '../../scripts/dictionary/lib/pos'

const FIXTURE = 'tests/fixtures/dictionary/polimorf-sample.tab'

describe('PoliMorf parsing', () => {
  it('parses a line', () => {
    expect(parsePolimorfLine('domu\tdom\tsubst:sg:gen:m3\tpospolita')).toEqual({ form: 'domu', lemma: 'dom', tag: 'subst:sg:gen:m3' })
    expect(parsePolimorfLine('broken')).toBeNull()
  })

  it('expands merged tag slots', () => {
    expect(expandTag('subst:pl:acc.inst:m3')).toEqual([
      ['subst', 'pl', 'acc', 'm3'],
      ['subst', 'pl', 'inst', 'm3'],
    ])
    expect(expandTag('praet:sg:m1.m2.m3:imperf')).toHaveLength(3)
    expect(tagHead('fin:sg:pri:imperf')).toBe('fin')
  })

  it('reads and filters the fixture', async () => {
    const rows = await readPolimorf(FIXTURE, (row) => row.lemma === 'dom')
    expect(rows).toHaveLength(14)
    expect(parsePolimorfText(readFileSync(FIXTURE, 'utf8')).filter((r) => r.lemma === 'w')).toHaveLength(4)
  })
})

describe('part of speech', () => {
  it('maps tag heads', () => {
    expect(posOfHead('subst')).toBe('noun')
    expect(posOfHead('praet')).toBe('verb')
    expect(posOfHead('ppron3')).toBe('pron')
    expect(posOfHead('qub')).toBe('part')
    expect(posOfHead('xyz')).toBeNull()
  })

  it('picks the heaviest part of speech', () => {
    expect(posForHeads(new Map([['subst', 28], ['adj', 69], ['adja', 1]]))).toBe('adj')
    expect(posForHeads(new Map([['ppron3', 46], ['adj', 23]]))).toBe('pron')
    expect(posForHeads(new Map())).toBe('part')
  })
})
```

`tests/unit/dictionary-ids.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { assignId, transliterateId } from '../../scripts/dictionary/lib/ids'

describe('ids', () => {
  it('transliterates Polish letters', () => {
    expect(transliterateId('mieć')).toBe('miec')
    expect(transliterateId('Żółw')).toBe('zolw')
    expect(transliterateId('dzień dobry')).toBe('dzien-dobry')
  })

  it('reuses lesson ids and deduplicates', () => {
    const reserved = new Map([['część', 'czesc-noun']])
    const taken = new Set<string>()
    expect(assignId('część', reserved, taken)).toBe('czesc-noun')
    expect(assignId('mama', reserved, taken)).toBe('mama')
    expect(assignId('mama', reserved, taken)).toBe('mama-2')
  })
})
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-polimorf.test.ts tests/unit/dictionary-ids.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement `polimorf.ts`, `pos.ts`, `ids.ts`**

`scripts/dictionary/lib/polimorf.ts`:
```ts
import { readLines } from './lines'

export interface MorphRow {
  form: string
  lemma: string
  tag: string
}

export function parsePolimorfLine(line: string): MorphRow | null {
  const [form, lemma, tag] = line.split('\t')
  if (!form || !lemma || !tag) return null
  return { form, lemma, tag }
}

export function expandTag(tag: string): string[][] {
  return tag.split(':').reduce<string[][]>(
    (acc, part) => acc.flatMap((prefix) => part.split('.').map((option) => [...prefix, option])),
    [[]],
  )
}

export function tagHead(tag: string): string {
  return tag.split(':')[0] ?? tag
}

function dedupe(rows: Iterable<MorphRow>): MorphRow[] {
  const seen = new Set<string>()
  const out: MorphRow[] = []
  for (const row of rows) {
    const key = `${row.form}\t${row.lemma}\t${row.tag}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
  }
  return out
}

export function parsePolimorfText(text: string): MorphRow[] {
  return dedupe(text.split('\n').map(parsePolimorfLine).filter((r): r is MorphRow => r !== null))
}

export async function readPolimorf(path: string, keep: (row: MorphRow) => boolean): Promise<MorphRow[]> {
  const rows: MorphRow[] = []
  for await (const line of readLines(path)) {
    const row = parsePolimorfLine(line)
    if (row && keep(row)) rows.push(row)
  }
  return dedupe(rows)
}
```

`scripts/dictionary/lib/pos.ts`:
```ts
import type { CardPos } from '../../../shared/dictionary'

export const HEAD_POS: Record<string, CardPos> = {
  subst: 'noun',
  depr: 'noun',
  adj: 'adj',
  adja: 'adj',
  adjp: 'adj',
  adjc: 'adj',
  adv: 'adv',
  pred: 'adv',
  fin: 'verb',
  bedzie: 'verb',
  aglt: 'verb',
  praet: 'verb',
  impt: 'verb',
  imps: 'verb',
  inf: 'verb',
  pcon: 'verb',
  pant: 'verb',
  pact: 'verb',
  ppas: 'verb',
  ger: 'verb',
  winien: 'verb',
  ppron12: 'pron',
  ppron3: 'pron',
  siebie: 'pron',
  num: 'num',
  numcol: 'num',
  prep: 'prep',
  conj: 'conj',
  comp: 'conj',
  qub: 'part',
  interj: 'interj',
  brev: 'part',
  burk: 'part',
}

export function posOfHead(head: string): CardPos | null {
  return HEAD_POS[head] ?? null
}

export function posForHeads(heads: Map<string, number>): CardPos {
  const weights = new Map<CardPos, number>()
  for (const [head, weight] of heads) {
    const pos = posOfHead(head)
    if (pos) weights.set(pos, (weights.get(pos) ?? 0) + weight)
  }
  let best: CardPos = 'part'
  let bestWeight = -1
  for (const [pos, weight] of weights) {
    if (weight > bestWeight) {
      best = pos
      bestWeight = weight
    }
  }
  return best
}
```

`scripts/dictionary/lib/ids.ts`:
```ts
import { foldDiacritics } from '../../../app/utils/normalize'

export function transliterateId(lemma: string): string {
  return foldDiacritics(lemma.toLowerCase())
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function assignId(lemma: string, reserved: Map<string, string>, taken: Set<string>): string {
  const reservedId = reserved.get(lemma)
  if (reservedId && !taken.has(reservedId)) {
    taken.add(reservedId)
    return reservedId
  }
  const base = transliterateId(lemma) || 'word'
  let id = base
  let n = 2
  while (taken.has(id)) id = `${base}-${n++}`
  taken.add(id)
  return id
}
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-polimorf.test.ts tests/unit/dictionary-ids.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 3: Write the failing ranking tests**

`tests/unit/dictionary-rank.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import type { MorphRow } from '../../scripts/dictionary/lib/polimorf'
import {
  buildFormIndex,
  lemmaCandidates,
  parseFrequencyList,
  parseOverrides,
  rankLemmas,
} from '../../scripts/dictionary/lib/rank'

const rows: MorphRow[] = [
  { form: 'ma', lemma: 'mieć', tag: 'fin:sg:ter:imperf' },
  { form: 'mam', lemma: 'mieć', tag: 'fin:sg:pri:imperf' },
  { form: 'mieć', lemma: 'mieć', tag: 'inf:imperf' },
  { form: 'mam', lemma: 'mama', tag: 'subst:pl:gen:f' },
  { form: 'mama', lemma: 'mama', tag: 'subst:sg:nom:f' },
  { form: 'mam', lemma: 'mamić', tag: 'impt:sg:sec:imperf' },
  { form: 'był', lemma: 'być', tag: 'praet:sg:m1.m2.m3:imperf' },
  { form: 'taka', lemma: 'taka', tag: 'subst:sg:nom:f' },
  { form: 'taka', lemma: 'taki', tag: 'adj:sg:nom.voc:f:pos' },
  { form: 'taki', lemma: 'taki', tag: 'adj:sg:nom.voc:m1.m2.m3:pos' },
  { form: 'ale', lemma: 'ale', tag: 'conj' },
  { form: 'ale', lemma: 'Ala', tag: 'subst:pl:nom:f' },
]

const freqText = ['ma 1000', 'mam 800', 'ale 500', 'taka 300', 'taki 200', 'mama 100', 'byłem 50', 'sobie 40'].join('\n')

const overrides = parseOverrides(`
forms:
  taka: taki
add:
  - { lemma: siebie, pos: pron, forms: [sobie] }
exclude: [mamić]
pos: {}
`)

describe('form index', () => {
  const index = buildFormIndex(rows)

  it('finds candidates, stripping agglutinated endings', () => {
    expect([...lemmaCandidates(index, 'mam')].sort()).toEqual(['mama', 'mamić', 'mieć'])
    expect([...lemmaCandidates(index, 'byłem')]).toEqual(['być'])
    expect(lemmaCandidates(index, 'xyz').size).toBe(0)
  })

  it('counts tag heads per lemma', () => {
    expect(index.lemmaHeads.get('taki')?.get('adj')).toBe(2)
  })
})

describe('rankLemmas', () => {
  const ranked = rankLemmas(parseFrequencyList(freqText, 100), buildFormIndex(rows), overrides, {
    iterations: 5,
    limit: 10,
    reserved: new Map([['mieć', 'miec']]),
  })
  const lemmas = ranked.map((r) => r.lemma)

  it('ranks by estimated count and assigns ids and pos', () => {
    expect(ranked[0]).toMatchObject({ rank: 1, lemma: 'mieć', id: 'miec', pos: 'verb', override: false })
    expect(ranked.find((r) => r.lemma === 'taki')).toMatchObject({ pos: 'adj', override: true })
  })

  it('applies overrides, exclusions and lowercase preference', () => {
    expect(lemmas).toContain('siebie')
    expect(lemmas).toContain('być')
    expect(lemmas).not.toContain('mamić')
    expect(lemmas).not.toContain('taka')
    expect(lemmas).not.toContain('Ala')
  })

  it('gives most of an ambiguous form to the more frequent lemma', () => {
    const mieć = ranked.find((r) => r.lemma === 'mieć')!
    const mama = ranked.find((r) => r.lemma === 'mama')!
    expect(mieć.estimatedCount).toBeGreaterThan(1500)
    expect(mama.estimatedCount).toBeLessThan(400)
  })
})
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-rank.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `scripts/dictionary/lib/rank.ts`**

```ts
import { parse as parseYaml } from 'yaml'
import type { CardPos } from '../../../shared/dictionary'
import { assignId } from './ids'
import { tagHead, type MorphRow } from './polimorf'
import { posForHeads } from './pos'

export const AGLT_SUFFIXES = ['byśmy', 'byście', 'śmy', 'ście', 'bym', 'byś', 'em', 'eś', 'm', 'ś'] as const

export interface FormIndex {
  forms: Map<string, Set<string>>
  lemmaHeads: Map<string, Map<string, number>>
}

export interface FrequencyEntry {
  form: string
  count: number
}

export interface Overrides {
  forms: Record<string, string>
  add: { lemma: string; pos: CardPos; forms: string[] }[]
  exclude: string[]
  pos: Record<string, CardPos>
}

export interface RankedLemma {
  rank: number
  id: string
  lemma: string
  pos: CardPos
  estimatedCount: number
  override: boolean
}

export function buildFormIndex(rows: Iterable<MorphRow>): FormIndex {
  const forms = new Map<string, Set<string>>()
  const lemmaHeads = new Map<string, Map<string, number>>()
  for (const row of rows) {
    const key = row.form.toLowerCase()
    if (!forms.has(key)) forms.set(key, new Set())
    forms.get(key)!.add(row.lemma)
    if (!lemmaHeads.has(row.lemma)) lemmaHeads.set(row.lemma, new Map())
    const heads = lemmaHeads.get(row.lemma)!
    const head = tagHead(row.tag)
    heads.set(head, (heads.get(head) ?? 0) + 1)
  }
  return { forms, lemmaHeads }
}

export function lemmaCandidates(index: FormIndex, form: string): Set<string> {
  const direct = index.forms.get(form)
  if (direct) return direct
  for (const suffix of AGLT_SUFFIXES) {
    if (form.length > suffix.length && form.endsWith(suffix)) {
      const stem = index.forms.get(form.slice(0, -suffix.length))
      if (stem) return stem
    }
  }
  return new Set()
}

export function parseFrequencyList(text: string, limit: number): FrequencyEntry[] {
  const entries: FrequencyEntry[] = []
  for (const line of text.split('\n')) {
    const [form, count] = line.trim().split(/\s+/)
    if (!form || !count) continue
    entries.push({ form: form.toLowerCase(), count: Number(count) })
    if (entries.length === limit) break
  }
  return entries
}

export function parseOverrides(yamlText: string): Overrides {
  const raw = (parseYaml(yamlText) ?? {}) as Partial<Overrides>
  return {
    forms: raw.forms ?? {},
    add: raw.add ?? [],
    exclude: raw.exclude ?? [],
    pos: raw.pos ?? {},
  }
}

function isLowercase(lemma: string): boolean {
  return lemma === lemma.toLowerCase()
}

export function rankLemmas(
  freq: FrequencyEntry[],
  index: FormIndex,
  overrides: Overrides,
  options: { iterations: number; limit: number; reserved: Map<string, string> },
): RankedLemma[] {
  const excluded = new Set(overrides.exclude)
  const formCount = new Map(freq.map((e) => [e.form, e.count]))
  const overridden = new Set<string>([...Object.values(overrides.forms), ...overrides.add.map((a) => a.lemma), ...Object.keys(overrides.pos)])
  const addedForms = new Set(overrides.add.flatMap((a) => a.forms))

  const resolved = freq
    .filter((entry) => !addedForms.has(entry.form))
    .map((entry) => {
      const forced = overrides.forms[entry.form]
      if (forced) return { count: entry.count, candidates: [forced] }
      const all = [...lemmaCandidates(index, entry.form)].filter((l) => !excluded.has(l))
      const lower = all.filter(isLowercase)
      return { count: entry.count, candidates: lower.length > 0 ? lower : all }
    })
    .filter((r) => r.candidates.length > 0)

  let totals = new Map<string, number>()
  for (const r of resolved) {
    for (const lemma of r.candidates) totals.set(lemma, (formCount.get(lemma.toLowerCase()) ?? 0) + 1)
  }
  for (let i = 0; i < options.iterations; i++) {
    const next = new Map<string, number>()
    for (const r of resolved) {
      const weight = r.candidates.reduce((sum, l) => sum + (totals.get(l) ?? 0), 0)
      for (const lemma of r.candidates) {
        const share = weight > 0 ? (r.count * (totals.get(lemma) ?? 0)) / weight : r.count / r.candidates.length
        next.set(lemma, (next.get(lemma) ?? 0) + share)
      }
    }
    totals = next
  }

  for (const added of overrides.add) {
    const count = added.forms.reduce((sum, form) => sum + (formCount.get(form) ?? 0), 0)
    totals.set(added.lemma, (totals.get(added.lemma) ?? 0) + count)
  }

  const addedPos = new Map(overrides.add.map((a) => [a.lemma, a.pos]))
  const sorted = [...totals.entries()]
    .filter(([lemma]) => !excluded.has(lemma))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'))
    .slice(0, options.limit)

  const taken = new Set<string>()
  return sorted.map(([lemma, count], i) => ({
    rank: i + 1,
    id: assignId(lemma, options.reserved, taken),
    lemma,
    pos: overrides.pos[lemma] ?? addedPos.get(lemma) ?? posForHeads(index.lemmaHeads.get(lemma) ?? new Map()),
    estimatedCount: Math.round(count),
    override: overridden.has(lemma),
  }))
}
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-rank.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Create `data/overrides.yml` and the ranking CLI**

`data/overrides.yml`:
```yaml
# Manual fixes applied by `pnpm dict:rank`. Reviewed by the owner before each batch.
forms:
  taka: taki
  jaka: jaki
add:
  - { lemma: siebie, pos: pron, forms: [siebie, sobie, sobą] }
exclude:
  - miąć
  - dosycić
  - mamić
  - taka
  - jaka
pos: {}
```

`scripts/dictionary/cli/rank.ts`:
```ts
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { CONTENT, DATA, SOURCES } from '../lib/paths'
import { readPolimorf } from '../lib/polimorf'
import { AGLT_SUFFIXES, buildFormIndex, parseFrequencyList, parseOverrides, rankLemmas } from '../lib/rank'

const FORM_LIMIT = 20000
const LEMMA_LIMIT = 2000

const freq = parseFrequencyList(readFileSync(SOURCES.frequency, 'utf8'), FORM_LIMIT)
const overrides = parseOverrides(readFileSync(DATA.overrides, 'utf8'))

const wanted = new Set<string>()
for (const { form } of freq) {
  wanted.add(form)
  for (const suffix of AGLT_SUFFIXES) if (form.endsWith(suffix)) wanted.add(form.slice(0, -suffix.length))
}

console.log('… reading PoliMorf (form pass)')
const formRows = await readPolimorf(SOURCES.polimorf, (row) => wanted.has(row.form.toLowerCase()))
const candidateLemmas = new Set(formRows.map((r) => r.lemma))
console.log('… reading PoliMorf (lemma pass)')
const lemmaRows = await readPolimorf(SOURCES.polimorf, (row) => candidateLemmas.has(row.lemma))

const reserved = new Map<string, string>()
for (const file of readdirSync(CONTENT.words).filter((f) => f.endsWith('.yml')).sort()) {
  const data = parseYaml(readFileSync(join(CONTENT.words, file), 'utf8')) as { words: { id: string; pl: string }[] }
  for (const word of data.words) if (!reserved.has(word.pl)) reserved.set(word.pl, word.id)
}

const index = buildFormIndex([...formRows, ...lemmaRows])
const ranked = rankLemmas(freq, index, overrides, { iterations: 5, limit: LEMMA_LIMIT, reserved })

mkdirSync(dirname(DATA.ranked), { recursive: true })
writeFileSync(DATA.ranked, `${JSON.stringify(ranked, null, 2)}\n`)
console.log(`✓ ${DATA.ranked}: ${ranked.length} lemmas; top 10: ${ranked.slice(0, 10).map((r) => r.lemma).join(', ')}`)
```

Run: `pnpm dict:rank`
Expected: `✓ data/ranked.json: 2000 lemmas; top 10: on, być, ten, się, w, to, ja, z, na, co` (order may differ slightly). Then check pilot words are present:
```bash
node -e "const r=require('./data/ranked.json');for(const l of ['dom','mama','mieć','robić','zrobić','dobry','dobrze','on','dwa','w'])console.log(l, JSON.stringify(r.find(x=>x.lemma===l)))"
```
Expected: every pilot lemma has an entry; `mieć` has id `miec`, `dom` has id `dom`.

- [ ] **Step 6: Commit**

Run: `pnpm prettier --write scripts/dictionary tests/unit/dictionary-*.test.ts && pnpm exec eslint scripts/dictionary tests/unit`
Expected: exit 0.

```bash
git add scripts/dictionary tests/unit/dictionary-polimorf.test.ts tests/unit/dictionary-ids.test.ts tests/unit/dictionary-rank.test.ts data/overrides.yml data/ranked.json
git commit -m "feat(dictionary): rank Polish lemmas by frequency with PoliMorf

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 3: Forms tables for every part of speech

**Files:**
- Create: `scripts/dictionary/lib/paradigm.ts`
- Test: `tests/unit/dictionary-paradigm.test.ts`

**Interfaces:**
- Consumes: `MorphRow`, `expandTag`, `parsePolimorfText` (Task 2); `posOfHead` (Task 2); `CardPos`, `Aspect`, `FormsTable` (Task 1).
- Produces:
  - `interface WikiForm { form: string; tags: string[] }`
  - `type Person = 'pri' | 'sec' | 'ter'`
  - `assemblePast(parts: { masc?: string; fem?: string; neut?: string; virile?: string; other?: string }): { sg: Record<'m' | 'f' | 'n', Record<Person, string | null>>; pl: Record<'virile' | 'other', Record<Person, string | null>> }`
  - `assembleConditional(parts)` — same shape, forms with `by` + endings
  - `interface ParadigmResult { tables: FormsTable[]; allForms: string[]; grammarLabel: string | null; mismatches: string[] }`
  - `buildParadigm(pos: CardPos, lemma: string, rows: MorphRow[], wikiForms: WikiForm[], aspect: Aspect | null): ParadigmResult`

Table titles and labels used by the site and tests:
- Cases (rows, in order): `Именительный, Родительный, Дательный, Винительный, Творительный, Предложный, Звательный`
- Persons (rows): `1-е лицо, 2-е лицо, 3-е лицо`
- Noun: `Склонение` columns `Ед. ч., Мн. ч.`
- Verb: `Настоящее время` (imperfective) / `Простое будущее время` (perfective) / `Настоящее и будущее время` (biaspectual) columns `Ед. ч., Мн. ч.`; `Будущее время` (from `bedzie` forms or compound for imperfective); `Прошедшее время (ед. ч.)` columns `м. р., ж. р., ср. р.`; `Прошедшее время (мн. ч.)` columns `мужско-личный, прочие`; `Условное наклонение (ед. ч.)`, `Условное наклонение (мн. ч.)`; `Повелительное наклонение` column `Форма` rows `2-е л. ед. ч., 1-е л. мн. ч., 2-е л. мн. ч., 3-е лицо`; extra: `Безличная форма`, `Деепричастия`, `Причастия`, `Отглагольное существительное`
- Adjective: `Склонение` columns `м. р. (личн./одуш.), м. р. (неодуш.), ж. р., ср. р., мн. ч. (мужско-личн.), мн. ч. (прочие)`; `Степени сравнения` rows `Положительная, Сравнительная, Превосходная`
- Adverb: `Степени сравнения`
- Pronoun (`ppron3`): `Склонение` columns `м. р., ж. р., ср. р., мн. ч. (мужско-личн.), мн. ч. (прочие)`; (`ppron12`, `siebie`): `Склонение` column `Форма`
- Numeral: `Склонение` columns `мужско-личный, м. и ср. р., ж. р., собирательное`
- Empty rows (all cells empty) and empty tables are removed; tables with `extra: true` are the ones listed as extra above.

- [ ] **Step 1: Write the failing tests**

`tests/unit/dictionary-paradigm.test.ts`:
```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { assembleConditional, assemblePast, buildParadigm } from '../../scripts/dictionary/lib/paradigm'
import { parsePolimorfText, type MorphRow } from '../../scripts/dictionary/lib/polimorf'

const all = parsePolimorfText(readFileSync('tests/fixtures/dictionary/polimorf-sample.tab', 'utf8'))
const rowsOf = (lemma: string): MorphRow[] => all.filter((r) => r.lemma === lemma)

function table(result: ReturnType<typeof buildParadigm>, title: string) {
  const found = result.tables.find((t) => t.title === title)
  if (!found) throw new Error(`no table ${title}; have ${result.tables.map((t) => t.title).join(' | ')}`)
  return found
}
function row(t: { rows: { label: string; cells: string[][] }[] }, label: string) {
  const found = t.rows.find((r) => r.label === label)
  if (!found) throw new Error(`no row ${label}`)
  return found.cells
}

describe('assemblePast / assembleConditional', () => {
  it('uses the feminine stem for ó→o alternation and the masculine base otherwise', () => {
    const móc = assemblePast({ masc: 'mógł', fem: 'mogła', neut: 'mogło', virile: 'mogli', other: 'mogły' })
    expect(móc.sg.m).toEqual({ pri: 'mogłem', sec: 'mogłeś', ter: 'mógł' })
    expect(móc.sg.f).toEqual({ pri: 'mogłam', sec: 'mogłaś', ter: 'mogła' })
    expect(móc.sg.n).toEqual({ pri: null, sec: null, ter: 'mogło' })
    expect(móc.pl.virile).toEqual({ pri: 'mogliśmy', sec: 'mogliście', ter: 'mogli' })
    expect(assemblePast({ masc: 'szedł', fem: 'szła' }).sg.m.pri).toBe('szedłem')
  })

  it('builds the conditional from the masculine base', () => {
    const móc = assembleConditional({ masc: 'mógł', fem: 'mogła', neut: 'mogło', virile: 'mogli', other: 'mogły' })
    expect(móc.sg.m).toEqual({ pri: 'mógłbym', sec: 'mógłbyś', ter: 'mógłby' })
    expect(móc.sg.f.pri).toBe('mogłabym')
    expect(móc.pl.other).toEqual({ pri: 'mogłybyśmy', sec: 'mogłybyście', ter: 'mogłyby' })
  })
})

describe('buildParadigm — noun', () => {
  const dom = buildParadigm('noun', 'dom', rowsOf('dom'), [], null)

  it('builds the declension table and grammar label', () => {
    expect(dom.grammarLabel).toBe('мужской род, неодушевлённый')
    const t = table(dom, 'Склонение')
    expect(t.columns).toEqual(['Ед. ч.', 'Мн. ч.'])
    expect(t.rows).toHaveLength(7)
    expect(row(t, 'Родительный')).toEqual([['domu'], ['domów']])
    expect(row(t, 'Звательный')).toEqual([['domu'], ['domy']])
  })

  it('lists all forms sorted', () => {
    expect(dom.allForms).toEqual(['dom', 'domach', 'domami', 'domem', 'domom', 'domowi', 'domów', 'domu', 'domy'])
  })
})

describe('buildParadigm — verbs', () => {
  const mieć = buildParadigm('verb', 'mieć', rowsOf('mieć'), [], 'imperf')

  it('builds present, past, compound future, conditional and imperative', () => {
    expect(row(table(mieć, 'Настоящее время'), '1-е лицо')).toEqual([['mam'], ['mamy']])
    expect(row(table(mieć, 'Прошедшее время (ед. ч.)'), '1-е лицо')).toEqual([['miałem'], ['miałam'], []])
    expect(row(table(mieć, 'Прошедшее время (мн. ч.)'), '1-е лицо')).toEqual([['mieliśmy'], ['miałyśmy']])
    expect(row(table(mieć, 'Будущее время'), '1-е лицо')).toEqual([
      ['będę mieć', 'będę miał', 'będę miała'],
      ['będziemy mieć', 'będziemy mieli', 'będziemy miały'],
    ])
    expect(row(table(mieć, 'Условное наклонение (ед. ч.)'), '1-е лицо')).toEqual([['miałbym'], ['miałabym'], []])
    const impt = table(mieć, 'Повелительное наклонение')
    expect(row(impt, '2-е л. ед. ч.')).toEqual([['miej']])
    expect(row(impt, '3-е лицо')).toEqual([['niech ma', 'niech mają']])
  })

  it('marks rare forms as extra and includes assembled single-word forms', () => {
    expect(table(mieć, 'Безличная форма').extra).toBe(true)
    expect(row(table(mieć, 'Деепричастия'), 'Одновременное')).toEqual([['mając']])
    expect(mieć.allForms).toContain('miałem')
    expect(mieć.allForms).toContain('miałbym')
    expect(mieć.allForms).not.toContain('będę mieć')
  })

  it('uses the simple future title for perfective verbs and skips the compound future', () => {
    const zrobić = buildParadigm('verb', 'zrobić', rowsOf('zrobić'), [], 'perf')
    expect(row(table(zrobić, 'Простое будущее время'), '1-е лицо')).toEqual([['zrobię'], ['zrobimy']])
    expect(zrobić.tables.some((t) => t.title === 'Будущее время')).toBe(false)
    expect(row(table(zrobić, 'Деепричастия'), 'Предшествующее')).toEqual([['zrobiwszy']])
  })

  it('uses być forms for present and future', () => {
    const być = buildParadigm('verb', 'być', rowsOf('być'), [], 'imperf')
    expect(row(table(być, 'Настоящее время'), '1-е лицо')).toEqual([['jestem'], ['jesteśmy']])
    expect(row(table(być, 'Будущее время'), '1-е лицо')).toEqual([['będę'], ['będziemy']])
    expect(row(table(być, 'Прошедшее время (ед. ч.)'), '1-е лицо')).toEqual([['byłem'], ['byłam'], []])
  })

  it('reports Wiktionary forms that were not generated', () => {
    const rows: MorphRow[] = [
      { form: 'mógł', lemma: 'móc', tag: 'praet:sg:m1.m2.m3:imperf' },
      { form: 'mogła', lemma: 'móc', tag: 'praet:sg:f:imperf' },
    ]
    const ok = buildParadigm('verb', 'móc', rows, [{ form: 'mogłem', tags: ['first-person', 'past', 'singular'] }], 'imperf')
    expect(ok.mismatches).toEqual([])
    const bad = buildParadigm('verb', 'móc', rows, [{ form: 'mógłem', tags: ['first-person', 'past', 'singular'] }], 'imperf')
    expect(bad.mismatches).toEqual(['Wiktionary: mógłem (first-person past singular) нет среди сгенерированных форм'])
  })
})

describe('buildParadigm — adjectives, adverbs, pronouns, numerals, prepositions', () => {
  it('builds adjective declension and degrees', () => {
    const dobry = buildParadigm('adj', 'dobry', rowsOf('dobry'), [], null)
    expect(row(table(dobry, 'Склонение'), 'Винительный')).toEqual([['dobrego'], ['dobry'], ['dobrą'], ['dobre'], ['dobrych'], ['dobre']])
    const degrees = table(dobry, 'Степени сравнения')
    expect(row(degrees, 'Сравнительная')).toEqual([['lepszy']])
    expect(row(degrees, 'Превосходная')).toEqual([['najlepszy']])
    expect(dobry.allForms).not.toContain('dobro')
  })

  it('builds adverb degrees', () => {
    const dobrze = buildParadigm('adv', 'dobrze', rowsOf('dobrze'), [], null)
    const t = table(dobrze, 'Степени сравнения')
    expect(t.rows.map((r) => r.cells)).toEqual([[['dobrze']], [['lepiej']], [['najlepiej']]])
  })

  it('orders third-person pronoun variants: long, short, after preposition', () => {
    const on = buildParadigm('pron', 'on', rowsOf('on'), [], null)
    const t = table(on, 'Склонение')
    expect(row(t, 'Родительный')[0]).toEqual(['jego', 'go', 'niego', 'ń'])
    expect(row(t, 'Винительный')[1]).toEqual(['ją', 'nią'])
  })

  it('builds numeral gender columns', () => {
    const dwa = buildParadigm('num', 'dwa', rowsOf('dwa'), [], null)
    expect(row(table(dwa, 'Склонение'), 'Именительный')).toEqual([['dwaj', 'dwóch', 'dwu'], ['dwa'], ['dwie'], ['dwoje']])
  })

  it('gives prepositions forms but no tables', () => {
    const w = buildParadigm('prep', 'w', rowsOf('w'), [], null)
    expect(w.tables).toEqual([])
    expect(w.allForms).toEqual(['w', 'we'])
  })
})
```

Note on the adjective accusative plural: `dobrych` (m1 plural accusative) and `dobre` (non-virile plural accusative). If the fixture shows different forms for those two cells, print `row(table(dobry,'Склонение'),'Винительный')` and correct only those two expected cells to the fixture's values.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project unit tests/unit/dictionary-paradigm.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `scripts/dictionary/lib/paradigm.ts`**

```ts
import type { Aspect, CardPos, FormsTable } from '../../../shared/dictionary'
import { expandTag, type MorphRow } from './polimorf'
import { posOfHead } from './pos'

export interface WikiForm {
  form: string
  tags: string[]
}

export type Person = 'pri' | 'sec' | 'ter'

export interface ParadigmResult {
  tables: FormsTable[]
  allForms: string[]
  grammarLabel: string | null
  mismatches: string[]
}

interface Slot {
  form: string
  head: string
  parts: string[]
}

const CASES = [
  ['nom', 'Именительный'],
  ['gen', 'Родительный'],
  ['dat', 'Дательный'],
  ['acc', 'Винительный'],
  ['inst', 'Творительный'],
  ['loc', 'Предложный'],
  ['voc', 'Звательный'],
] as const

const PERSONS = [
  ['pri', '1-е лицо'],
  ['sec', '2-е лицо'],
  ['ter', '3-е лицо'],
] as const

const TABLE_HEADS: Record<CardPos, string[]> = {
  noun: ['subst'],
  verb: ['fin', 'bedzie', 'praet', 'impt', 'imps', 'inf', 'pcon', 'pant', 'pact', 'ppas', 'ger', 'winien'],
  adj: ['adj', 'adjc'],
  adv: ['adv'],
  pron: ['ppron12', 'ppron3', 'siebie'],
  num: ['num', 'numcol'],
  prep: ['prep'],
  conj: ['conj', 'comp'],
  part: ['qub', 'brev', 'burk'],
  interj: ['interj'],
}

const GENDER_LABELS: Record<string, string> = {
  m1: 'мужской род, личный',
  m2: 'мужской род, одушевлённый',
  m3: 'мужской род, неодушевлённый',
  f: 'женский род',
  n1: 'средний род',
  n2: 'средний род',
  p1: 'только множественное число',
  p2: 'только множественное число',
  p3: 'только множественное число',
}

const VIRILE = new Set(['m1', 'p1'])

function plSort(forms: Iterable<string>): string[] {
  return [...new Set(forms)].sort((a, b) => a.localeCompare(b, 'pl'))
}

function toSlots(rows: MorphRow[], heads: string[]): Slot[] {
  const allowed = new Set(heads)
  return rows.flatMap((row) =>
    expandTag(row.tag)
      .filter((parts) => allowed.has(parts[0]!))
      .map((parts) => ({ form: row.form, head: parts[0]!, parts })),
  )
}

function pick(slots: Slot[], predicate: (s: Slot) => boolean): string[] {
  return plSort(slots.filter(predicate).map((s) => s.form))
}

function one(slots: Slot[], predicate: (s: Slot) => boolean): string | undefined {
  return pick(slots, predicate)[0]
}

function cleanTable(table: FormsTable): FormsTable | null {
  const rows = table.rows.filter((r) => r.cells.some((c) => c.length > 0))
  return rows.length > 0 ? { ...table, rows } : null
}

function tables(...list: (FormsTable | null)[]): FormsTable[] {
  return list.map((t) => (t ? cleanTable(t) : null)).filter((t): t is FormsTable => t !== null)
}

type PersonForms = Record<Person, string | null>

export interface TenseForms {
  sg: Record<'m' | 'f' | 'n', PersonForms>
  pl: Record<'virile' | 'other', PersonForms>
}

interface PastParts {
  masc?: string
  fem?: string
  neut?: string
  virile?: string
  other?: string
}

function withEndings(base: string | undefined, endings: [string, string, string]): PersonForms {
  if (!base) return { pri: null, sec: null, ter: null }
  return { pri: base + endings[0], sec: base + endings[1], ter: base + endings[2] }
}

export function assemblePast(parts: PastParts): TenseForms {
  const femStem = parts.fem?.endsWith('a') ? parts.fem.slice(0, -1) : undefined
  const mascStem =
    femStem && parts.masc && femStem === parts.masc.replace('ó', 'o') ? femStem : parts.masc
  return {
    sg: {
      m: parts.masc && mascStem ? { pri: `${mascStem}em`, sec: `${mascStem}eś`, ter: parts.masc } : { pri: null, sec: null, ter: null },
      f: withEndings(parts.fem, ['m', 'ś', '']),
      n: { pri: null, sec: null, ter: parts.neut ?? null },
    },
    pl: {
      virile: withEndings(parts.virile, ['śmy', 'ście', '']),
      other: withEndings(parts.other, ['śmy', 'ście', '']),
    },
  }
}

export function assembleConditional(parts: PastParts): TenseForms {
  return {
    sg: {
      m: withEndings(parts.masc, ['bym', 'byś', 'by']),
      f: withEndings(parts.fem, ['bym', 'byś', 'by']),
      n: { pri: null, sec: null, ter: parts.neut ? `${parts.neut}by` : null },
    },
    pl: {
      virile: withEndings(parts.virile, ['byśmy', 'byście', 'by']),
      other: withEndings(parts.other, ['byśmy', 'byście', 'by']),
    },
  }
}

const cell = (form: string | null | undefined): string[] => (form ? [form] : [])

function tenseTables(title: string, forms: TenseForms): FormsTable[] {
  return tables(
    {
      title: `${title} (ед. ч.)`,
      columns: ['м. р.', 'ж. р.', 'ср. р.'],
      rows: PERSONS.map(([p, label]) => ({
        label,
        cells: [cell(forms.sg.m[p]), cell(forms.sg.f[p]), cell(forms.sg.n[p])],
      })),
      extra: false,
    },
    {
      title: `${title} (мн. ч.)`,
      columns: ['мужско-личный', 'прочие'],
      rows: PERSONS.map(([p, label]) => ({ label, cells: [cell(forms.pl.virile[p]), cell(forms.pl.other[p])] })),
      extra: false,
    },
  )
}

function tenseFormsList(forms: TenseForms): string[] {
  return [
    ...Object.values(forms.sg).flatMap((p) => Object.values(p)),
    ...Object.values(forms.pl).flatMap((p) => Object.values(p)),
  ].filter((f): f is string => f !== null)
}

const BEDZIE: Record<'sg' | 'pl', Record<Person, string>> = {
  sg: { pri: 'będę', sec: 'będziesz', ter: 'będzie' },
  pl: { pri: 'będziemy', sec: 'będziecie', ter: 'będą' },
}

function verbParadigm(lemma: string, s: Slot[], aspect: Aspect | null, wikiForms: WikiForm[]) {
  const fin = (num: string, person: string) => pick(s, (x) => x.head === 'fin' && x.parts[1] === num && x.parts[2] === person)
  const bedzie = (num: string, person: string) => pick(s, (x) => x.head === 'bedzie' && x.parts[1] === num && x.parts[2] === person)
  const praet = (num: string, genders: string[]) =>
    one(s, (x) => x.head === 'praet' && x.parts[1] === num && genders.includes(x.parts[2]!))
  const parts: PastParts = {
    masc: praet('sg', ['m1', 'm2', 'm3']),
    fem: praet('sg', ['f']),
    neut: praet('sg', ['n1', 'n2']),
    virile: praet('pl', ['m1', 'p1']),
    other: praet('pl', ['m2', 'm3', 'f', 'n1', 'n2', 'p2', 'p3']),
  }
  const past = assemblePast(parts)
  const conditional = assembleConditional(parts)
  const infinitive = one(s, (x) => x.head === 'inf') ?? lemma
  const presentTitle =
    aspect === 'perf' ? 'Простое будущее время' : aspect === 'biaspectual' ? 'Настоящее и будущее время' : 'Настоящее время'
  const hasBedzie = s.some((x) => x.head === 'bedzie')

  const futureTable: FormsTable | null = hasBedzie
    ? {
        title: 'Будущее время',
        columns: ['Ед. ч.', 'Мн. ч.'],
        rows: PERSONS.map(([p, label]) => ({ label, cells: [bedzie('sg', p), bedzie('pl', p)] })),
        extra: false,
      }
    : aspect === 'imperf'
      ? {
          title: 'Будущее время',
          columns: ['Ед. ч.', 'Мн. ч.'],
          rows: PERSONS.map(([p, label]) => ({
            label,
            cells: [
              [`${BEDZIE.sg[p]} ${infinitive}`, ...cell(parts.masc && `${BEDZIE.sg[p]} ${parts.masc}`), ...cell(parts.fem && `${BEDZIE.sg[p]} ${parts.fem}`)],
              [`${BEDZIE.pl[p]} ${infinitive}`, ...cell(parts.virile && `${BEDZIE.pl[p]} ${parts.virile}`), ...cell(parts.other && `${BEDZIE.pl[p]} ${parts.other}`)],
            ],
          })),
          extra: false,
        }
      : null

  const impt = (num: string, person: string) => pick(s, (x) => x.head === 'impt' && x.parts[1] === num && x.parts[2] === person)
  const niech = [...fin('sg', 'ter'), ...fin('pl', 'ter')].map((f) => `niech ${f}`)
  const participle = (head: string, genders: string[]) =>
    pick(s, (x) => x.head === head && x.parts[1] === 'sg' && x.parts[2] === 'nom' && genders.includes(x.parts[3]!) && x.parts[5] === 'aff')

  const built = tables(
    {
      title: presentTitle,
      columns: ['Ед. ч.', 'Мн. ч.'],
      rows: PERSONS.map(([p, label]) => ({ label, cells: [fin('sg', p), fin('pl', p)] })),
      extra: false,
    },
    ...tenseTables('Прошедшее время', past),
    futureTable,
    ...tenseTables('Условное наклонение', conditional),
    {
      title: 'Повелительное наклонение',
      columns: ['Форма'],
      rows: [
        { label: '2-е л. ед. ч.', cells: [impt('sg', 'sec')] },
        { label: '1-е л. мн. ч.', cells: [impt('pl', 'pri')] },
        { label: '2-е л. мн. ч.', cells: [impt('pl', 'sec')] },
        { label: '3-е лицо', cells: [niech] },
      ],
      extra: false,
    },
    {
      title: 'Безличная форма',
      columns: ['Форма'],
      rows: [{ label: 'Прошедшее время', cells: [pick(s, (x) => x.head === 'imps')] }],
      extra: true,
    },
    {
      title: 'Деепричастия',
      columns: ['Форма'],
      rows: [
        { label: 'Одновременное', cells: [pick(s, (x) => x.head === 'pcon')] },
        { label: 'Предшествующее', cells: [pick(s, (x) => x.head === 'pant')] },
      ],
      extra: true,
    },
    {
      title: 'Причастия',
      columns: ['м. р.', 'ж. р.', 'ср. р.'],
      rows: [
        { label: 'Действительное', cells: [participle('pact', ['m1', 'm2', 'm3']), participle('pact', ['f']), participle('pact', ['n1', 'n2'])] },
        { label: 'Страдательное', cells: [participle('ppas', ['m1', 'm2', 'm3']), participle('ppas', ['f']), participle('ppas', ['n1', 'n2'])] },
      ],
      extra: true,
    },
    {
      title: 'Отглагольное существительное',
      columns: ['Форма'],
      rows: [{ label: 'Именительный', cells: [pick(s, (x) => x.head === 'ger' && x.parts[1] === 'sg' && x.parts[2] === 'nom' && x.parts[5] === 'aff')] }],
      extra: true,
    },
  )

  const generated = new Set([...tenseFormsList(past), ...tenseFormsList(conditional)])
  const known = new Set([...s.map((x) => x.form), ...generated])
  const mismatches = wikiForms
    .filter((w) => !w.form.includes(' '))
    .filter((w) => (w.tags.includes('past') || w.tags.includes('conditional')) && !w.tags.some((t) => ['rare', 'pluperfect', 'potential'].includes(t)))
    .filter((w) => !known.has(w.form))
    .map((w) => `Wiktionary: ${w.form} (${w.tags.join(' ')}) нет среди сгенерированных форм`)

  return { tables: built, extraForms: [...generated], mismatches }
}

function nounParadigm(s: Slot[]) {
  return tables({
    title: 'Склонение',
    columns: ['Ед. ч.', 'Мн. ч.'],
    rows: CASES.map(([c, label]) => ({
      label,
      cells: [pick(s, (x) => x.parts[1] === 'sg' && x.parts[2] === c), pick(s, (x) => x.parts[1] === 'pl' && x.parts[2] === c)],
    })),
    extra: false,
  })
}

function adjParadigm(s: Slot[], lemma: string, wikiForms: WikiForm[]) {
  const pos = s.filter((x) => x.head === 'adj' && x.parts[4] === 'pos')
  const col = (num: string, genders: string[]) => (c: string) =>
    pick(pos, (x) => x.parts[1] === num && x.parts[2] === c && genders.includes(x.parts[3]!))
  const columns = [
    col('sg', ['m1', 'm2']),
    col('sg', ['m3']),
    col('sg', ['f']),
    col('sg', ['n1', 'n2']),
    col('pl', ['m1', 'p1']),
    col('pl', ['m2', 'm3', 'f', 'n1', 'n2', 'p2', 'p3']),
  ]
  const degree = (d: string, wikiTag: string) => {
    const fromPolimorf = pick(s, (x) => x.head === 'adj' && x.parts[1] === 'sg' && x.parts[2] === 'nom' && x.parts[3] === 'm1' && x.parts[4] === d)
    return fromPolimorf.length > 0 ? fromPolimorf : plSort(wikiForms.filter((w) => w.tags.includes(wikiTag)).map((w) => w.form))
  }
  const comparative = degree('com', 'comparative')
  const superlative = degree('sup', 'superlative')
  return tables(
    {
      title: 'Склонение',
      columns: ['м. р. (личн./одуш.)', 'м. р. (неодуш.)', 'ж. р.', 'ср. р.', 'мн. ч. (мужско-личн.)', 'мн. ч. (прочие)'],
      rows: CASES.map(([c, label]) => ({ label, cells: columns.map((f) => f(c)) })),
      extra: false,
    },
    comparative.length > 0 || superlative.length > 0
      ? {
          title: 'Степени сравнения',
          columns: ['Форма'],
          rows: [
            { label: 'Положительная', cells: [[lemma]] },
            { label: 'Сравнительная', cells: [comparative] },
            { label: 'Превосходная', cells: [superlative] },
          ],
          extra: false,
        }
      : null,
  )
}

function advParadigm(s: Slot[]) {
  const degree = (d: string) => pick(s, (x) => x.parts[1] === d)
  const rows = [
    { label: 'Положительная', cells: [degree('pos')] },
    { label: 'Сравнительная', cells: [degree('com')] },
    { label: 'Превосходная', cells: [degree('sup')] },
  ]
  return rows.filter((r) => r.cells[0]!.length > 0).length > 1
    ? tables({ title: 'Степени сравнения', columns: ['Форма'], rows, extra: false })
    : []
}

const ACCENT_ORDER: Record<string, number> = { akc: 0, _: 1, nakc: 2 }
const PRAEP_ORDER: Record<string, number> = { npraep: 0, _: 1, praep: 2 }

function pronParadigm(s: Slot[]) {
  const ordered = (predicate: (x: Slot) => boolean, accentIndex: number, praepIndex: number) => {
    const matching = s.filter(predicate)
    const key = (x: Slot) => [PRAEP_ORDER[x.parts[praepIndex] ?? '_'] ?? 1, ACCENT_ORDER[x.parts[accentIndex] ?? '_'] ?? 1] as const
    return [...matching]
      .sort((a, b) => key(a)[0] - key(b)[0] || key(a)[1] - key(b)[1] || a.form.localeCompare(b.form, 'pl'))
      .map((x) => x.form)
      .filter((form, i, arr) => arr.indexOf(form) === i)
  }
  const third = s.filter((x) => x.head === 'ppron3')
  if (third.length > 0) {
    const gender = (num: string, genders: string[]) => (c: string) =>
      ordered((x) => x.head === 'ppron3' && x.parts[1] === num && x.parts[2] === c && (x.parts[3] === '_' || genders.includes(x.parts[3]!)), 5, 6)
    const columns = [
      gender('sg', ['m1', 'm2', 'm3']),
      gender('sg', ['f']),
      gender('sg', ['n1', 'n2']),
      gender('pl', ['m1', 'p1']),
      gender('pl', ['m2', 'm3', 'f', 'n1', 'n2', 'p2', 'p3']),
    ]
    return tables({
      title: 'Склонение',
      columns: ['м. р.', 'ж. р.', 'ср. р.', 'мн. ч. (мужско-личн.)', 'мн. ч. (прочие)'],
      rows: CASES.map(([c, label]) => ({ label, cells: columns.map((f) => f(c)) })),
      extra: false,
    })
  }
  const caseIndex = (x: Slot) => (x.head === 'siebie' ? 1 : 2)
  return tables({
    title: 'Склонение',
    columns: ['Форма'],
    rows: CASES.map(([c, label]) => ({ label, cells: [ordered((x) => x.parts[caseIndex(x)] === c, 5, 6)] })),
    extra: false,
  })
}

function numParadigm(s: Slot[]) {
  const col = (genders: string[]) => (c: string) => pick(s, (x) => x.head === 'num' && x.parts[2] === c && genders.includes(x.parts[3]!))
  const columns = [col(['m1']), col(['m2', 'm3', 'n2']), col(['f']), col(['n1', 'p1', 'p2'])]
  return tables({
    title: 'Склонение',
    columns: ['мужско-личный', 'м. и ср. р.', 'ж. р.', 'собирательное'],
    rows: CASES.map(([c, label]) => ({ label, cells: columns.map((f) => f(c)) })),
    extra: false,
  })
}

function nounGender(s: Slot[]): string | null {
  const counts = new Map<string, number>()
  for (const x of s) {
    const g = x.parts[3]
    if (g) counts.set(g, (counts.get(g) ?? 0) + 1)
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  return best ? (GENDER_LABELS[best] ?? null) : null
}

export function buildParadigm(
  pos: CardPos,
  lemma: string,
  rows: MorphRow[],
  wikiForms: WikiForm[],
  aspect: Aspect | null,
): ParadigmResult {
  const own = rows.filter((r) => r.lemma === lemma && posOfHead(r.tag.split(':')[0]!) === pos)
  const s = toSlots(own, TABLE_HEADS[pos])
  const baseForms = [...s.map((x) => x.form), lemma]

  switch (pos) {
    case 'noun':
      return { tables: nounParadigm(s), allForms: plSort(baseForms), grammarLabel: nounGender(s), mismatches: [] }
    case 'verb': {
      const verb = verbParadigm(lemma, s, aspect, wikiForms)
      return { tables: verb.tables, allForms: plSort([...baseForms, ...verb.extraForms]), grammarLabel: null, mismatches: verb.mismatches }
    }
    case 'adj':
      return { tables: adjParadigm(s, lemma, wikiForms), allForms: plSort(baseForms), grammarLabel: null, mismatches: [] }
    case 'adv':
      return { tables: advParadigm(s), allForms: plSort(baseForms), grammarLabel: null, mismatches: [] }
    case 'pron':
      return { tables: pronParadigm(s), allForms: plSort(baseForms), grammarLabel: null, mismatches: [] }
    case 'num':
      return { tables: numParadigm(s), allForms: plSort(baseForms), grammarLabel: null, mismatches: [] }
    default:
      return { tables: [], allForms: plSort(baseForms), grammarLabel: null, mismatches: [] }
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/dictionary-paradigm.test.ts`
Expected: PASS (12 tests). If a single expected cell differs from the fixture (the plan's expected values were read from `polimorf-sample.tab`; re-check with `grep -P '\tdobry\tadj:pl:acc' tests/fixtures/dictionary/polimorf-sample.tab`), fix the expectation only when the fixture confirms the implementation's output; otherwise fix the builder.

- [ ] **Step 5: Commit**

Run: `pnpm prettier --write scripts/dictionary/lib/paradigm.ts tests/unit/dictionary-paradigm.test.ts && pnpm exec eslint scripts/dictionary tests/unit`
Expected: exit 0.

```bash
git add scripts/dictionary/lib/paradigm.ts tests/unit/dictionary-paradigm.test.ts
git commit -m "feat(dictionary): build forms tables for all parts of speech

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 4: Wiktionary, Tatoeba and Commons readers

**Files:**
- Create: `scripts/dictionary/lib/wiktionary.ts`, `scripts/dictionary/lib/tatoeba.ts`, `scripts/dictionary/lib/commons.ts`, `tests/fixtures/dictionary/commons-response.json`
- Test: `tests/unit/dictionary-wiktionary.test.ts`, `tests/unit/dictionary-tatoeba.test.ts`, `tests/unit/dictionary-commons.test.ts`

**Interfaces:**
- Consumes: `readLines` (Task 1); `WikiForm` (Task 3); `CardPos`, `Aspect` (Task 1).
- Produces (`wiktionary.ts`):
  - `interface WikiSense { index: string; glosses: string[]; examples: string[] }`
  - `interface WikiEntry { word: string; pos: string; tags: string[]; senses: WikiSense[]; translationsRu: { word: string; senseIndex: string | null }[]; ipa: string[]; audioFiles: string[]; related: string[]; forms: WikiForm[] }`
  - `WIKI_POS: Record<CardPos, string[]>`; `parseWikiEntry(value: unknown): WikiEntry | null`; `readWiktionary(path, words: Set<string>): Promise<Map<string, WikiEntry[]>>`; `selectEntries(entries, pos): WikiEntry[]`; `aspectOf(entries): Aspect | null`; `chooseAudio(entries, lemma): string | null`; `mergeEntries(entries): { senses; translationsRu; ipa: string | null; forms: WikiForm[]; related: string[] }` (sense indexes prefixed `<entry>:` when there is more than one entry)
- Produces (`tatoeba.ts`):
  - `interface TatoebaSentence { id: number; pl: string; ru: string | null }`
  - `readTatoeba(paths: { pol: string; links: string; rus: string }): Promise<TatoebaSentence[]>` (sorted by id; first linked Russian translation)
  - `tokenize(text): string[]`; `buildTokenIndex(sentences): Map<string, number[]>` (token → sentence positions); `matchedForms(tokens, forms: Set<string>): string[]`; `pickCandidates(sentences, index, forms: string[], limit = 30): TatoebaSentence[]`
- Produces (`commons.ts`):
  - `interface AudioMeta { file: string; url: string; license: string; author: string }`
  - `isFreeLicense(license): boolean`; `stripHtml(html): string`; `parseCommonsResponse(json: unknown): AudioMeta[]`; `fetchAudioMeta(files: string[], fetchImpl?: typeof fetch): Promise<Map<string, AudioMeta>>`

Candidate selection rule (`pickCandidates`): pool = sentences containing any of `forms` (lowercase), ordered by (has Russian first, fewer tokens, lower id). Pass 1 takes, in pool order, each sentence of at most 12 tokens that adds a matched form not yet covered. Pass 2 fills up to `limit` with the remaining pool in order.

- [ ] **Step 1: Write the failing tests**

`tests/fixtures/dictionary/commons-response.json`:
```json
{
  "batchcomplete": true,
  "query": {
    "pages": [
      {
        "title": "File:Pl-dom.ogg",
        "imageinfo": [
          {
            "url": "https://upload.wikimedia.org/wikipedia/commons/5/52/Pl-dom.ogg?utm_source=commons.wikimedia.org",
            "extmetadata": {
              "LicenseShortName": { "value": "Public domain" },
              "Artist": { "value": "<a href=\"//commons.wikimedia.org/wiki/User:Tsca\" title=\"User:Tsca\">tsca</a>" }
            }
          }
        ]
      },
      {
        "title": "File:Pl-mieć.ogg",
        "imageinfo": [
          {
            "url": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Pl-mie%C4%87.ogg",
            "extmetadata": {
              "LicenseShortName": { "value": "CC BY 2.5" },
              "Artist": { "value": "<a href=\"//commons.wikimedia.org/wiki/User:Derbeth\">Derbeth</a> &amp; friends" }
            }
          }
        ]
      },
      {
        "title": "File:Pl-zastrzeżone.ogg",
        "imageinfo": [
          {
            "url": "https://upload.wikimedia.org/x.ogg",
            "extmetadata": { "LicenseShortName": { "value": "All rights reserved" }, "Artist": { "value": "someone" } }
          }
        ]
      },
      { "title": "File:Pl-missing.ogg", "missing": true }
    ]
  }
}
```

`tests/unit/dictionary-wiktionary.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { aspectOf, chooseAudio, mergeEntries, readWiktionary, selectEntries } from '../../scripts/dictionary/lib/wiktionary'

const FIXTURE = 'tests/fixtures/dictionary/wiktionary-sample.jsonl'
const entries = await readWiktionary(FIXTURE, new Set(['dom', 'mieć', 'robić', 'zrobić', 'dobry', 'w', 'dwa']))

describe('readWiktionary', () => {
  it('reads Polish entries for the requested words only', () => {
    expect([...entries.keys()].sort()).toEqual(['dobry', 'dom', 'dwa', 'mieć', 'robić', 'w', 'zrobić'])
    expect(entries.get('dom')).toHaveLength(1)
  })

  it('parses senses, examples, Russian translations and forms', () => {
    const dom = mergeEntries(selectEntries(entries.get('dom')!, 'noun'))
    expect(dom.senses).toHaveLength(4)
    expect(dom.senses[0]).toMatchObject({ index: '1.1', glosses: ['oddzielny budynek mieszkalny'] })
    expect(dom.senses[0]!.examples).toContain('W mieście wyrosło wiele nowych domów.')
    expect(dom.translationsRu).toContainEqual({ word: 'дом', senseIndex: '1.1' })
    expect(dom.forms.find((f) => f.form === 'domów')?.tags).toEqual(['genitive', 'plural'])
    expect(dom.ipa).not.toBeNull()
  })
})

describe('entry selection', () => {
  it('filters by part of speech with fallbacks', () => {
    expect(selectEntries(entries.get('dobry')!, 'adj').map((e) => e.pos)).toEqual(['adj'])
    expect(selectEntries(entries.get('dwa')!, 'num').length).toBeGreaterThan(0)
    expect(selectEntries(entries.get('w')!, 'prep').map((e) => e.pos)).toEqual(['prep'])
  })

  it('merges several entries with prefixed sense indexes', () => {
    const robić = mergeEntries(selectEntries(entries.get('robić')!, 'verb'))
    expect(robić.senses.length).toBeGreaterThan(4)
    expect(robić.senses[0]!.index.startsWith('1:')).toBe(true)
  })

  it('detects aspect and chooses the matching audio file', () => {
    expect(aspectOf(selectEntries(entries.get('robić')!, 'verb'))).toBe('imperf')
    expect(aspectOf(selectEntries(entries.get('zrobić')!, 'verb'))).toBe('perf')
    expect(aspectOf(selectEntries(entries.get('dom')!, 'noun'))).toBeNull()
    expect(chooseAudio(entries.get('mieć')!, 'mieć')).toBe('Pl-mieć.ogg')
    expect(chooseAudio(entries.get('dom')!, 'dom')).toBe('Pl-dom.ogg')
  })
})
```

`tests/unit/dictionary-tatoeba.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { buildTokenIndex, matchedForms, pickCandidates, readTatoeba, tokenize } from '../../scripts/dictionary/lib/tatoeba'

const F = 'tests/fixtures/dictionary'
const sentences = await readTatoeba({ pol: `${F}/pol_sentences.tsv`, links: `${F}/pol-rus_links.tsv`, rus: `${F}/rus_sentences.tsv` })
const DOM_FORMS = ['dom', 'domach', 'domami', 'domem', 'domom', 'domowi', 'domów', 'domu', 'domy']

describe('readTatoeba', () => {
  it('joins Polish sentences with their first Russian translation', () => {
    expect(sentences).toHaveLength(15)
    expect(sentences.find((s) => s.id === 348760)).toEqual({ id: 348760, pl: 'Mój dom jest duży.', ru: 'Мой дом большой.' })
    expect(sentences.find((s) => s.id === 348626)?.ru).toBeNull()
  })
})

describe('tokens and matching', () => {
  it('tokenizes letters only, lowercased', () => {
    expect(tokenize('W tym domu jest 6 pokoi.')).toEqual(['w', 'tym', 'domu', 'jest', 'pokoi'])
  })

  it('matches forms including agglutinated endings', () => {
    expect(matchedForms(['miałem', 'dom'], new Set(['miał', 'dom']))).toEqual(['miał', 'dom'])
  })
})

describe('pickCandidates', () => {
  const index = buildTokenIndex(sentences)

  it('prefers translated, short sentences that cover new forms', () => {
    expect(pickCandidates(sentences, index, DOM_FORMS, 5).map((s) => s.id)).toEqual([353931, 352381, 348760, 348629, 355239])
  })

  it('falls back to Polish-only sentences', () => {
    const picked = pickCandidates(sentences, index, DOM_FORMS, 30)
    expect(picked).toHaveLength(8)
    expect(picked.slice(-3).every((s) => s.ru === null)).toBe(true)
  })
})
```

`tests/unit/dictionary-commons.test.ts`:
```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { fetchAudioMeta, isFreeLicense, parseCommonsResponse, stripHtml } from '../../scripts/dictionary/lib/commons'

const response = JSON.parse(readFileSync('tests/fixtures/dictionary/commons-response.json', 'utf8'))

describe('commons', () => {
  it('recognizes free licenses', () => {
    expect(isFreeLicense('Public domain')).toBe(true)
    expect(isFreeLicense('CC0')).toBe(true)
    expect(isFreeLicense('CC BY 2.5')).toBe(true)
    expect(isFreeLicense('CC BY-SA 4.0')).toBe(true)
    expect(isFreeLicense('All rights reserved')).toBe(false)
  })

  it('strips HTML and entities from author fields', () => {
    expect(stripHtml('<a href="x">Derbeth</a> &amp; friends')).toBe('Derbeth & friends')
  })

  it('parses free files only and cleans URLs', () => {
    expect(parseCommonsResponse(response)).toEqual([
      { file: 'Pl-dom.ogg', url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Pl-dom.ogg', license: 'Public domain', author: 'tsca' },
      { file: 'Pl-mieć.ogg', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Pl-mie%C4%87.ogg', license: 'CC BY 2.5', author: 'Derbeth & friends' },
    ])
  })

  it('fetches in batches and maps by file name', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(response)))
    const meta = await fetchAudioMeta(['Pl-dom.ogg', 'Pl-mieć.ogg'], fetchImpl as unknown as typeof fetch)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(String(fetchImpl.mock.calls[0]![0])).toContain('titles=File%3APl-dom.ogg%7CFile%3APl-mie%C4%87.ogg')
    expect(meta.get('Pl-mieć.ogg')?.license).toBe('CC BY 2.5')
  })
})
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-wiktionary.test.ts tests/unit/dictionary-tatoeba.test.ts tests/unit/dictionary-commons.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement `scripts/dictionary/lib/wiktionary.ts`**

```ts
import type { Aspect, CardPos } from '../../../shared/dictionary'
import { readLines } from './lines'
import type { WikiForm } from './paradigm'

export interface WikiSense {
  index: string
  glosses: string[]
  examples: string[]
}

export interface WikiEntry {
  word: string
  pos: string
  tags: string[]
  senses: WikiSense[]
  translationsRu: { word: string; senseIndex: string | null }[]
  ipa: string[]
  audioFiles: string[]
  related: string[]
  forms: WikiForm[]
}

export const WIKI_POS: Record<CardPos, string[]> = {
  noun: ['noun', 'name'],
  verb: ['verb'],
  adj: ['adj'],
  adv: ['adv'],
  pron: ['pron'],
  num: ['num', 'adj', 'noun'],
  prep: ['prep'],
  conj: ['conj'],
  part: ['particle', 'intj'],
  interj: ['intj'],
}

type Json = Record<string, unknown>
const asArray = (v: unknown): Json[] => (Array.isArray(v) ? (v as Json[]) : [])
const asStrings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])

export function parseWikiEntry(value: unknown): WikiEntry | null {
  const e = value as Json
  if (!e || e.lang_code !== 'pl' || typeof e.word !== 'string' || typeof e.pos !== 'string') return null
  return {
    word: e.word,
    pos: e.pos,
    tags: asStrings(e.tags),
    senses: asArray(e.senses).map((s) => ({
      index: typeof s.sense_index === 'string' ? s.sense_index : '',
      glosses: asStrings(s.glosses),
      examples: asArray(s.examples).map((x) => x.text).filter((t): t is string => typeof t === 'string'),
    })),
    translationsRu: asArray(e.translations)
      .filter((t) => t.lang_code === 'ru' && typeof t.word === 'string')
      .map((t) => ({ word: t.word as string, senseIndex: typeof t.sense_index === 'string' ? t.sense_index : null })),
    ipa: asArray(e.sounds).map((s) => s.ipa).filter((x): x is string => typeof x === 'string'),
    audioFiles: asArray(e.sounds).map((s) => s.audio).filter((x): x is string => typeof x === 'string'),
    related: asArray(e.related).map((r) => r.word).filter((x): x is string => typeof x === 'string'),
    forms: asArray(e.forms)
      .filter((f) => typeof f.form === 'string')
      .map((f) => ({ form: f.form as string, tags: asStrings(f.tags) })),
  }
}

export async function readWiktionary(path: string, words: Set<string>): Promise<Map<string, WikiEntry[]>> {
  const result = new Map<string, WikiEntry[]>()
  for await (const line of readLines(path)) {
    // Cheap pre-filter before JSON parsing: the word must appear in the line.
    const match = /"word":\s*"([^"]*)"/.exec(line)
    if (!match || !words.has(match[1]!)) continue
    const entry = parseWikiEntry(JSON.parse(line))
    if (!entry || !words.has(entry.word)) continue
    if (!result.has(entry.word)) result.set(entry.word, [])
    result.get(entry.word)!.push(entry)
  }
  return result
}

export function selectEntries(entries: WikiEntry[], pos: CardPos): WikiEntry[] {
  const wanted = WIKI_POS[pos]
  for (const candidate of wanted) {
    const found = entries.filter((e) => e.pos === candidate)
    if (found.length > 0) return found
  }
  return entries
}

export function aspectOf(entries: WikiEntry[]): Aspect | null {
  const tags = new Set(entries.flatMap((e) => e.tags))
  const imperf = tags.has('imperfective')
  const perf = tags.has('perfective')
  if (imperf && perf) return 'biaspectual'
  if (imperf) return 'imperf'
  if (perf) return 'perf'
  return null
}

export function chooseAudio(entries: WikiEntry[], lemma: string): string | null {
  const expected = `Pl-${lemma}.ogg`
  return entries.flatMap((e) => e.audioFiles).find((f) => f === expected) ?? null
}

export function mergeEntries(entries: WikiEntry[]) {
  const prefix = (i: number, index: string) => (entries.length > 1 ? `${i + 1}:${index}` : index)
  const related = [...new Set(entries.flatMap((e) => e.related))]
  return {
    senses: entries.flatMap((e, i) => e.senses.map((s) => ({ ...s, index: prefix(i, s.index) }))),
    translationsRu: entries.flatMap((e, i) =>
      e.translationsRu.map((t) => ({ word: t.word, senseIndex: t.senseIndex === null ? null : prefix(i, t.senseIndex) })),
    ),
    ipa: entries.flatMap((e) => e.ipa)[0] ?? null,
    forms: entries[0]?.forms ?? [],
    related,
  }
}
```

- [ ] **Step 3: Implement `scripts/dictionary/lib/tatoeba.ts`**

```ts
import { readLines } from './lines'
import { AGLT_SUFFIXES } from './rank'

export interface TatoebaSentence {
  id: number
  pl: string
  ru: string | null
}

export async function readTatoeba(paths: { pol: string; links: string; rus: string }): Promise<TatoebaSentence[]> {
  const polish = new Map<number, string>()
  for await (const line of readLines(paths.pol)) {
    const [id, , text] = line.split('\t')
    if (id && text) polish.set(Number(id), text)
  }
  const linkTo = new Map<number, number>()
  for await (const line of readLines(paths.links)) {
    const [plId, ruId] = line.split('\t').map(Number)
    if (plId !== undefined && ruId !== undefined && polish.has(plId) && !linkTo.has(plId)) linkTo.set(plId, ruId)
  }
  const wantedRu = new Set(linkTo.values())
  const russian = new Map<number, string>()
  for await (const line of readLines(paths.rus)) {
    const [id, , text] = line.split('\t')
    if (id && text && wantedRu.has(Number(id))) russian.set(Number(id), text)
  }
  return [...polish.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, pl]) => {
      const ruId = linkTo.get(id)
      return { id, pl, ru: ruId !== undefined ? (russian.get(ruId) ?? null) : null }
    })
}

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\p{L}+/gu) ?? []
}

export function buildTokenIndex(sentences: TatoebaSentence[]): Map<string, number[]> {
  const index = new Map<string, number[]>()
  sentences.forEach((sentence, position) => {
    for (const token of new Set(tokenize(sentence.pl))) {
      if (!index.has(token)) index.set(token, [])
      index.get(token)!.push(position)
    }
  })
  return index
}

export function matchedForms(tokens: string[], forms: Set<string>): string[] {
  const matched: string[] = []
  for (const token of tokens) {
    if (forms.has(token)) {
      matched.push(token)
      continue
    }
    const suffix = AGLT_SUFFIXES.find((s) => token.length > s.length && token.endsWith(s) && forms.has(token.slice(0, -s.length)))
    if (suffix) matched.push(token.slice(0, -suffix.length))
  }
  return matched
}

export function pickCandidates(
  sentences: TatoebaSentence[],
  index: Map<string, number[]>,
  forms: string[],
  limit = 30,
): TatoebaSentence[] {
  const formSet = new Set(forms.map((f) => f.toLowerCase()))
  const positions = new Set<number>()
  for (const form of formSet) for (const p of index.get(form) ?? []) positions.add(p)

  const pool = [...positions]
    .map((p) => ({ sentence: sentences[p]!, tokens: tokenize(sentences[p]!.pl) }))
    .sort(
      (a, b) =>
        Number(a.sentence.ru === null) - Number(b.sentence.ru === null) ||
        a.tokens.length - b.tokens.length ||
        a.sentence.id - b.sentence.id,
    )

  const picked: TatoebaSentence[] = []
  const taken = new Set<number>()
  const covered = new Set<string>()
  for (const item of pool) {
    if (picked.length === limit) break
    if (item.tokens.length > 12) continue
    const fresh = matchedForms(item.tokens, formSet).filter((f) => !covered.has(f))
    if (fresh.length === 0) continue
    fresh.forEach((f) => covered.add(f))
    picked.push(item.sentence)
    taken.add(item.sentence.id)
  }
  for (const item of pool) {
    if (picked.length === limit) break
    if (taken.has(item.sentence.id)) continue
    picked.push(item.sentence)
    taken.add(item.sentence.id)
  }
  return picked
}
```

- [ ] **Step 4: Implement `scripts/dictionary/lib/commons.ts`**

```ts
export interface AudioMeta {
  file: string
  url: string
  license: string
  author: string
}

const FREE_LICENSE = /^(public domain|cc0\b.*|cc by(-sa)? \d(\.\d)?\b.*)$/i

export function isFreeLicense(license: string): boolean {
  return FREE_LICENSE.test(license.trim())
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

type Json = Record<string, unknown>

export function parseCommonsResponse(json: unknown): AudioMeta[] {
  const pages = (((json as Json)?.query as Json)?.pages as Json[] | undefined) ?? []
  const result: AudioMeta[] = []
  for (const page of pages) {
    const info = (page.imageinfo as Json[] | undefined)?.[0]
    const meta = info?.extmetadata as Record<string, { value?: string }> | undefined
    const license = meta?.LicenseShortName?.value
    if (!info || typeof info.url !== 'string' || !license || !isFreeLicense(license)) continue
    result.push({
      file: String(page.title).replace(/^File:/, ''),
      url: info.url.split('?')[0]!,
      license,
      author: stripHtml(meta?.Artist?.value ?? '') || 'unknown',
    })
  }
  return result
}

export async function fetchAudioMeta(files: string[], fetchImpl: typeof fetch = fetch): Promise<Map<string, AudioMeta>> {
  const result = new Map<string, AudioMeta>()
  for (let i = 0; i < files.length; i += 50) {
    const titles = files.slice(i, i + 50).map((f) => `File:${f}`).join('|')
    const params = new URLSearchParams({
      action: 'query',
      titles,
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiextmetadatafilter: 'LicenseShortName|Artist',
      format: 'json',
      formatversion: '2',
    })
    const response = await fetchImpl(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': 'polski-dictionary-build/1.0' },
    })
    for (const meta of parseCommonsResponse(await response.json())) result.set(meta.file, meta)
  }
  return result
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/dictionary-wiktionary.test.ts tests/unit/dictionary-tatoeba.test.ts tests/unit/dictionary-commons.test.ts`
Expected: PASS (13 tests). If the `titles=` assertion fails only because `URLSearchParams` encodes `|` or `:` differently, print the URL and adjust the expected encoded substring; the decoded titles must still be `File:Pl-dom.ogg|File:Pl-mieć.ogg`.

- [ ] **Step 6: Commit**

Run: `pnpm prettier --write scripts/dictionary tests/unit/dictionary-*.test.ts tests/fixtures/dictionary/commons-response.json && pnpm exec eslint scripts/dictionary tests/unit`
Expected: exit 0.

```bash
git add scripts/dictionary/lib/wiktionary.ts scripts/dictionary/lib/tatoeba.ts scripts/dictionary/lib/commons.ts tests/unit/dictionary-wiktionary.test.ts tests/unit/dictionary-tatoeba.test.ts tests/unit/dictionary-commons.test.ts tests/fixtures/dictionary/commons-response.json
git commit -m "feat(dictionary): read Wiktionary, Tatoeba and Commons data

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 5: Draft, build and publish commands

**Files:**
- Create: `scripts/dictionary/lib/draft.ts`, `scripts/dictionary/lib/build.ts`, `scripts/dictionary/lib/publish.ts`, `scripts/dictionary/cli/draft.ts`, `scripts/dictionary/cli/build.ts`, `scripts/dictionary/cli/publish.ts`
- Test: `tests/unit/dictionary-draft.test.ts`, `tests/unit/dictionary-build.test.ts`

**Interfaces:**
- Consumes: `buildParadigm` (Task 3); `RankedLemma` (Task 2); `readPolimorf` (Task 2); `WikiEntry`, `selectEntries`, `mergeEntries`, `aspectOf`, `chooseAudio`, `readWiktionary` (Task 4); `TatoebaSentence`, `pickCandidates`, `buildTokenIndex`, `readTatoeba` (Task 4); `AudioMeta`, `fetchAudioMeta` (Task 4); schemas (Task 1).
- Produces (`draft.ts`):
  - `interface Draft { id; lemma; rank; pos: CardPos; override: boolean; aspect: Aspect | null; grammarLabel: string | null; ipa: string | null; audioFile: string | null; allForms: string[]; tables: FormsTable[]; mismatches: string[]; wiktionary: { found: boolean; senses: WikiSense[]; translationsRu: { word: string; senseIndex: string | null }[]; related: string[] }; candidates: TatoebaSentence[] }`
  - `buildDraft(entry: RankedLemma, rows: MorphRow[], wikiEntries: WikiEntry[], sentences: TatoebaSentence[], tokenIndex: Map<string, number[]>): Draft`
  - `draftFlags(draft): string[]` — any of `нет Wiktionary`, `нет русского перевода`, `мало примеров (N)`, `ручная правка`, `расхождения форм (N)`
  - `renderBatchReport(label: string, drafts: Draft[]): string`
- Produces (`build.ts`):
  - `interface SourceVersions { polimorf: string; wiktionary: string; tatoeba: string }`
  - `referencedTatoebaIds(card: Card): number[]`
  - `buildFormsFile(card: Card, draft: Draft, audio: AudioMeta | null, sentences: Map<number, TatoebaSentence>, versions: SourceVersions): FormsFile` (throws when ids differ or a referenced sentence is unknown)
  - `stableJson(value: unknown): string`
- Produces (`publish.ts`): `glossOf(card): string`; `buildIndex(cards: Card[]): IndexEntry[]` (by rank); `buildPublishedCard(card, forms): PublishedCard`
- Commands:
  - `pnpm dict:draft --ids dom,miec` or `pnpm dict:draft --batch 1` → `data/drafts/<id>.json`, `data/batches/<label>.md` (`pilot` or `batch-01`)
  - `pnpm dict:build` → `content/forms/<id>.json` for every `content/dictionary/<id>.yml`; audio metadata cached in `data/cache/audio.json`
  - `pnpm dict:publish` → `public/dictionary/index.json`, `public/dictionary/cards/<id>.json` (works without `data/sources/`)

- [ ] **Step 1: Write the failing tests**

`tests/unit/dictionary-draft.test.ts`:
```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildDraft, draftFlags, renderBatchReport } from '../../scripts/dictionary/lib/draft'
import { parsePolimorfText } from '../../scripts/dictionary/lib/polimorf'
import { buildTokenIndex, readTatoeba } from '../../scripts/dictionary/lib/tatoeba'
import { readWiktionary } from '../../scripts/dictionary/lib/wiktionary'

const F = 'tests/fixtures/dictionary'
const rows = parsePolimorfText(readFileSync(`${F}/polimorf-sample.tab`, 'utf8'))
const wiki = await readWiktionary(`${F}/wiktionary-sample.jsonl`, new Set(['dom', 'mieć']))
const sentences = await readTatoeba({ pol: `${F}/pol_sentences.tsv`, links: `${F}/pol-rus_links.tsv`, rus: `${F}/rus_sentences.tsv` })
const tokenIndex = buildTokenIndex(sentences)

const domEntry = { rank: 120, id: 'dom', lemma: 'dom', pos: 'noun' as const, estimatedCount: 1000, override: false }
const miecEntry = { rank: 13, id: 'miec', lemma: 'mieć', pos: 'verb' as const, estimatedCount: 90000, override: true }

describe('buildDraft', () => {
  const dom = buildDraft(domEntry, rows, wiki.get('dom') ?? [], sentences, tokenIndex)

  it('combines paradigm, Wiktionary and Tatoeba data', () => {
    expect(dom).toMatchObject({ id: 'dom', lemma: 'dom', rank: 120, pos: 'noun', aspect: null, audioFile: 'Pl-dom.ogg' })
    expect(dom.grammarLabel).toBe('мужской род, неодушевлённый')
    expect(dom.tables[0]?.title).toBe('Склонение')
    expect(dom.wiktionary.found).toBe(true)
    expect(dom.wiktionary.senses).toHaveLength(4)
    expect(dom.candidates.map((c) => c.id).slice(0, 2)).toEqual([353931, 352381])
  })

  it('detects verb aspect from Wiktionary', () => {
    const miec = buildDraft(miecEntry, rows, wiki.get('mieć') ?? [], sentences, tokenIndex)
    expect(miec.aspect).toBe('imperf')
    expect(miec.allForms).toContain('miałem')
  })
})

describe('flags and report', () => {
  const bare = buildDraft({ ...domEntry, id: 'xyz', lemma: 'xyz', override: true }, rows, [], [], new Map())

  it('flags missing data', () => {
    expect(draftFlags(bare)).toEqual(['нет Wiktionary', 'нет русского перевода', 'мало примеров (0)', 'ручная правка'])
  })

  it('renders a markdown report with a row per word and an owner checklist', () => {
    const dom = buildDraft(domEntry, rows, wiki.get('dom') ?? [], sentences, tokenIndex)
    const report = renderBatchReport('pilot', [dom, bare])
    expect(report).toContain('# Батч pilot')
    expect(report).toContain('| 120 | dom | noun | 8 (5) | — |')
    expect(report).toContain('| 120 | xyz | noun | 0 (0) | нет Wiktionary; нет русского перевода; мало примеров (0); ручная правка |')
    expect(report).toContain('- [ ] Список слов проверен')
  })
})
```

`tests/unit/dictionary-build.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { buildFormsFile, referencedTatoebaIds, stableJson } from '../../scripts/dictionary/lib/build'
import type { Draft } from '../../scripts/dictionary/lib/draft'
import { buildIndex, buildPublishedCard, glossOf } from '../../scripts/dictionary/lib/publish'
import { cardSchema, formsFileSchema, type Card } from '../../shared/dictionary'

const card: Card = cardSchema.parse({
  id: 'dom',
  lemma: 'dom',
  rank: 120,
  pos: 'noun',
  pron: { cyr: 'дом' },
  senses: [
    {
      id: 'house',
      ru: 'дом, здание',
      examples: [
        { pl: 'Mój dom jest duży.', ru: 'Мой дом большой.', source: { kind: 'tatoeba', id: 348760 } },
        { pl: 'Spójrz na dom z czerwonym dachem.', ru: 'Посмотри на дом с красной крышей.', source: { kind: 'translated', id: 348626 } },
        { pl: 'To jest nasz dom.', ru: 'Это наш дом.', source: { kind: 'authored' } },
      ],
    },
    { id: 'home', ru: 'дом, родной очаг', examples: [{ pl: 'Wracam do domu.', ru: 'Я возвращаюсь домой.', source: { kind: 'authored' } }] },
  ],
})

const draft = {
  id: 'dom', lemma: 'dom', rank: 120, pos: 'noun', override: false, aspect: null,
  grammarLabel: 'мужской род, неодушевлённый', ipa: 'dɔm', audioFile: 'Pl-dom.ogg',
  allForms: ['dom', 'domu'], tables: [], mismatches: [],
  wiktionary: { found: true, senses: [], translationsRu: [], related: [] }, candidates: [],
} satisfies Draft

const sentences = new Map([
  [348760, { id: 348760, pl: 'Mój dom jest duży.', ru: 'Мой дом большой.' }],
  [348626, { id: 348626, pl: 'Spójrz na dom z czerwonym dachem.', ru: null }],
])
const versions = { polimorf: '0.6.7', wiktionary: 'sha256:aaaa', tatoeba: 'sha256:bbbb' }
const audio = { file: 'Pl-dom.ogg', url: 'https://upload.wikimedia.org/x.ogg', license: 'Public domain', author: 'tsca' }

describe('buildFormsFile', () => {
  it('collects referenced Tatoeba ids', () => {
    expect(referencedTatoebaIds(card)).toEqual([348626, 348760])
  })

  it('builds a valid generated forms file with a Tatoeba snapshot', () => {
    const forms = buildFormsFile(card, draft, audio, sentences, versions)
    expect(formsFileSchema.safeParse(forms).success).toBe(true)
    expect(forms.tatoeba).toEqual({
      '348626': { pl: 'Spójrz na dom z czerwonym dachem.', ru: null },
      '348760': { pl: 'Mój dom jest duży.', ru: 'Мой дом большой.' },
    })
    expect(forms.audio).toEqual(audio)
  })

  it('rejects unknown sentence ids and mismatched drafts', () => {
    expect(() => buildFormsFile(card, draft, null, new Map(), versions)).toThrow(/348626/)
    expect(() => buildFormsFile(card, { ...draft, id: 'mama' }, null, sentences, versions)).toThrow(/dom/)
  })

  it('serializes deterministically', () => {
    const a = stableJson(buildFormsFile(card, draft, audio, sentences, versions))
    const b = stableJson(buildFormsFile(card, draft, audio, sentences, versions))
    expect(a).toBe(b)
    expect(a.endsWith('}\n')).toBe(true)
  })
})

describe('publish', () => {
  it('builds the index sorted by rank with the first sense as gloss', () => {
    const second = { ...card, id: 'mama', lemma: 'mama', rank: 101 }
    expect(glossOf(card)).toBe('дом, здание')
    expect(buildIndex([card, second]).map((e) => e.id)).toEqual(['mama', 'dom'])
  })

  it('pairs card and forms', () => {
    const forms = buildFormsFile(card, draft, audio, sentences, versions)
    expect(buildPublishedCard(card, forms)).toEqual({ card, forms })
  })
})
```

Note: the `8 (5)` cell expects 8 Tatoeba candidates for *dom* in the fixture, 5 of them with a Russian translation (see Task 4).

Run: `pnpm vitest run --project unit tests/unit/dictionary-draft.test.ts tests/unit/dictionary-build.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement `scripts/dictionary/lib/draft.ts`**

```ts
import type { Aspect, CardPos, FormsTable } from '../../../shared/dictionary'
import { buildParadigm } from './paradigm'
import type { MorphRow } from './polimorf'
import type { RankedLemma } from './rank'
import { pickCandidates, type TatoebaSentence } from './tatoeba'
import { aspectOf, chooseAudio, mergeEntries, selectEntries, type WikiEntry, type WikiSense } from './wiktionary'

export interface Draft {
  id: string
  lemma: string
  rank: number
  pos: CardPos
  override: boolean
  aspect: Aspect | null
  grammarLabel: string | null
  ipa: string | null
  audioFile: string | null
  allForms: string[]
  tables: FormsTable[]
  mismatches: string[]
  wiktionary: {
    found: boolean
    senses: WikiSense[]
    translationsRu: { word: string; senseIndex: string | null }[]
    related: string[]
  }
  candidates: TatoebaSentence[]
}

export function buildDraft(
  entry: RankedLemma,
  rows: MorphRow[],
  wikiEntries: WikiEntry[],
  sentences: TatoebaSentence[],
  tokenIndex: Map<string, number[]>,
): Draft {
  const selected = wikiEntries.length > 0 ? selectEntries(wikiEntries, entry.pos) : []
  const merged = mergeEntries(selected)
  const aspect = entry.pos === 'verb' ? aspectOf(selected) : null
  const paradigm = buildParadigm(entry.pos, entry.lemma, rows, merged.forms, aspect)
  return {
    id: entry.id,
    lemma: entry.lemma,
    rank: entry.rank,
    pos: entry.pos,
    override: entry.override,
    aspect,
    grammarLabel: paradigm.grammarLabel,
    ipa: merged.ipa,
    audioFile: chooseAudio(selected, entry.lemma),
    allForms: paradigm.allForms,
    tables: paradigm.tables,
    mismatches: paradigm.mismatches,
    wiktionary: {
      found: selected.length > 0,
      senses: merged.senses,
      translationsRu: merged.translationsRu,
      related: merged.related,
    },
    candidates: pickCandidates(sentences, tokenIndex, paradigm.allForms, 30),
  }
}

export function draftFlags(draft: Draft): string[] {
  const flags: string[] = []
  if (!draft.wiktionary.found) flags.push('нет Wiktionary')
  if (draft.wiktionary.translationsRu.length === 0) flags.push('нет русского перевода')
  if (draft.candidates.length < 5) flags.push(`мало примеров (${draft.candidates.length})`)
  if (draft.override) flags.push('ручная правка')
  if (draft.mismatches.length > 0) flags.push(`расхождения форм (${draft.mismatches.length})`)
  return flags
}

export function renderBatchReport(label: string, drafts: Draft[]): string {
  const lines = [
    `# Батч ${label}`,
    '',
    `Слов: ${drafts.length}.`,
    '',
    '| № | Слово | Часть речи | Примеров (с переводом) | Отметки |',
    '|---|---|---|---|---|',
    ...drafts.map((d) => {
      const withRu = d.candidates.filter((c) => c.ru !== null).length
      const flags = draftFlags(d)
      return `| ${d.rank} | ${d.lemma} | ${d.pos} | ${d.candidates.length} (${withRu}) | ${flags.length > 0 ? flags.join('; ') : '—'} |`
    }),
    '',
  ]
  const mismatched = drafts.filter((d) => d.mismatches.length > 0)
  if (mismatched.length > 0) {
    lines.push('## Расхождения форм', '', ...mismatched.flatMap((d) => d.mismatches.map((m) => `- ${d.lemma}: ${m}`)), '')
  }
  lines.push(
    '## Проверка владельцем',
    '',
    '- [ ] Список слов проверен (мусор, дубликаты и неверные части речи вынесены в `data/overrides.yml`)',
    '- [ ] Примеры «на проверке» и заметки просмотрены, метки `# review` сняты',
    '',
  )
  return lines.join('\n')
}
```

- [ ] **Step 3: Implement `scripts/dictionary/lib/build.ts` and `publish.ts`**

`scripts/dictionary/lib/build.ts`:
```ts
import type { Card, FormsFile } from '../../../shared/dictionary'
import type { AudioMeta } from './commons'
import type { Draft } from './draft'
import type { TatoebaSentence } from './tatoeba'

export interface SourceVersions {
  polimorf: string
  wiktionary: string
  tatoeba: string
}

export function referencedTatoebaIds(card: Card): number[] {
  const ids = new Set<number>()
  for (const sense of card.senses) {
    for (const example of sense.examples) {
      if (example.source.kind !== 'authored') ids.add(example.source.id)
    }
  }
  return [...ids].sort((a, b) => a - b)
}

export function buildFormsFile(
  card: Card,
  draft: Draft,
  audio: AudioMeta | null,
  sentences: Map<number, TatoebaSentence>,
  versions: SourceVersions,
): FormsFile {
  if (draft.id !== card.id) throw new Error(`draft ${draft.id} does not belong to card ${card.id}`)
  const tatoeba: FormsFile['tatoeba'] = {}
  for (const id of referencedTatoebaIds(card)) {
    const sentence = sentences.get(id)
    if (!sentence) throw new Error(`card ${card.id}: unknown Tatoeba sentence ${id}`)
    tatoeba[String(id)] = { pl: sentence.pl, ru: sentence.ru }
  }
  return {
    generated: true,
    sources: versions,
    id: card.id,
    lemma: card.lemma,
    pos: card.pos,
    grammarLabel: draft.grammarLabel,
    ipa: draft.ipa,
    audio,
    allForms: draft.allForms,
    tables: draft.tables,
    tatoeba,
  }
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}
```

`scripts/dictionary/lib/publish.ts`:
```ts
import type { Card, FormsFile, IndexEntry, PublishedCard } from '../../../shared/dictionary'

export function glossOf(card: Card): string {
  return card.senses[0]?.ru ?? ''
}

export function buildIndex(cards: Card[]): IndexEntry[] {
  return [...cards]
    .sort((a, b) => a.rank - b.rank)
    .map((card) => ({ id: card.id, lemma: card.lemma, rank: card.rank, pos: card.pos, gloss: glossOf(card) }))
}

export function buildPublishedCard(card: Card, forms: FormsFile): PublishedCard {
  return { card, forms }
}
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-draft.test.ts tests/unit/dictionary-build.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 4: Implement the three CLIs**

`scripts/dictionary/cli/draft.ts`:
```ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { RankedLemma } from '../lib/rank'
import { stableJson } from '../lib/build'
import { buildDraft, renderBatchReport } from '../lib/draft'
import { DATA, SOURCES } from '../lib/paths'
import { readPolimorf } from '../lib/polimorf'
import { buildTokenIndex, readTatoeba } from '../lib/tatoeba'
import { readWiktionary } from '../lib/wiktionary'

const BATCH_SIZE = 200
const args = process.argv.slice(2)
const argValue = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}

const ranked = JSON.parse(readFileSync(DATA.ranked, 'utf8')) as RankedLemma[]
const batch = argValue('--batch')
const ids = argValue('--ids')

let selected: RankedLemma[]
let label: string
if (ids) {
  const wanted = new Set(ids.split(','))
  selected = ranked.filter((r) => wanted.has(r.id))
  const missing = [...wanted].filter((id) => !selected.some((r) => r.id === id))
  if (missing.length > 0) throw new Error(`ids not in data/ranked.json: ${missing.join(', ')}`)
  label = 'pilot'
} else if (batch) {
  const n = Number(batch)
  selected = ranked.filter((r) => r.rank > (n - 1) * BATCH_SIZE && r.rank <= n * BATCH_SIZE)
  label = `batch-${String(n).padStart(2, '0')}`
} else {
  throw new Error('usage: pnpm dict:draft --batch N | --ids a,b,c')
}

const lemmas = new Set(selected.map((r) => r.lemma))
console.log(`… ${label}: ${selected.length} lemmas`)
const rows = await readPolimorf(SOURCES.polimorf, (row) => lemmas.has(row.lemma))
const wiki = await readWiktionary(SOURCES.wiktionary, lemmas)
const sentences = await readTatoeba({ pol: SOURCES.tatoebaPol, links: SOURCES.tatoebaLinks, rus: SOURCES.tatoebaRus })
const tokenIndex = buildTokenIndex(sentences)

mkdirSync(DATA.drafts, { recursive: true })
mkdirSync(DATA.batches, { recursive: true })
const drafts = selected.map((entry) => {
  const draft = buildDraft(entry, rows, wiki.get(entry.lemma) ?? [], sentences, tokenIndex)
  writeFileSync(join(DATA.drafts, `${entry.id}.json`), stableJson(draft))
  return draft
})
writeFileSync(join(DATA.batches, `${label}.md`), renderBatchReport(label, drafts))
console.log(`✓ ${drafts.length} drafts in ${DATA.drafts}, report ${DATA.batches}/${label}.md`)
```

`scripts/dictionary/cli/build.ts`:
```ts
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { cardSchema } from '../../../shared/dictionary'
import { buildFormsFile, referencedTatoebaIds, stableJson } from '../lib/build'
import { fetchAudioMeta, type AudioMeta } from '../lib/commons'
import type { Draft } from '../lib/draft'
import { CONTENT, DATA, SOURCES } from '../lib/paths'
import { readTatoeba } from '../lib/tatoeba'

const cardFiles = existsSync(CONTENT.cards) ? readdirSync(CONTENT.cards).filter((f) => f.endsWith('.yml')).sort() : []
const cards = cardFiles.map((file) => cardSchema.parse(parseYaml(readFileSync(join(CONTENT.cards, file), 'utf8'))))
const drafts = new Map<string, Draft>()
for (const card of cards) {
  const path = join(DATA.drafts, `${card.id}.json`)
  if (!existsSync(path)) throw new Error(`missing draft for ${card.id}: run pnpm dict:draft first`)
  drafts.set(card.id, JSON.parse(readFileSync(path, 'utf8')) as Draft)
}

const cache: Record<string, AudioMeta | null> = existsSync(DATA.audioCache) ? JSON.parse(readFileSync(DATA.audioCache, 'utf8')) : {}
const wantedAudio = [...drafts.values()].map((d) => d.audioFile).filter((f): f is string => f !== null && !(f in cache))
if (wantedAudio.length > 0) {
  const fetched = await fetchAudioMeta(wantedAudio)
  for (const file of wantedAudio) cache[file] = fetched.get(file) ?? null
  mkdirSync(dirname(DATA.audioCache), { recursive: true })
  writeFileSync(DATA.audioCache, stableJson(cache))
}

const lock = JSON.parse(readFileSync(DATA.lock, 'utf8')) as Record<string, { sha256: string }>
const versions = {
  polimorf: '0.6.7',
  wiktionary: `sha256:${lock.wiktionary!.sha256.slice(0, 12)}`,
  tatoeba: `sha256:${lock.tatoebaPol!.sha256.slice(0, 12)}`,
}

const wantedIds = new Set(cards.flatMap(referencedTatoebaIds))
const sentences = new Map(
  (await readTatoeba({ pol: SOURCES.tatoebaPol, links: SOURCES.tatoebaLinks, rus: SOURCES.tatoebaRus }))
    .filter((s) => wantedIds.has(s.id))
    .map((s) => [s.id, s]),
)

mkdirSync(CONTENT.forms, { recursive: true })
for (const card of cards) {
  const draft = drafts.get(card.id)!
  const audio = draft.audioFile ? (cache[draft.audioFile] ?? null) : null
  writeFileSync(join(CONTENT.forms, `${card.id}.json`), stableJson(buildFormsFile(card, draft, audio, sentences, versions)))
}
console.log(`✓ ${cards.length} forms files in ${CONTENT.forms}`)
```

`scripts/dictionary/cli/publish.ts`:
```ts
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { cardSchema, formsFileSchema } from '../../../shared/dictionary'
import { stableJson } from '../lib/build'
import { CONTENT, PUBLIC_DIR } from '../lib/paths'
import { buildIndex, buildPublishedCard } from '../lib/publish'

const files = existsSync(CONTENT.cards) ? readdirSync(CONTENT.cards).filter((f) => f.endsWith('.yml')).sort() : []
const cards = files.map((file) => cardSchema.parse(parseYaml(readFileSync(join(CONTENT.cards, file), 'utf8'))))

rmSync(PUBLIC_DIR, { recursive: true, force: true })
mkdirSync(join(PUBLIC_DIR, 'cards'), { recursive: true })
for (const card of cards) {
  const forms = formsFileSchema.parse(JSON.parse(readFileSync(join(CONTENT.forms, `${card.id}.json`), 'utf8')))
  writeFileSync(join(PUBLIC_DIR, 'cards', `${card.id}.json`), JSON.stringify(buildPublishedCard(card, forms)))
}
writeFileSync(join(PUBLIC_DIR, 'index.json'), stableJson(buildIndex(cards)))
console.log(`✓ published ${cards.length} cards to ${PUBLIC_DIR}`)
```

Run: `pnpm dict:publish`
Expected: `✓ published 0 cards to public/dictionary` (no authored cards yet); `public/dictionary/index.json` contains `[]`.

- [ ] **Step 5: Commit**

Run: `pnpm prettier --write scripts/dictionary tests/unit/dictionary-*.test.ts && pnpm exec eslint scripts/dictionary tests/unit && pnpm test`
Expected: exit 0.

```bash
git add scripts/dictionary tests/unit/dictionary-draft.test.ts tests/unit/dictionary-build.test.ts
git commit -m "feat(dictionary): add draft, build and publish commands

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Dictionary validation

**Files:**
- Create: `scripts/lib/validate-dictionary.ts`
- Modify: `scripts/lib/load-content.ts` (read `dictionary/*.yml` and `forms/*.json`), `scripts/validate-content.ts` (dictionary errors, warnings), `tests/unit/load-content.test.ts` (new bundle keys)
- Test: `tests/unit/dictionary-validate.test.ts`

**Interfaces:**
- Consumes: `cardSchema`, `formsFileSchema` (Task 1); `AGLT_SUFFIXES` (Task 2); `tokenize` (Task 4); `DataFile`, `ContentBundle` (existing).
- Produces:
  - `ContentBundle` gains `cards: DataFile[]` and `forms: DataFile[]`
  - `interface DictionaryBundle { cards: DataFile[]; forms: DataFile[]; ranked: { id: string; lemma: string; rank: number }[] | null; lessonWordIds: string[] }`
  - `exampleHasForm(text: string, forms: Set<string>): boolean`
  - `validateDictionary(bundle: DictionaryBundle, options: { requireLessonCards: boolean }): { errors: string[]; warnings: string[] }`

Rules and exact messages (paths are relative to `content/`, e.g. `dictionary/dom.yml`):
- schema errors: `<path>: <field path>: <zod message>` (card schema applied with `.strict()`)
- file name: `<path>: file name must be <id>.yml`
- example count: `<path>: <n> examples (expected 5–8)`
- missing forms: `<path>: missing forms/<id>.json (run pnpm dict:build)`
- forms mismatch: `forms/<id>.json: id or lemma does not match dictionary/<id>.yml`
- orphan forms: `forms/<id>.json: no matching dictionary/<id>.yml`
- Tatoeba text: `<path>: example tatoeba #<id> differs from the Tatoeba text; use source kind "translated" for edited translations`
- translated Polish: `<path>: example translated #<id> must keep the original Polish sentence`
- missing form: `<path>: example "<pl>" contains no form of "<lemma>"`
- references: `<path>: aspectPair "<id>" is not a card` / `<path>: family id "<id>" is not a card`
- ranking: `<path>: "<lemma>" is not in data/ranked.json` / `<path>: rank <n> does not match data/ranked.json (<m>)` / `<path>: duplicate rank <n> (also <other path>)`
- lesson words: `words: lesson word "<id>" has no dictionary card` (warning, or error when `requireLessonCards`)

- [ ] **Step 1: Write the failing tests**

`tests/unit/dictionary-validate.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { exampleHasForm, validateDictionary, type DictionaryBundle } from '../../scripts/lib/validate-dictionary'

function examples(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    pl: i === 0 ? 'Mój dom jest duży.' : `To jest dom numer ${i}.`,
    ru: i === 0 ? 'Мой дом большой.' : `Это дом номер ${i}.`,
    source: i === 0 ? { kind: 'tatoeba', id: 348760 } : { kind: 'authored' },
  }))
}

function bundle(): DictionaryBundle {
  return {
    cards: [
      {
        path: 'dictionary/dom.yml',
        data: { id: 'dom', lemma: 'dom', rank: 120, pos: 'noun', pron: { cyr: 'дом' }, senses: [{ id: 'house', ru: 'дом', examples: examples(5) }] },
      },
    ],
    forms: [
      {
        path: 'forms/dom.json',
        data: {
          generated: true,
          sources: { polimorf: '0.6.7', wiktionary: 'w', tatoeba: 't' },
          id: 'dom', lemma: 'dom', pos: 'noun', grammarLabel: null, ipa: null, audio: null,
          allForms: ['dom', 'domu'], tables: [],
          tatoeba: { '348760': { pl: 'Mój dom jest duży.', ru: 'Мой дом большой.' } },
        },
      },
    ],
    ranked: [{ id: 'dom', lemma: 'dom', rank: 120 }],
    lessonWordIds: ['dom'],
  }
}

interface CardData {
  rank: number
  aspectPair?: string
  senses: { examples: { pl: string; ru: string; source: unknown }[] }[]
}
const card = (b: DictionaryBundle) => b.cards[0]!.data as CardData

describe('exampleHasForm', () => {
  it('matches whole words case-insensitively, including agglutinated endings', () => {
    expect(exampleHasForm('Wracam do DOMU.', new Set(['domu']))).toBe(true)
    expect(exampleHasForm('Miałem psa.', new Set(['miał']))).toBe(true)
    expect(exampleHasForm('Domowy obiad.', new Set(['dom']))).toBe(false)
  })
})

describe('validateDictionary', () => {
  it('accepts a valid card', () => {
    expect(validateDictionary(bundle(), { requireLessonCards: false })).toEqual({ errors: [], warnings: [] })
  })

  it('checks example counts and forms', () => {
    const b = bundle()
    card(b).senses[0]!.examples = examples(4)
    card(b).senses[0]!.examples[1]!.pl = 'Zupełnie inne zdanie.'
    const { errors } = validateDictionary(b, { requireLessonCards: false })
    expect(errors).toContain('dictionary/dom.yml: 4 examples (expected 5–8)')
    expect(errors).toContain('dictionary/dom.yml: example "Zupełnie inne zdanie." contains no form of "dom"')
  })

  it('protects human Tatoeba translations', () => {
    const b = bundle()
    card(b).senses[0]!.examples[0]!.ru = 'Мой дом огромный.'
    expect(validateDictionary(b, { requireLessonCards: false }).errors).toContain(
      'dictionary/dom.yml: example tatoeba #348760 differs from the Tatoeba text; use source kind "translated" for edited translations',
    )
  })

  it('reports missing and orphan forms files', () => {
    const noForms = { ...bundle(), forms: [] }
    expect(validateDictionary(noForms, { requireLessonCards: false }).errors).toContain(
      'dictionary/dom.yml: missing forms/dom.json (run pnpm dict:build)',
    )
    const orphan = bundle()
    orphan.forms.push({ path: 'forms/mama.json', data: { ...(orphan.forms[0]!.data as object), id: 'mama', lemma: 'mama' } })
    expect(validateDictionary(orphan, { requireLessonCards: false }).errors).toContain('forms/mama.json: no matching dictionary/mama.yml')
  })

  it('checks ranks, references and file names', () => {
    const b = bundle()
    card(b).rank = 7
    card(b).aspectPair = 'ghost'
    b.cards[0]!.path = 'dictionary/house.yml'
    const { errors } = validateDictionary(b, { requireLessonCards: false })
    expect(errors).toContain('dictionary/house.yml: rank 7 does not match data/ranked.json (120)')
    expect(errors).toContain('dictionary/house.yml: aspectPair "ghost" is not a card')
    expect(errors).toContain('dictionary/house.yml: file name must be dom.yml')
  })

  it('warns about lesson words without cards, or errors when required', () => {
    const b = { ...bundle(), lessonWordIds: ['dom', 'mama'] }
    expect(validateDictionary(b, { requireLessonCards: false }).warnings).toEqual(['words: lesson word "mama" has no dictionary card'])
    expect(validateDictionary(b, { requireLessonCards: true }).errors).toContain('words: lesson word "mama" has no dictionary card')
  })
})
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-validate.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 2: Implement `scripts/lib/validate-dictionary.ts`**

```ts
import { cardSchema, formsFileSchema, type Card, type FormsFile } from '../../shared/dictionary'
import { AGLT_SUFFIXES } from '../dictionary/lib/rank'
import { tokenize } from '../dictionary/lib/tatoeba'
import type { DataFile } from './load-content'

export interface DictionaryBundle {
  cards: DataFile[]
  forms: DataFile[]
  ranked: { id: string; lemma: string; rank: number }[] | null
  lessonWordIds: string[]
}

export function exampleHasForm(text: string, forms: Set<string>): boolean {
  const lower = new Set([...forms].map((f) => f.toLowerCase()))
  return tokenize(text).some(
    (token) =>
      lower.has(token) ||
      AGLT_SUFFIXES.some((s) => token.length > s.length && token.endsWith(s) && lower.has(token.slice(0, -s.length))),
  )
}

export function validateDictionary(
  bundle: DictionaryBundle,
  options: { requireLessonCards: boolean },
): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  const cards = new Map<string, { path: string; card: Card }>()
  for (const file of bundle.cards) {
    const parsed = cardSchema.strict().safeParse(file.data)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${file.path}: ${issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''}${issue.message}`)
      }
      continue
    }
    const card = parsed.data
    if (file.path !== `dictionary/${card.id}.yml`) errors.push(`${file.path}: file name must be ${card.id}.yml`)
    cards.set(card.id, { path: file.path, card })
  }

  const forms = new Map<string, FormsFile>()
  for (const file of bundle.forms) {
    const parsed = formsFileSchema.safeParse(file.data)
    if (!parsed.success) {
      errors.push(`${file.path}: invalid generated forms file`)
      continue
    }
    forms.set(parsed.data.id, parsed.data)
    const owner = cards.get(parsed.data.id)
    if (!owner) errors.push(`${file.path}: no matching dictionary/${parsed.data.id}.yml`)
    else if (owner.card.lemma !== parsed.data.lemma) errors.push(`${file.path}: id or lemma does not match dictionary/${parsed.data.id}.yml`)
  }

  const ranked = new Map((bundle.ranked ?? []).map((r) => [r.id, r]))
  const rankOwner = new Map<number, string>()

  for (const { path, card } of cards.values()) {
    const all = card.senses.flatMap((s) => s.examples)
    if (all.length < 5 || all.length > 8) errors.push(`${path}: ${all.length} examples (expected 5–8)`)

    const formsFile = forms.get(card.id)
    if (!formsFile) {
      errors.push(`${path}: missing forms/${card.id}.json (run pnpm dict:build)`)
    } else {
      const allForms = new Set(formsFile.allForms)
      for (const example of all) {
        if (example.source.kind !== 'authored') {
          const snapshot = formsFile.tatoeba[String(example.source.id)]
          if (example.source.kind === 'tatoeba' && (!snapshot || snapshot.pl !== example.pl || snapshot.ru !== example.ru)) {
            errors.push(`${path}: example tatoeba #${example.source.id} differs from the Tatoeba text; use source kind "translated" for edited translations`)
          }
          if (example.source.kind === 'translated' && (!snapshot || snapshot.pl !== example.pl)) {
            errors.push(`${path}: example translated #${example.source.id} must keep the original Polish sentence`)
          }
        }
        if (!exampleHasForm(example.pl, allForms)) {
          errors.push(`${path}: example "${example.pl}" contains no form of "${card.lemma}"`)
        }
      }
    }

    if (card.aspectPair && !cards.has(card.aspectPair)) errors.push(`${path}: aspectPair "${card.aspectPair}" is not a card`)
    for (const member of card.family) {
      if (member.id && !cards.has(member.id)) errors.push(`${path}: family id "${member.id}" is not a card`)
    }

    if (bundle.ranked) {
      const entry = ranked.get(card.id)
      if (!entry) errors.push(`${path}: "${card.lemma}" is not in data/ranked.json`)
      else if (entry.rank !== card.rank) errors.push(`${path}: rank ${card.rank} does not match data/ranked.json (${entry.rank})`)
    }
    const other = rankOwner.get(card.rank)
    if (other) errors.push(`${path}: duplicate rank ${card.rank} (also ${other})`)
    else rankOwner.set(card.rank, path)
  }

  for (const id of bundle.lessonWordIds) {
    if (!cards.has(id)) {
      const message = `words: lesson word "${id}" has no dictionary card`
      if (options.requireLessonCards) errors.push(message)
      else warnings.push(message)
    }
  }

  return { errors, warnings }
}
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-validate.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 3: Load cards and forms, wire the CLI**

In `scripts/lib/load-content.ts`:
- add `cards: DataFile[]` and `forms: DataFile[]` to `ContentBundle`;
- in `loadContent` add:
```ts
    cards: listFiles(join(root, 'dictionary'), '.yml').map((f) => readData(root, f)),
    forms: listFiles(join(root, 'forms'), '.json').map((f) => readData(root, f)),
```
(`readData` uses the YAML parser, which also parses JSON.)

In `tests/unit/load-content.test.ts` add `cards: [], forms: []` to the expected empty bundle, and in `tests/unit/validate.test.ts` add `cards: [], forms: []` to `validBundle()`.

Replace `scripts/validate-content.ts` with:
```ts
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadContent } from './lib/load-content'
import { validateContent } from './lib/validate'
import { validateDictionary } from './lib/validate-dictionary'

// Becomes true after the final batch, when every lesson word must have a card.
const REQUIRE_LESSON_CARDS = false

const bundle = loadContent(resolve(process.cwd(), 'content'))
const rankedPath = resolve(process.cwd(), 'data/ranked.json')
const ranked = existsSync(rankedPath) ? JSON.parse(readFileSync(rankedPath, 'utf8')) : null
const lessonWordIds = bundle.words.flatMap((file) => ((file.data as { words?: { id: string }[] })?.words ?? []).map((w) => w.id))

const errors = validateContent(bundle)
const dictionary = validateDictionary(
  { cards: bundle.cards, forms: bundle.forms, ranked, lessonWordIds },
  { requireLessonCards: REQUIRE_LESSON_CARDS },
)
errors.push(...dictionary.errors)

if (dictionary.warnings.length > 0) {
  console.warn(`! ${dictionary.warnings.length} dictionary warning(s) (first 5 shown):`)
  for (const warning of dictionary.warnings.slice(0, 5)) console.warn(`  - ${warning}`)
}

if (errors.length > 0) {
  console.error(`✗ ${errors.length} content error(s):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log('✓ content is valid')
```

- [ ] **Step 4: Verify**

Run: `pnpm test && pnpm validate`
Expected: all tests PASS; `pnpm validate` prints the lesson-word warning summary (162 warnings, first 5 shown) and `✓ content is valid`.

- [ ] **Step 5: Commit**

Run: `pnpm prettier --write scripts tests/unit && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add scripts tests/unit
git commit -m "feat(dictionary): validate authored cards and generated forms

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```
