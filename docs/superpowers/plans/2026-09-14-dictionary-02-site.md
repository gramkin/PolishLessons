# Dictionary Plan 2 — Site

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Word card pages at `/slovo/<id>`, a frequency-ordered `/vocabulary`, «Подробнее →» links from word popovers, card documents in search, and a `/sources` attribution page.

**Architecture:** Pages fetch the static JSON written by `pnpm dict:publish` (`/dictionary/index.json`, `/dictionary/cards/<id>.json`) through `useDictionaryIndex()` / `useWordCard()`. Presentation logic lives in `app/utils/dictionary.ts`; six small components render card sections; one `DictionaryTable` renders every forms table.

**Tech Stack:** Nuxt 4, Vue 3, Vitest + @nuxt/test-utils.

**Spec:** `docs/superpowers/specs/2026-09-14-frequency-dictionary-design.md` (§6)

**Prerequisite:** `2026-09-14-dictionary-01-pipeline.md` complete.

## Global Constraints

All constraints in `2026-09-14-dictionary-00-overview.md` → "Global Constraints" apply. Additionally:
- Section anchors on the card page: `znacheniya`, `formy`, `zametki`, `sochetaniya`, `rodstvennye`, `istochniki`.
- Popovers load the dictionary index with `useDictionaryIndex({ lazy: true })` (client only, data key `dictionary:index:client`); pages use the eager variant (data key `dictionary:index`).
- Tables use `<caption>`, `scope="col"`/`scope="row"`, and a focusable `role="region"` wrapper.

---

### Task 7: Card page

**Files:**
- Modify: `shared/dictionary.ts` (add `AGLT_SUFFIXES`), `scripts/dictionary/lib/rank.ts` (import and re-export it), `app/components/PageNav.vue` (optional `label` prop)
- Create: `app/utils/dictionary.ts`, `app/composables/useDictionary.ts`, `app/components/dictionary/Header.vue`, `app/components/dictionary/Senses.vue`, `app/components/dictionary/Table.vue`, `app/components/dictionary/FormsTables.vue`, `app/components/dictionary/Notes.vue`, `app/components/dictionary/Related.vue`, `app/components/dictionary/Sources.vue`, `app/pages/slovo/[id].vue`
- Test: `tests/unit/dictionary-ui.test.ts`, `tests/nuxt/dictionary-card.test.ts`

**Interfaces:**
- Consumes: schemas and types (`shared/dictionary.ts`); `Segment` (`app/utils/pattern.ts`); `NavLesson` (`app/utils/nav.ts`); `SpeakButton`; `PageNav`.
- Produces:
  - `shared/dictionary.ts`: `AGLT_SUFFIXES` (moved from `rank.ts`, which re-exports it)
  - `app/utils/dictionary.ts`: `POS_NAMES`, `ASPECT_NAMES`, `NOTE_KIND_NAMES`; `highlightForms(text: string, forms: string[]): Segment[]`; `rankBand(rank: number, size?: number): { start: number; end: number; label: string }`; `rankNeighbours(index: IndexEntry[], rank: number): { prev: NavLesson | null; next: NavLesson | null }`; `tatoebaUrl(id: number): string`
  - `useDictionaryIndex(options?: { lazy?: boolean }): { entries: ComputedRef<IndexEntry[]>; byId: ComputedRef<Map<string, IndexEntry>>; ready: PromiseLike<unknown> }`
  - `useWordCard(id: string)` — `useAsyncData` of `PublishedCard`, key `dictionary:card:<id>`
  - Components (auto-imported names): `DictionaryHeader({ card, forms })`, `DictionarySenses({ senses, allForms })`, `DictionaryTable({ table })`, `DictionaryFormsTables({ tables })`, `DictionaryNotes({ notes })`, `DictionaryRelated({ card, index: Map<string, IndexEntry> })`, `DictionarySources({ card, forms })`
  - `PageNav` accepts `label?: string` (default `Соседние уроки`)

- [ ] **Step 1: Move `AGLT_SUFFIXES` to shared**

Append to `shared/dictionary.ts`:
```ts
// Agglutinated person/conditional endings attached to past-tense forms (byłem = był + em).
export const AGLT_SUFFIXES = ['byśmy', 'byście', 'śmy', 'ście', 'bym', 'byś', 'em', 'eś', 'm', 'ś'] as const
```
In `scripts/dictionary/lib/rank.ts` replace the local `export const AGLT_SUFFIXES = [...] as const` with:
```ts
import { AGLT_SUFFIXES } from '../../../shared/dictionary'

export { AGLT_SUFFIXES }
```
(merge with the existing `import type { CardPos } ...` line as `import { AGLT_SUFFIXES, type CardPos } from '../../../shared/dictionary'`).

Run: `pnpm vitest run --project unit tests/unit/dictionary-rank.test.ts tests/unit/dictionary-tatoeba.test.ts`
Expected: PASS.

- [ ] **Step 2: Write the failing unit tests**

`tests/unit/dictionary-ui.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { highlightForms, rankBand, rankNeighbours, tatoebaUrl } from '../../app/utils/dictionary'

describe('highlightForms', () => {
  it('bolds whole-word forms case-insensitively', () => {
    expect(highlightForms('Nie mamy czasu.', ['mamy'])).toEqual([
      { text: 'Nie ', hl: false },
      { text: 'mamy', hl: true },
      { text: ' czasu.', hl: false },
    ])
    expect(highlightForms('Mam brata.', ['mam'])).toEqual([
      { text: 'Mam', hl: true },
      { text: ' brata.', hl: false },
    ])
  })

  it('handles agglutinated endings and leaves partial matches alone', () => {
    expect(highlightForms('Miałem psa.', ['miał'])[0]).toEqual({ text: 'Miałem', hl: true })
    expect(highlightForms('Domowy obiad.', ['dom'])).toEqual([{ text: 'Domowy obiad.', hl: false }])
  })
})

describe('rank helpers', () => {
  it('computes bands', () => {
    expect(rankBand(1)).toEqual({ start: 1, end: 200, label: '1–200' })
    expect(rankBand(201)).toEqual({ start: 201, end: 400, label: '201–400' })
    expect(rankBand(400)).toEqual({ start: 201, end: 400, label: '201–400' })
  })

  it('finds neighbours among existing cards', () => {
    const index = [
      { id: 'w', lemma: 'w', rank: 5, pos: 'prep' as const, gloss: 'в' },
      { id: 'miec', lemma: 'mieć', rank: 13, pos: 'verb' as const, gloss: 'иметь' },
      { id: 'dom', lemma: 'dom', rank: 120, pos: 'noun' as const, gloss: 'дом' },
    ]
    expect(rankNeighbours(index, 13)).toEqual({
      prev: { path: '/slovo/w', title: 'w', label: '№5' },
      next: { path: '/slovo/dom', title: 'dom', label: '№120' },
    })
    expect(rankNeighbours(index, 5).prev).toBeNull()
    expect(rankNeighbours(index, 120).next).toBeNull()
  })

  it('links Tatoeba sentences', () => {
    expect(tatoebaUrl(348760)).toBe('https://tatoeba.org/ru/sentences/show/348760')
  })
})
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-ui.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/utils/dictionary.ts`**

```ts
import { AGLT_SUFFIXES, type CardPos, type IndexEntry, type NoteKind } from '../../shared/dictionary'
import type { NavLesson } from './nav'
import type { Segment } from './pattern'

export const POS_NAMES: Record<CardPos, string> = {
  noun: 'существительное',
  verb: 'глагол',
  adj: 'прилагательное',
  adv: 'наречие',
  pron: 'местоимение',
  num: 'числительное',
  prep: 'предлог',
  conj: 'союз',
  part: 'частица',
  interj: 'междометие',
}

export const ASPECT_NAMES = {
  imperf: 'несовершенный вид',
  perf: 'совершенный вид',
  biaspectual: 'двувидовой глагол',
} as const

export const NOTE_KIND_NAMES: Record<NoteKind, string> = {
  government: 'Управление',
  'false-friend': 'Ложный друг',
  stress: 'Ударение',
  register: 'Стиль',
  pronunciation: 'Произношение',
  usage: 'Употребление',
}

function isForm(word: string, forms: Set<string>): boolean {
  const lower = word.toLowerCase()
  return (
    forms.has(lower) ||
    AGLT_SUFFIXES.some((s) => lower.length > s.length && lower.endsWith(s) && forms.has(lower.slice(0, -s.length)))
  )
}

export function highlightForms(text: string, forms: string[]): Segment[] {
  const set = new Set(forms.map((f) => f.toLowerCase()))
  const segments: Segment[] = []
  for (const part of text.split(/(\p{L}+)/u)) {
    if (!part) continue
    const hl = /^\p{L}+$/u.test(part) && isForm(part, set)
    const last = segments[segments.length - 1]
    if (last && !last.hl && !hl) last.text += part
    else segments.push({ text: part, hl })
  }
  return segments
}

export function rankBand(rank: number, size = 200): { start: number; end: number; label: string } {
  const start = Math.floor((rank - 1) / size) * size + 1
  const end = start + size - 1
  return { start, end, label: `${start}–${end}` }
}

function toNav(entry: IndexEntry | undefined): NavLesson | null {
  return entry ? { path: `/slovo/${entry.id}`, title: entry.lemma, label: `№${entry.rank}` } : null
}

export function rankNeighbours(index: IndexEntry[], rank: number): { prev: NavLesson | null; next: NavLesson | null } {
  const sorted = [...index].sort((a, b) => a.rank - b.rank)
  return {
    prev: toNav(sorted.filter((e) => e.rank < rank).pop()),
    next: toNav(sorted.find((e) => e.rank > rank)),
  }
}

export function tatoebaUrl(id: number): string {
  return `https://tatoeba.org/ru/sentences/show/${id}`
}
```

Run: `pnpm vitest run --project unit tests/unit/dictionary-ui.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 4: Implement `app/composables/useDictionary.ts` and the `PageNav` label**

`app/composables/useDictionary.ts`:
```ts
import type { IndexEntry, PublishedCard } from '#shared/dictionary'

function dictionaryUrl(path: string): string {
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  return `${base}/dictionary/${path}`
}

export function useDictionaryIndex(options: { lazy?: boolean } = {}) {
  const url = dictionaryUrl('index.json')
  const result = options.lazy
    ? useLazyAsyncData('dictionary:index:client', () => $fetch<IndexEntry[]>(url), { server: false, default: () => [] })
    : useAsyncData('dictionary:index', () => $fetch<IndexEntry[]>(url), { default: () => [] })
  const entries = computed<IndexEntry[]>(() => result.data.value ?? [])
  const byId = computed(() => new Map(entries.value.map((e) => [e.id, e])))
  return { entries, byId, ready: result }
}

export function useWordCard(id: string) {
  return useAsyncData(`dictionary:card:${id}`, () => $fetch<PublishedCard>(dictionaryUrl(`cards/${id}.json`)))
}
```

In `app/components/PageNav.vue` change the props line to:
```ts
const props = withDefaults(defineProps<{ prev: NavLesson | null; next: NavLesson | null; label?: string }>(), {
  label: 'Соседние уроки',
})
```
and the root element to `<nav class="page-nav" :aria-label="props.label">`.

- [ ] **Step 5: Write the failing component tests**

`tests/nuxt/dictionary-card.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Header from '~/components/dictionary/Header.vue'
import Senses from '~/components/dictionary/Senses.vue'
import FormsTables from '~/components/dictionary/FormsTables.vue'
import Notes from '~/components/dictionary/Notes.vue'
import Related from '~/components/dictionary/Related.vue'
import Sources from '~/components/dictionary/Sources.vue'
import { cardSchema, formsFileSchema, type IndexEntry } from '../../shared/dictionary'

const card = cardSchema.parse({
  id: 'robic',
  lemma: 'robić',
  rank: 40,
  pos: 'verb',
  aspect: 'imperf',
  aspectPair: 'zrobic',
  pron: { cyr: 'ро́биць' },
  senses: [
    {
      id: 'do',
      ru: 'делать',
      note: 'самое общее значение',
      examples: [
        { pl: 'Co robisz?', ru: 'Что ты делаешь?', source: { kind: 'tatoeba', id: 1 } },
        { pl: 'Robię obiad.', ru: 'Я готовлю обед.', source: { kind: 'authored' } },
      ],
    },
  ],
  notes: [{ kind: 'false-friend', text: 'Не путать с «робить».' }],
  collocations: [{ pl: 'robić zakupy', ru: 'делать покупки' }],
  family: [
    { pl: 'zrobić', ru: 'сделать', relation: 'aspect', id: 'zrobic' },
    { pl: 'robota', ru: 'работа', relation: 'derived', id: null },
  ],
})

const forms = formsFileSchema.parse({
  generated: true,
  sources: { polimorf: '0.6.7', wiktionary: 'w', tatoeba: 't' },
  id: 'robic',
  lemma: 'robić',
  pos: 'verb',
  grammarLabel: null,
  ipa: 'ˈrɔbʲit͡ɕ',
  audio: { file: 'Pl-robić.ogg', url: 'https://upload.wikimedia.org/r.ogg', license: 'CC BY 2.5', author: 'Derbeth' },
  allForms: ['robić', 'robisz', 'robię'],
  tables: [
    { title: 'Настоящее время', columns: ['Ед. ч.', 'Мн. ч.'], rows: [{ label: '1-е лицо', cells: [['robię'], ['robimy']] }], extra: false },
    { title: 'Безличная форма', columns: ['Форма'], rows: [{ label: 'Прошедшее время', cells: [['robiono']] }], extra: true },
  ],
  tatoeba: { '1': { pl: 'Co robisz?', ru: 'Что ты делаешь?' } },
})

const index = new Map<string, IndexEntry>([['zrobic', { id: 'zrobic', lemma: 'zrobić', rank: 60, pos: 'verb', gloss: 'сделать' }]])

describe('dictionary card components', () => {
  it('renders the header with pronunciation, rank and audio', async () => {
    const wrapper = await mountSuspended(Header, { props: { card, forms } })
    expect(wrapper.find('h1').text()).toBe('robić')
    expect(wrapper.find('h1').attributes('lang')).toBe('pl')
    expect(wrapper.text()).toContain('глагол · несовершенный вид · №40 по частоте')
    expect(wrapper.text()).toContain('[ˈrɔbʲit͡ɕ]')
    expect(wrapper.find('audio').attributes('src')).toBe('https://upload.wikimedia.org/r.ogg')
  })

  it('renders senses with highlighted forms and source badges', async () => {
    const wrapper = await mountSuspended(Senses, { props: { senses: card.senses, allForms: forms.allForms } })
    const examples = wrapper.findAll('li.example')
    expect(examples[0]!.find('strong').text()).toBe('robisz')
    expect(examples[0]!.find('a.badge').attributes('href')).toBe('https://tatoeba.org/ru/sentences/show/1')
    expect(examples[1]!.find('.badge').text()).toBe('на проверке')
    expect(wrapper.find('.sense-note').text()).toBe('самое общее значение')
  })

  it('puts extra tables into «Все формы»', async () => {
    const wrapper = await mountSuspended(FormsTables, { props: { tables: forms.tables } })
    expect(wrapper.find('section#formy > .table-wrap caption').text()).toBe('Настоящее время')
    expect(wrapper.find('details summary').text()).toBe('Все формы')
    expect(wrapper.find('details caption').text()).toBe('Безличная форма')
    expect(wrapper.find('tbody th[scope="row"]').text()).toBe('1-е лицо')
  })

  it('renders notes, collocations, related words and sources', async () => {
    const notes = await mountSuspended(Notes, { props: { notes: card.notes } })
    expect(notes.find('aside.note.is-false-friend').text()).toContain('Ложный друг.')

    const related = await mountSuspended(Related, { props: { card, index } })
    expect(related.find('a[href="/slovo/zrobic"]').text()).toBe('zrobić')
    expect(related.text()).toContain('robota — работа')
    expect(related.text()).toContain('robić zakupy — делать покупки')

    const sources = await mountSuspended(Sources, { props: { card, forms } })
    expect(sources.text()).toContain('Derbeth')
    expect(sources.text()).toContain('CC BY 2.5')
    expect(sources.find('a[href="/sources"]').exists()).toBe(true)
  })
})
```

Run: `pnpm vitest run --project nuxt tests/nuxt/dictionary-card.test.ts`
Expected: FAIL — components not found.

- [ ] **Step 6: Implement the components**

`app/components/dictionary/Header.vue`:
```vue
<script setup lang="ts">
import type { Card, FormsFile } from '#shared/dictionary'
import { ASPECT_NAMES, POS_NAMES } from '~/utils/dictionary'

const props = defineProps<{ card: Card; forms: FormsFile }>()

const meta = computed(() =>
  [
    POS_NAMES[props.card.pos],
    props.card.aspect ? ASPECT_NAMES[props.card.aspect] : null,
    props.forms.grammarLabel,
    `№${props.card.rank} по частоте`,
  ]
    .filter(Boolean)
    .join(' · '),
)

const sections = computed(() =>
  [
    { id: 'znacheniya', label: 'Значения', show: true },
    { id: 'formy', label: 'Формы', show: props.forms.tables.length > 0 },
    { id: 'zametki', label: 'Заметки', show: props.card.notes.length > 0 },
    { id: 'sochetaniya', label: 'Сочетания', show: props.card.collocations.length > 0 },
    { id: 'rodstvennye', label: 'Родственные', show: props.card.family.length > 0 || !!props.card.aspectPair },
    { id: 'istochniki', label: 'Источники', show: true },
  ].filter((s) => s.show),
)
</script>

<template>
  <header class="word-header">
    <div class="title-row">
      <h1 lang="pl">{{ card.lemma }}</h1>
      <SpeakButton :text="card.lemma" />
    </div>
    <p class="meta">{{ meta }}</p>
    <p class="pron">
      <span v-if="forms.ipa" class="ipa">[{{ forms.ipa }}]</span>
      <span class="cyr">{{ card.pron.cyr }}</span>
    </p>
    <audio
      v-if="forms.audio"
      class="recording"
      controls
      preload="none"
      :src="forms.audio.url"
      :aria-label="`Запись произношения: ${card.lemma}`"
    />
    <nav class="toc" aria-label="Разделы карточки">
      <a v-for="s in sections" :key="s.id" :href="`#${s.id}`">{{ s.label }}</a>
    </nav>
  </header>
</template>

<style scoped>
.title-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
h1 {
  color: var(--accent-pl);
  margin-bottom: 0.25rem;
}
.meta,
.pron {
  margin: 0.25rem 0;
  color: var(--muted);
}
.ipa {
  margin-right: 0.5rem;
}
.cyr {
  font-style: italic;
}
.recording {
  display: block;
  margin: 0.5rem 0;
  max-width: 100%;
}
.toc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1rem 0 1.5rem;
  font-size: 0.9rem;
}
</style>
```

`app/components/dictionary/Senses.vue`:
```vue
<script setup lang="ts">
import type { Sense } from '#shared/dictionary'
import { highlightForms, tatoebaUrl } from '~/utils/dictionary'

defineProps<{ senses: Sense[]; allForms: string[] }>()
</script>

<template>
  <section id="znacheniya" aria-labelledby="znacheniya-title">
    <h2 id="znacheniya-title">Значения</h2>
    <ol class="senses">
      <li v-for="sense in senses" :key="sense.id" class="sense">
        <p class="sense-ru">{{ sense.ru }}</p>
        <p v-if="sense.note" class="sense-note">{{ sense.note }}</p>
        <ul class="examples">
          <li v-for="(example, i) in sense.examples" :key="i" class="example">
            <span lang="pl" class="example-pl">
              <template v-for="(segment, k) in highlightForms(example.pl, allForms)" :key="k">
                <strong v-if="segment.hl">{{ segment.text }}</strong>
                <template v-else>{{ segment.text }}</template>
              </template>
            </span>
            <span class="example-ru"> — {{ example.ru }}</span>
            <a
              v-if="example.source.kind === 'tatoeba'"
              class="badge is-reviewed"
              :href="tatoebaUrl(example.source.id)"
              target="_blank"
              rel="noopener"
              title="Предложение и перевод из Tatoeba"
              >✓ Tatoeba</a
            >
            <span v-else class="badge is-pending">на проверке</span>
          </li>
        </ul>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.senses {
  padding-left: 1.25rem;
}
.sense-ru {
  font-weight: 600;
  margin: 0.75rem 0 0.25rem;
}
.sense-note {
  color: var(--muted);
  margin: 0 0 0.25rem;
}
.examples {
  list-style: none;
  padding: 0;
  margin: 0;
}
.example {
  margin: 0.25rem 0;
}
.example-pl {
  color: var(--accent-pl);
}
.example-ru {
  color: var(--fg);
}
.badge {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  padding: 0 0.4rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  white-space: nowrap;
}
.is-reviewed {
  color: var(--cognate);
}
.is-pending {
  color: var(--muted);
}
</style>
```

`app/components/dictionary/Table.vue`:
```vue
<script setup lang="ts">
import type { FormsTable } from '#shared/dictionary'

defineProps<{ table: FormsTable }>()
</script>

<template>
  <div class="table-wrap" tabindex="0" role="region" :aria-label="table.title">
    <table>
      <caption>{{ table.title }}</caption>
      <thead>
        <tr>
          <td />
          <th v-for="column in table.columns" :key="column" scope="col">{{ column }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.rows" :key="row.label">
          <th scope="row">{{ row.label }}</th>
          <td v-for="(cell, i) in row.cells" :key="i" :lang="cell.length > 0 ? 'pl' : undefined">
            {{ cell.length > 0 ? cell.join(', ') : '—' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
caption {
  text-align: left;
  font-weight: 600;
  padding-bottom: 0.25rem;
}
td[lang='pl'] {
  color: var(--accent-pl);
}
tbody th {
  font-weight: 400;
  color: var(--muted);
  text-align: left;
}
</style>
```

`app/components/dictionary/FormsTables.vue`:
```vue
<script setup lang="ts">
import type { FormsTable } from '#shared/dictionary'

const props = defineProps<{ tables: FormsTable[] }>()
const main = computed(() => props.tables.filter((t) => !t.extra))
const extra = computed(() => props.tables.filter((t) => t.extra))
</script>

<template>
  <section v-if="tables.length > 0" id="formy" aria-labelledby="formy-title">
    <h2 id="formy-title">Формы</h2>
    <DictionaryTable v-for="table in main" :key="table.title" :table="table" />
    <details v-if="extra.length > 0" class="all-forms">
      <summary>Все формы</summary>
      <DictionaryTable v-for="table in extra" :key="table.title" :table="table" />
    </details>
  </section>
</template>

<style scoped>
.all-forms {
  margin: 1rem 0;
}
summary {
  cursor: pointer;
  font-weight: 600;
}
</style>
```

`app/components/dictionary/Notes.vue`:
```vue
<script setup lang="ts">
import type { Card } from '#shared/dictionary'
import { NOTE_KIND_NAMES } from '~/utils/dictionary'

defineProps<{ notes: Card['notes'] }>()
</script>

<template>
  <section v-if="notes.length > 0" id="zametki" aria-labelledby="zametki-title">
    <h2 id="zametki-title">Заметки для русскоговорящих</h2>
    <aside v-for="(note, i) in notes" :key="i" class="note callout" :class="`is-${note.kind}`" role="note">
      <strong>{{ NOTE_KIND_NAMES[note.kind] }}.</strong> {{ note.text }}
    </aside>
  </section>
</template>

<style scoped>
.is-false-friend {
  border-left-color: var(--false-friend);
}
.is-false-friend strong {
  color: var(--false-friend);
}
</style>
```

`app/components/dictionary/Related.vue`:
```vue
<script setup lang="ts">
import type { Card, IndexEntry } from '#shared/dictionary'

const props = defineProps<{ card: Card; index: Map<string, IndexEntry> }>()
const aspectPair = computed(() => (props.card.aspectPair ? (props.index.get(props.card.aspectPair) ?? null) : null))
const RELATION_NAMES = { derived: 'производное', aspect: 'видовая пара', root: 'однокоренное', antonym: 'антоним' } as const
</script>

<template>
  <section v-if="card.collocations.length > 0" id="sochetaniya" aria-labelledby="sochetaniya-title">
    <h2 id="sochetaniya-title">Сочетания</h2>
    <ul>
      <li v-for="item in card.collocations" :key="item.pl">
        <span lang="pl">{{ item.pl }}</span> — {{ item.ru }}
      </li>
    </ul>
  </section>
  <section v-if="card.family.length > 0 || aspectPair" id="rodstvennye" aria-labelledby="rodstvennye-title">
    <h2 id="rodstvennye-title">Родственные слова</h2>
    <p v-if="aspectPair">
      Видовая пара: <NuxtLink :to="`/slovo/${aspectPair.id}`" lang="pl">{{ aspectPair.lemma }}</NuxtLink>
    </p>
    <ul>
      <li v-for="member in card.family" :key="member.pl">
        <NuxtLink v-if="member.id && index.has(member.id)" :to="`/slovo/${member.id}`" lang="pl">{{ member.pl }}</NuxtLink>
        <span v-else lang="pl">{{ member.pl }}</span>
        — {{ member.ru }} <span class="relation">({{ RELATION_NAMES[member.relation] }})</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
[lang='pl'] {
  color: var(--accent-pl);
}
.relation {
  color: var(--muted);
  font-size: 0.875em;
}
</style>
```

`app/components/dictionary/Sources.vue`:
```vue
<script setup lang="ts">
import type { Card, FormsFile } from '#shared/dictionary'
import { tatoebaUrl } from '~/utils/dictionary'

const props = defineProps<{ card: Card; forms: FormsFile }>()
const tatoebaIds = computed(() => Object.keys(props.forms.tatoeba).map(Number))
</script>

<template>
  <section id="istochniki" aria-labelledby="istochniki-title" class="word-sources">
    <h2 id="istochniki-title">Источники</h2>
    <ul>
      <li>
        Значения и формы: <a :href="`https://pl.wiktionary.org/wiki/${encodeURIComponent(card.lemma)}`">Wiktionary</a> (CC BY-SA),
        <a href="http://zil.ipipan.waw.pl/PoliMorf">PoliMorf</a> (BSD)
      </li>
      <li v-if="tatoebaIds.length > 0">
        Примеры Tatoeba (CC BY 2.0 FR):
        <template v-for="(id, i) in tatoebaIds" :key="id"
          ><a :href="tatoebaUrl(id)">#{{ id }}</a><template v-if="i < tatoebaIds.length - 1">, </template></template
        >
      </li>
      <li v-if="forms.audio">Запись: {{ forms.audio.author }}, {{ forms.audio.license }} (Wikimedia Commons)</li>
    </ul>
    <p><NuxtLink to="/sources">Все источники и лицензии</NuxtLink></p>
  </section>
</template>

<style scoped>
.word-sources {
  font-size: 0.875rem;
  color: var(--muted);
}
</style>
```

Run: `pnpm vitest run --project nuxt tests/nuxt/dictionary-card.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Create the page `app/pages/slovo/[id].vue`**

```vue
<script setup lang="ts">
import { rankNeighbours } from '~/utils/dictionary'

const route = useRoute()
const id = String(route.params.id)
const { data } = await useWordCard(id)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Слово не найдено', fatal: true })
}

const { entries, byId, ready } = useDictionaryIndex()
await ready
const neighbours = computed(() => (data.value ? rankNeighbours(entries.value, data.value.card.rank) : { prev: null, next: null }))

useSeoMeta({
  title: () => (data.value ? `${data.value.card.lemma} — ${data.value.card.senses[0]?.ru ?? ''}` : ''),
  description: () =>
    data.value ? `${data.value.card.lemma}: ${data.value.card.senses.map((s) => s.ru).join('; ')}. Формы, примеры и заметки.` : '',
})
</script>

<template>
  <article v-if="data" class="content word-card">
    <DictionaryHeader :card="data.card" :forms="data.forms" />
    <DictionarySenses :senses="data.card.senses" :all-forms="data.forms.allForms" />
    <DictionaryFormsTables :tables="data.forms.tables" />
    <DictionaryNotes :notes="data.card.notes" />
    <DictionaryRelated :card="data.card" :index="byId" />
    <DictionarySources :card="data.card" :forms="data.forms" />
    <PageNav :prev="neighbours.prev" :next="neighbours.next" label="Соседние слова" />
  </article>
</template>
```

- [ ] **Step 8: Verify and commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add shared/dictionary.ts scripts/dictionary/lib/rank.ts app tests/unit/dictionary-ui.test.ts tests/nuxt/dictionary-card.test.ts
git commit -m "feat(dictionary): add word card page and components

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Vocabulary list, popover link, search and sources page

**Files:**
- Modify: `app/utils/vocabulary.ts`, `app/pages/vocabulary.vue`, `app/components/content/PlWord.vue`, `app/components/AppSidebar.vue`, `scripts/lib/search-docs.ts`, `tests/unit/vocabulary.test.ts`, `tests/nuxt/vocabulary-page.test.ts`, `tests/nuxt/pl-word.test.ts`, `tests/unit/search-docs.test.ts`
- Create: `app/pages/sources.vue`

**Interfaces:**
- Consumes: `useDictionaryIndex`, `POS_NAMES`, `rankBand` (Task 7); `useWords` (existing); `cardSchema`, `formsFileSchema` (pipeline Task 1); `ContentBundle.cards/forms` (pipeline Task 6).
- Produces (`app/utils/vocabulary.ts`, keeping `listTopics` and `listChapters`):
  - `interface VocabularyEntry { id: string; lemma: string; gloss: string; pos: CardPos | null; rank: number | null; inLessons: boolean; hasCard: boolean }`
  - `interface VocabularyFilter { query: string; pos: CardPos | null; band: number | null; inLessonsOnly: boolean }` (`band` = band start rank)
  - `mergeVocabulary(index: IndexEntry[], words: Word[]): VocabularyEntry[]` — cards by rank, then lesson words without a card sorted with `localeCompare(…, 'pl')`
  - `filterVocabulary(entries, filter): VocabularyEntry[]`
  - `bandStarts(entries): number[]`
- `/vocabulary`: table columns `№ | Польский | Перевод | Часть речи`; rows `tr#<id>`; card rows link to `/slovo/<id>`
- `PlWord` card shows `a.card-more` «Подробнее →» when the lazy index has the id
- Search: one `word` document per card with url `/slovo/<id>`, text including all forms; lesson-word documents are skipped for ids that have a card
- `/sources` page; sidebar link «Источники и лицензии»

- [ ] **Step 1: Write the failing vocabulary unit tests**

Replace `tests/unit/vocabulary.test.ts` with:
```ts
import { describe, expect, it } from 'vitest'
import type { IndexEntry } from '../../shared/dictionary'
import type { Word } from '../../shared/schemas'
import { bandStarts, filterVocabulary, listChapters, listTopics, mergeVocabulary } from '../../app/utils/vocabulary'

const words: Word[] = [
  { id: 'rzeka', pl: 'rzeka', ru: 'река', pos: 'noun', pron: 'жэ́ка', topic: 'природа', chapter: 2 },
  { id: 'dom', pl: 'dom', ru: 'дом', pos: 'noun', pron: 'дом', topic: 'дом', chapter: 1 },
  { id: 'dzien-dobry', pl: 'dzień dobry', ru: 'добрый день', pos: 'phrase', pron: 'дзьень до́бры', topic: 'приветствия', chapter: 3 },
]

const index: IndexEntry[] = [
  { id: 'dom', lemma: 'dom', rank: 120, pos: 'noun', gloss: 'дом, здание' },
  { id: 'miec', lemma: 'mieć', rank: 13, pos: 'verb', gloss: 'иметь' },
  { id: 'kolega', lemma: 'kolega', rank: 250, pos: 'noun', gloss: 'коллега, приятель' },
]

const all = { query: '', pos: null, band: null, inLessonsOnly: false }

describe('mergeVocabulary', () => {
  const merged = mergeVocabulary(index, words)

  it('lists cards by rank, then lesson words without cards', () => {
    expect(merged.map((e) => e.id)).toEqual(['miec', 'dom', 'kolega', 'dzien-dobry', 'rzeka'])
    expect(merged.find((e) => e.id === 'dom')).toEqual({ id: 'dom', lemma: 'dom', gloss: 'дом, здание', pos: 'noun', rank: 120, inLessons: true, hasCard: true })
    expect(merged.find((e) => e.id === 'dzien-dobry')).toMatchObject({ pos: null, rank: null, inLessons: true, hasCard: false })
  })

  it('filters by query, part of speech, band and lessons', () => {
    expect(filterVocabulary(merged, { ...all, query: 'miec' }).map((e) => e.id)).toEqual(['miec'])
    expect(filterVocabulary(merged, { ...all, query: 'ПРИЯТ' }).map((e) => e.id)).toEqual(['kolega'])
    expect(filterVocabulary(merged, { ...all, pos: 'noun' }).map((e) => e.id)).toEqual(['dom', 'kolega', 'rzeka'])
    expect(filterVocabulary(merged, { ...all, band: 1 }).map((e) => e.id)).toEqual(['miec', 'dom'])
    expect(filterVocabulary(merged, { ...all, inLessonsOnly: true }).map((e) => e.id)).toEqual(['dom', 'dzien-dobry', 'rzeka'])
  })

  it('lists band starts present in the data', () => {
    expect(bandStarts(merged)).toEqual([1, 201])
  })
})

describe('lesson word helpers', () => {
  it('still lists topics and chapters', () => {
    expect(listTopics(words)).toEqual(['дом', 'приветствия', 'природа'])
    expect(listChapters(words)).toEqual([1, 2, 3])
  })
})
```

Run: `pnpm vitest run --project unit tests/unit/vocabulary.test.ts`
Expected: FAIL — `mergeVocabulary` is not exported.

- [ ] **Step 2: Rewrite `app/utils/vocabulary.ts`**

```ts
import type { CardPos, IndexEntry } from '../../shared/dictionary'
import type { Word } from '../../shared/schemas'
import { rankBand } from './dictionary'
import { normalizeLoose } from './normalize'

export interface VocabularyEntry {
  id: string
  lemma: string
  gloss: string
  pos: CardPos | null
  rank: number | null
  inLessons: boolean
  hasCard: boolean
}

export interface VocabularyFilter {
  query: string
  pos: CardPos | null
  band: number | null
  inLessonsOnly: boolean
}

const LESSON_POS: Partial<Record<Word['pos'], CardPos>> = {
  noun: 'noun',
  verb: 'verb',
  adj: 'adj',
  adv: 'adv',
  pron: 'pron',
  num: 'num',
  prep: 'prep',
  conj: 'conj',
  part: 'part',
}

export function mergeVocabulary(index: IndexEntry[], words: Word[]): VocabularyEntry[] {
  const lessonIds = new Set(words.map((w) => w.id))
  const cardIds = new Set(index.map((e) => e.id))
  const cards = [...index]
    .sort((a, b) => a.rank - b.rank)
    .map((e) => ({ id: e.id, lemma: e.lemma, gloss: e.gloss, pos: e.pos, rank: e.rank, inLessons: lessonIds.has(e.id), hasCard: true }))
  const lessonOnly = words
    .filter((w) => !cardIds.has(w.id))
    .sort((a, b) => a.pl.localeCompare(b.pl, 'pl'))
    .map((w) => ({ id: w.id, lemma: w.pl, gloss: w.ru, pos: LESSON_POS[w.pos] ?? null, rank: null, inLessons: true, hasCard: false }))
  return [...cards, ...lessonOnly]
}

export function filterVocabulary(entries: VocabularyEntry[], filter: VocabularyFilter): VocabularyEntry[] {
  const query = normalizeLoose(filter.query)
  return entries.filter(
    (e) =>
      (!query || normalizeLoose(e.lemma).includes(query) || normalizeLoose(e.gloss).includes(query)) &&
      (filter.pos === null || e.pos === filter.pos) &&
      (filter.band === null || (e.rank !== null && rankBand(e.rank).start === filter.band)) &&
      (!filter.inLessonsOnly || e.inLessons),
  )
}

export function bandStarts(entries: VocabularyEntry[]): number[] {
  return [...new Set(entries.filter((e) => e.rank !== null).map((e) => rankBand(e.rank!).start))].sort((a, b) => a - b)
}

export function listTopics(words: Word[]): string[] {
  return [...new Set(words.map((w) => w.topic))].sort((a, b) => a.localeCompare(b, 'ru'))
}

export function listChapters(words: Word[]): number[] {
  return [...new Set(words.map((w) => w.chapter))].sort((a, b) => a - b)
}
```

Run: `pnpm vitest run --project unit tests/unit/vocabulary.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 3: Rewrite the vocabulary page and its test**

`app/pages/vocabulary.vue`:
```vue
<script setup lang="ts">
import { CARD_POS, type CardPos } from '#shared/dictionary'
import { POS_NAMES, rankBand } from '~/utils/dictionary'
import { bandStarts, filterVocabulary, mergeVocabulary } from '~/utils/vocabulary'

useSeoMeta({
  title: 'Словарь',
  description: 'Частотный словарь польского языка для русскоговорящих: слова по частоте, переводы и подробные карточки.',
})

const { words } = useWords()
const { entries: index, ready } = useDictionaryIndex()
await ready

const query = ref('')
const pos = ref<CardPos | null>(null)
const band = ref<number | null>(null)
const inLessonsOnly = ref(false)

const merged = computed(() => mergeVocabulary(index.value, words.value))
const bands = computed(() => bandStarts(merged.value))
const rows = computed(() =>
  filterVocabulary(merged.value, { query: query.value, pos: pos.value, band: band.value, inLessonsOnly: inLessonsOnly.value }),
)
</script>

<template>
  <article class="content vocabulary">
    <h1>Словарь</h1>
    <form class="filters" role="search" @submit.prevent>
      <input v-model="query" type="search" placeholder="Поиск по-польски или по-русски" aria-label="Поиск слова" />
      <select v-model="pos" aria-label="Часть речи">
        <option :value="null">Все части речи</option>
        <option v-for="p in CARD_POS" :key="p" :value="p">{{ POS_NAMES[p] }}</option>
      </select>
      <select v-model="band" aria-label="Частотность">
        <option :value="null">Все слова</option>
        <option v-for="start in bands" :key="start" :value="start">{{ rankBand(start).label }}</option>
      </select>
      <label class="checkbox">
        <input v-model="inLessonsOnly" type="checkbox" />
        Встречается в уроках
      </label>
    </form>
    <p class="count">Найдено слов: {{ rows.length }}</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Таблица слов">
      <table>
        <thead>
          <tr>
            <th scope="col">№</th>
            <th scope="col">Польский</th>
            <th scope="col">Перевод</th>
            <th scope="col">Часть речи</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in rows" :id="entry.id" :key="entry.id">
            <td class="rank">{{ entry.rank ?? '—' }}</td>
            <td lang="pl" class="pl">
              <NuxtLink v-if="entry.hasCard" :to="`/slovo/${entry.id}`">{{ entry.lemma }}</NuxtLink>
              <template v-else>{{ entry.lemma }}</template>
              <SpeakButton :text="entry.lemma" />
            </td>
            <td>{{ entry.gloss }}</td>
            <td class="meta">{{ entry.pos ? POS_NAMES[entry.pos] : 'фраза' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin: 1rem 0;
}
.filters input[type='search'],
.filters select {
  font: inherit;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--fg);
}
.filters input[type='search'] {
  flex: 1 1 14rem;
}
.count,
.rank,
.meta {
  color: var(--muted);
}
.pl {
  color: var(--accent-pl);
  font-weight: 600;
  white-space: nowrap;
}
tr:target td {
  background: var(--highlight);
}
</style>
```

Replace `tests/nuxt/vocabulary-page.test.ts` with:
```ts
import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import VocabularyPage from '~/pages/vocabulary.vue'

const { wordsApi } = await vi.hoisted(() => import('./fixtures'))
const { dictionary } = await vi.hoisted(async () => {
  const { computed } = await import('vue')
  const entries = [
    { id: 'miec', lemma: 'mieć', rank: 13, pos: 'verb', gloss: 'иметь' },
    { id: 'dom', lemma: 'dom', rank: 120, pos: 'noun', gloss: 'дом, здание' },
  ]
  return {
    dictionary: {
      entries: computed(() => entries),
      byId: computed(() => new Map(entries.map((e) => [e.id, e]))),
      ready: Promise.resolve(),
    },
  }
})
mockNuxtImport('useWords', () => wordsApi)
mockNuxtImport('useDictionaryIndex', () => () => dictionary)

describe('vocabulary page', () => {
  it('lists cards by rank with links, then lesson words', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    const ids = wrapper.findAll('tbody tr').map((tr) => tr.attributes('id'))
    expect(ids.slice(0, 2)).toEqual(['miec', 'dom'])
    expect(ids).toContain('rzeka')
    expect(wrapper.find('tr#dom a').attributes('href')).toBe('/slovo/dom')
    expect(wrapper.find('tr#rzeka a').exists()).toBe(false)
  })

  it('filters by frequency band and lessons', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    await wrapper.find('select[aria-label="Частотность"]').setValue(wrapper.find('select[aria-label="Частотность"] option:nth-child(2)').element.getAttribute('value'))
    expect(wrapper.findAll('tbody tr').map((tr) => tr.attributes('id'))).toEqual(['miec', 'dom'])
  })

  it('shows only lesson words when asked', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    await wrapper.find('input[type="checkbox"]').setValue(true)
    const ids = wrapper.findAll('tbody tr').map((tr) => tr.attributes('id'))
    expect(ids).toContain('dom')
    expect(ids).not.toContain('miec')
  })
})
```

If setting the band `<select>` by the option's string value does not update a `number | null` model in the test environment, select the option element instead: `await wrapper.findAll('select[aria-label="Частотность"] option')[1]!.setSelected()`.

Run: `pnpm vitest run --project unit tests/unit/vocabulary.test.ts && pnpm vitest run --project nuxt tests/nuxt/vocabulary-page.test.ts`
Expected: PASS.

- [ ] **Step 4: Add «Подробнее →» to `PlWord`**

In `app/components/content/PlWord.vue`, add to the script after `const word = …`:
```ts
const { byId: cardsById } = useDictionaryIndex({ lazy: true })
const hasCard = computed(() => cardsById.value.has(props.id))
```
and inside the card, after the false-friend line:
```vue
      <NuxtLink v-if="hasCard" :to="`/slovo/${id}`" class="card-more">Подробнее →</NuxtLink>
```
and add to its `<style scoped>`:
```css
.card-more {
  margin-top: 0.25rem;
}
```

In `tests/nuxt/pl-word.test.ts` add after the existing `mockNuxtImport('useWords', …)` line:
```ts
const { cardIndex } = await vi.hoisted(async () => {
  const { computed } = await import('vue')
  return {
    cardIndex: {
      entries: computed(() => []),
      byId: computed(() => new Map([['rzeka', { id: 'rzeka' }]])),
      ready: Promise.resolve(),
    },
  }
})
mockNuxtImport('useDictionaryIndex', () => () => cardIndex)
```
and this test inside the `describe`:
```ts
  it('links to the detailed card when one exists', async () => {
    const withCard = await mountSuspended(PlWord, { props: { id: 'rzeka' } })
    expect(withCard.find('a.card-more').attributes('href')).toBe('/slovo/rzeka')
    const without = await mountSuspended(PlWord, { props: { id: 'glowa' } })
    expect(without.find('a.card-more').exists()).toBe(false)
  })
```

Run: `pnpm vitest run --project nuxt tests/nuxt/pl-word.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Index cards in search (test first)**

In `tests/unit/search-docs.test.ts`:
- add `cards: [], forms: []` to the existing `bundle` object;
- append:
```ts
describe('card documents', () => {
  it('indexes cards by lemma, senses and all forms, replacing the lesson word document', () => {
    const withCard = {
      ...bundle,
      cards: [
        {
          path: 'dictionary/zab.yml',
          data: {
            id: 'zab', lemma: 'ząb', rank: 900, pos: 'noun', pron: { cyr: 'зомп' },
            senses: [{ id: 'tooth', ru: 'зуб', examples: [{ pl: 'Boli mnie ząb.', ru: 'У меня болит зуб.', source: { kind: 'authored' } }] }],
          },
        },
      ],
      forms: [
        {
          path: 'forms/zab.json',
          data: {
            generated: true, sources: { polimorf: '0.6.7', wiktionary: 'w', tatoeba: 't' },
            id: 'zab', lemma: 'ząb', pos: 'noun', grammarLabel: null, ipa: null, audio: null,
            allForms: ['ząb', 'zęba', 'zęby'], tables: [], tatoeba: {},
          },
        },
      ],
    }
    const docs = buildSearchDocs(withCard)
    expect(docs.find((d) => d.id === 'card:zab')).toEqual({
      id: 'card:zab',
      type: 'word',
      title: 'ząb — зуб',
      text: 'ząb zęba zęby зуб',
      url: '/slovo/zab',
    })
    expect(docs.some((d) => d.id === 'word:zab')).toBe(false)
  })
})
```

Run: `pnpm vitest run --project unit tests/unit/search-docs.test.ts`
Expected: FAIL — no `card:zab` document.

In `scripts/lib/search-docs.ts`:
- extend the schema import with `import { cardSchema, formsFileSchema } from '../../shared/dictionary'`;
- before the `for (const word of words.values())` loop add:
```ts
  const cardIds = new Set<string>()
  for (const file of bundle.cards) {
    const card = cardSchema.safeParse(file.data)
    if (!card.success) continue
    const formsFile = bundle.forms.find((f) => f.path === `forms/${card.data.id}.json`)
    const forms = formsFile ? formsFileSchema.safeParse(formsFile.data) : null
    const allForms = forms?.success ? forms.data.allForms : [card.data.lemma]
    cardIds.add(card.data.id)
    docs.push({
      id: `card:${card.data.id}`,
      type: 'word',
      title: `${card.data.lemma} — ${card.data.senses.map((s) => s.ru).join('; ')}`,
      text: [...new Set([card.data.lemma, ...allForms])].join(' ') + ' ' + card.data.senses.map((s) => s.ru).join(' '),
      url: `/slovo/${card.data.id}`,
    })
  }
```
- inside the lesson-word loop, skip ids with a card: first line `if (cardIds.has(word.id)) continue`.

Run: `pnpm vitest run --project unit tests/unit/search-docs.test.ts`
Expected: PASS.

- [ ] **Step 6: Add the sources page and sidebar link**

`app/pages/sources.vue`:
```vue
<script setup lang="ts">
useSeoMeta({
  title: 'Источники и лицензии',
  description: 'Откуда взяты данные частотного словаря и на каких условиях они используются.',
})

const sources = [
  { name: 'FrequencyWords (OpenSubtitles 2018)', url: 'https://github.com/hermitdave/FrequencyWords', use: 'частотность словоформ', license: 'CC BY-SA 4.0' },
  { name: 'PoliMorf 0.6.7', url: 'http://zil.ipipan.waw.pl/PoliMorf', use: 'все формы слов и грамматические пометы', license: 'BSD 2-clause' },
  { name: 'Викисловарь (pl.wiktionary.org), выгрузка kaikki.org', url: 'https://kaikki.org/', use: 'значения, транскрипция IPA, переводы, родственные слова', license: 'CC BY-SA' },
  { name: 'Tatoeba', url: 'https://tatoeba.org/', use: 'примеры предложений и переводы', license: 'CC BY 2.0 FR' },
  { name: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/', use: 'записи произношения', license: 'лицензия указана в карточке слова' },
]
</script>

<template>
  <article class="content">
    <h1>Источники и лицензии</h1>
    <p>
      Частотный словарь собран из открытых источников. Формы слов и примеры взяты из данных, переводы примеров без
      отметки Tatoeba и заметки для русскоговорящих написаны для этого курса и проходят проверку.
    </p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Таблица источников">
      <table>
        <thead>
          <tr>
            <th scope="col">Источник</th>
            <th scope="col">Что используется</th>
            <th scope="col">Лицензия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="source in sources" :key="source.name">
            <td><a :href="source.url">{{ source.name }}</a></td>
            <td>{{ source.use }}</td>
            <td>{{ source.license }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      Данные, производные от источников под CC BY-SA (частотность, значения из Викисловаря), распространяются на тех же
      условиях — CC BY-SA.
    </p>
  </article>
</template>
```

In `app/components/AppSidebar.vue` add after the final `</ol>` inside `<nav>`:
```vue
    <p class="sidebar-footer">
      <NuxtLink to="/sources" :class="{ active: currentPath === '/sources' }">Источники и лицензии</NuxtLink>
    </p>
```
and in `app/assets/css/base.css` add:
```css
.sidebar-footer {
  margin: 1rem 0 0;
  font-size: 0.8rem;
}
```

- [ ] **Step 7: Verify and commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck && pnpm generate`
Expected: exit 0; `/sources` and `/vocabulary` prerendered.

```bash
git add -A
git commit -m "feat(dictionary): frequency vocabulary list, popover links, search and sources page

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```
