# Plan 2 — Teaching Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Markdown-embeddable components that exploit Russian–Polish similarity — word popovers, pronunciation with speech, cognate tables, false-friend callouts, comparison tables — plus bilingual story pages.

**Architecture:** Word and pattern data are loaded once per page by the layout through `useWords()` / `usePatterns()` (shared `useAsyncData` keys) and read synchronously by components. Components in `app/components/content/` are available in Markdown via MDC syntax. Stories are YAML documents rendered by a presentational `StoryView` wrapped by a data-loading `BilingualStory`.

**Tech Stack:** Nuxt 4, @nuxt/content 3 (MDC), Web Speech API, Vitest + @nuxt/test-utils.

**Spec:** `docs/superpowers/specs/2026-09-14-polish-for-russians-design.md` (§5)

**Prerequisite:** Plan 1 complete (`2026-09-14-polish-site-01-foundation.md`).

## Global Constraints

All constraints in `2026-09-14-polish-site-00-overview.md` → "Global Constraints" apply. Key ones for this plan:
- Speech: `lang='pl-PL'`, `rate=0.9`; the speak button is not rendered when no Polish voice exists.
- Every element containing Polish text carries `lang="pl"`.
- Pure logic (`app/utils/*.ts`) uses relative imports only.
- Word popovers must open by mouse hover, click/tap and keyboard (Enter/Space on the trigger), and close with Escape.

## Deviation from spec (decided during planning)

- **`CompareTable` takes its rows as YAML props** (`headers`, `rows`, `plColumns`), not a Markdown table slot. Rows whose first cell starts with `!` are highlighted as differences. Reason: Markdown table slots are rendered through MDC prose components, so detecting `!` rows would require fragile vnode walking or post-hydration DOM edits that would not appear in prerendered HTML.

---

### Task 1: Speech — voice selection, `useSpeech`, `SpeakButton`

**Files:**
- Create: `app/utils/speech.ts`, `app/composables/useSpeech.ts`, `app/components/content/SpeakButton.vue`
- Test: `tests/unit/speech.test.ts`, `tests/nuxt/speak-button.test.ts`

**Interfaces:**
- Produces:
  - `interface VoiceLike { lang: string; localService?: boolean }`
  - `pickPolishVoice<T extends VoiceLike>(voices: readonly T[]): T | null` — prefers `pl-PL` local, then any `pl-PL`, then any `pl*`; case- and `_`/`-`-insensitive
  - `useSpeech(): { supported: ComputedRef<boolean>; speaking: Ref<boolean>; speak(text: string): void; stop(): void }` — module-level singleton voice, initialized on first client mount
  - `resetSpeech(): void` — test helper that clears the singleton
  - `<SpeakButton text="string" label?="string" />` — renders nothing when unsupported; `aria-label` defaults to `Произнести: <text>`

- [ ] **Step 1: Write the failing unit test**

`tests/unit/speech.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { pickPolishVoice } from '../../app/utils/speech'

describe('pickPolishVoice', () => {
  it('returns null without Polish voices', () => {
    expect(pickPolishVoice([{ lang: 'ru-RU' }, { lang: 'en-US' }])).toBeNull()
  })

  it('prefers a local pl-PL voice', () => {
    const voices = [
      { lang: 'pl-PL', localService: false, name: 'remote' },
      { lang: 'pl-PL', localService: true, name: 'local' },
    ]
    expect(pickPolishVoice(voices)?.name).toBe('local')
  })

  it('accepts pl_PL and bare pl', () => {
    expect(pickPolishVoice([{ lang: 'en-GB' }, { lang: 'pl_PL' }])?.lang).toBe('pl_PL')
    expect(pickPolishVoice([{ lang: 'PL' }])?.lang).toBe('PL')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project unit tests/unit/speech.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/utils/speech.ts`**

```ts
export interface VoiceLike {
  lang: string
  localService?: boolean
}

function normalizedLang(voice: VoiceLike): string {
  return voice.lang.toLowerCase().replace('_', '-')
}

export function pickPolishVoice<T extends VoiceLike>(voices: readonly T[]): T | null {
  const polish = voices.filter((v) => normalizedLang(v).startsWith('pl'))
  if (polish.length === 0) return null
  const exact = polish.filter((v) => normalizedLang(v) === 'pl-pl')
  return exact.find((v) => v.localService) ?? exact[0] ?? polish[0] ?? null
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project unit tests/unit/speech.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing component test**

`tests/nuxt/speak-button.test.ts`:
```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpeakButton from '~/components/content/SpeakButton.vue'
import { resetSpeech } from '~/composables/useSpeech'

class FakeUtterance {
  lang = ''
  rate = 1
  voice: unknown = null
  onend: (() => void) | null = null
  constructor(public text: string) {}
}

function installSpeech(voices: { lang: string; localService?: boolean }[]) {
  const synth = {
    getVoices: () => voices,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    speak: vi.fn(),
    cancel: vi.fn(),
  }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  return synth
}

beforeEach(() => resetSpeech())
afterEach(() => vi.unstubAllGlobals())

describe('SpeakButton', () => {
  it('renders nothing without a Polish voice', async () => {
    installSpeech([{ lang: 'en-US' }])
    const wrapper = await mountSuspended(SpeakButton, { props: { text: 'rzeka' } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('speaks Polish text at rate 0.9', async () => {
    const synth = installSpeech([{ lang: 'pl-PL', localService: true }])
    const wrapper = await mountSuspended(SpeakButton, { props: { text: 'rzeka' } })
    const button = wrapper.find('button')
    expect(button.attributes('aria-label')).toBe('Произнести: rzeka')

    await button.trigger('click')
    expect(synth.cancel).toHaveBeenCalled()
    const utterance = synth.speak.mock.calls[0]?.[0] as FakeUtterance
    expect(utterance.text).toBe('rzeka')
    expect(utterance.lang).toBe('pl-PL')
    expect(utterance.rate).toBe(0.9)
  })

  it('uses a custom label', async () => {
    installSpeech([{ lang: 'pl-PL' }])
    const wrapper = await mountSuspended(SpeakButton, {
      props: { text: 'Kot i mysz', label: 'Читать вслух' },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Читать вслух')
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm vitest run --project nuxt tests/nuxt/speak-button.test.ts`
Expected: FAIL — component/composable not found.

- [ ] **Step 7: Implement `app/composables/useSpeech.ts`**

```ts
import { pickPolishVoice } from '~/utils/speech'

const voice = shallowRef<SpeechSynthesisVoice | null>(null)
const speaking = ref(false)
let initialized = false

function refreshVoice() {
  voice.value = pickPolishVoice(window.speechSynthesis.getVoices())
}

function init() {
  if (initialized || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  initialized = true
  refreshVoice()
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoice)
}

export function resetSpeech() {
  if (initialized && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.removeEventListener('voiceschanged', refreshVoice)
  }
  initialized = false
  voice.value = null
  speaking.value = false
}

export function useSpeech() {
  onMounted(init)

  function speak(text: string) {
    if (!voice.value) return
    const synth = window.speechSynthesis
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pl-PL'
    utterance.rate = 0.9
    utterance.voice = voice.value
    utterance.onend = () => {
      speaking.value = false
    }
    speaking.value = true
    synth.speak(utterance)
  }

  function stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    speaking.value = false
  }

  return { supported: computed(() => voice.value !== null), speaking, speak, stop }
}
```

- [ ] **Step 8: Implement `app/components/content/SpeakButton.vue`**

```vue
<script setup lang="ts">
const props = defineProps<{ text: string; label?: string }>()
const { supported, speak } = useSpeech()
</script>

<template>
  <button
    v-if="supported"
    type="button"
    class="speak-button"
    :aria-label="props.label ?? `Произнести: ${props.text}`"
    :title="props.label ?? 'Произнести'"
    @click.stop="speak(props.text)"
  >
    🔊
  </button>
</template>

<style scoped>
.speak-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
  padding: 0 0.2em;
  line-height: 1;
  vertical-align: baseline;
  opacity: 0.75;
}
.speak-button:hover {
  opacity: 1;
}
</style>
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `pnpm vitest run --project nuxt tests/nuxt/speak-button.test.ts`
Expected: PASS (3 tests). If `'speechSynthesis' in window` is false despite `vi.stubGlobal`, assign the stub with `Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true })` in `installSpeech` and delete it in `afterEach`.

- [ ] **Step 10: Commit**

```bash
git add app/utils/speech.ts app/composables/useSpeech.ts app/components/content/SpeakButton.vue tests/unit/speech.test.ts tests/nuxt/speak-button.test.ts
git commit -m "feat: add Polish speech synthesis and SpeakButton

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 2: Word data composables, `PlWord` and `Pron`

**Files:**
- Create: `app/composables/useWords.ts`, `app/composables/usePatterns.ts`, `app/utils/labels.ts`, `app/components/content/PlWord.vue`, `app/components/content/Pron.vue`, `tests/nuxt/fixtures.ts`
- Modify: `app/layouts/default.vue` (preload words and patterns), `content/lessons/02-sounds/01-rz.md`, `content/words/sample.yml` (add `brzeg`, `glowa`), `content/patterns.yml` (add `ło-оло`)
- Test: `tests/nuxt/pl-word.test.ts`, `tests/nuxt/pron.test.ts`

**Interfaces:**
- Consumes: `Word`, `Pattern` types (`shared/schemas.ts`), `SpeakButton` (Task 1).
- Produces:
  - `useWords(): { words: ComputedRef<Word[]>; byId: ComputedRef<Map<string, Word>>; ready: PromiseLike<unknown> }` — data key `content:words`
  - `usePatterns(): { patterns: ComputedRef<Pattern[]>; byId: ComputedRef<Map<string, Pattern>>; ready: PromiseLike<unknown> }` — data key `content:patterns`
  - `POS_LABELS: Record<Word['pos'], string>`, `GENDER_LABELS: Record<NonNullable<Word['gender']>, string>`
  - `<PlWord id="string">[slot: displayed form]</PlWord>` — root `.pl-word` with modifier `.is-cognate` (has `pattern`) or `.is-false-friend` (has `falseFriend`); trigger `button.pl-word-trigger[lang=pl]`; card `.pl-word-card` visible while hovered or pinned by click; Escape and outside click close; unknown id in dev renders `.pl-word-missing` with text `?<id>`
  - `<Pron id?="string" pl?="string" ru?="string" />` — `.pron` containing `.pron-pl[lang=pl]`, `.pron-ru` (`[transcription]`) and a speak button
  - `tests/nuxt/fixtures.ts`: `words`, `patterns`, `wordsApi()`, `patternsApi()` with the same return shapes as the composables

- [ ] **Step 1: Implement data composables and labels**

`app/composables/useWords.ts`:
```ts
import type { Word } from '#shared/schemas'

export function useWords() {
  const result = useAsyncData('content:words', async () => {
    const files = await queryCollection('words').all()
    return files.flatMap((file) => file.words)
  })
  const words = computed<Word[]>(() => result.data.value ?? [])
  const byId = computed(() => new Map(words.value.map((w) => [w.id, w])))
  return { words, byId, ready: result }
}
```

`app/composables/usePatterns.ts`:
```ts
import type { Pattern } from '#shared/schemas'

export function usePatterns() {
  const result = useAsyncData('content:patterns', async () => {
    const file = await queryCollection('patterns').first()
    return file?.patterns ?? []
  })
  const patterns = computed<Pattern[]>(() => result.data.value ?? [])
  const byId = computed(() => new Map(patterns.value.map((p) => [p.id, p])))
  return { patterns, byId, ready: result }
}
```

`app/utils/labels.ts`:
```ts
import type { Word } from '../../shared/schemas'

export const POS_LABELS: Record<Word['pos'], string> = {
  noun: 'сущ.',
  verb: 'глаг.',
  adj: 'прил.',
  adv: 'нареч.',
  pron: 'местоим.',
  num: 'числ.',
  prep: 'предлог',
  conj: 'союз',
  part: 'частица',
  phrase: 'фраза',
}

export const GENDER_LABELS: Record<NonNullable<Word['gender']>, string> = {
  m: 'м. р.',
  f: 'ж. р.',
  n: 'ср. р.',
}
```

If `#shared/schemas` does not resolve in `pnpm typecheck`, use `~~/shared/schemas` in both composables.

- [ ] **Step 2: Preload word data in the layout**

In `app/layouts/default.vue` replace:
```ts
const { nav, prev, next, ready } = useLessonNav()
await ready
```
with:
```ts
const { nav, prev, next, ready } = useLessonNav()
const { ready: wordsReady } = useWords()
const { ready: patternsReady } = usePatterns()
await Promise.all([ready, wordsReady, patternsReady])
```

- [ ] **Step 3: Create test fixtures**

`tests/nuxt/fixtures.ts`:
```ts
import { computed } from 'vue'
import type { Pattern, Word } from '../../shared/schemas'

export const words: Word[] = [
  { id: 'rzeka', pl: 'rzeka', ru: 'река', pos: 'noun', gender: 'f', pron: 'жэ́ка', pattern: 'rz-р', topic: 'природа', chapter: 2 },
  { id: 'brzeg', pl: 'brzeg', ru: 'берег', pos: 'noun', gender: 'm', pron: 'бжэк', pattern: 'rz-р', topic: 'природа', chapter: 2 },
  { id: 'glowa', pl: 'głowa', ru: 'голова', pos: 'noun', gender: 'f', pron: 'гуо́ва', pattern: 'ło-оло', topic: 'тело', chapter: 2 },
  { id: 'uroda', pl: 'uroda', ru: 'красота', pos: 'noun', gender: 'f', pron: 'уро́да', falseFriend: { ru: 'урод', meaning: 'красота, привлекательность' }, topic: 'люди', chapter: 2 },
  { id: 'dom', pl: 'dom', ru: 'дом', pos: 'noun', gender: 'm', pron: 'дом', topic: 'дом', chapter: 3 },
]

export const patterns: Pattern[] = [
  { id: 'rz-р', pl: 'rz', ru: 'р', rule: 'Польское rz часто стоит там, где в русском «р».' },
  { id: 'ło-оло', pl: 'ło', ru: 'оло', rule: 'Русскому «оло» часто соответствует польское «ło».' },
]

export function wordsApi() {
  return {
    words: computed(() => words),
    byId: computed(() => new Map(words.map((w) => [w.id, w]))),
    ready: Promise.resolve(),
  }
}

export function patternsApi() {
  return {
    patterns: computed(() => patterns),
    byId: computed(() => new Map(patterns.map((p) => [p.id, p]))),
    ready: Promise.resolve(),
  }
}
```

- [ ] **Step 4: Write the failing component tests**

`tests/nuxt/pl-word.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import PlWord from '~/components/content/PlWord.vue'

const { wordsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)

function cardHidden(wrapper: Awaited<ReturnType<typeof mountSuspended>>): boolean {
  return (wrapper.find('.pl-word-card').element as HTMLElement).style.display === 'none'
}

describe('PlWord', () => {
  it('renders a cognate with its Polish form', async () => {
    const wrapper = await mountSuspended(PlWord, { props: { id: 'rzeka' } })
    expect(wrapper.classes()).toContain('is-cognate')
    const trigger = wrapper.find('button.pl-word-trigger')
    expect(trigger.text()).toBe('rzeka')
    expect(trigger.attributes('lang')).toBe('pl')
  })

  it('renders a slot form instead of the dictionary form', async () => {
    const wrapper = await mountSuspended(PlWord, {
      props: { id: 'rzeka' },
      slots: { default: () => 'rzekę' },
    })
    expect(wrapper.find('button.pl-word-trigger').text()).toBe('rzekę')
  })

  it('marks false friends and warns in the card', async () => {
    const wrapper = await mountSuspended(PlWord, { props: { id: 'uroda' } })
    expect(wrapper.classes()).toContain('is-false-friend')
    expect(wrapper.find('.card-ff').text()).toContain('Не путать с «урод»')
  })

  it('shows translation, transcription and grammar in the card', async () => {
    const wrapper = await mountSuspended(PlWord, { props: { id: 'glowa' } })
    const card = wrapper.find('.pl-word-card')
    expect(card.find('.card-ru').text()).toBe('голова')
    expect(card.find('.card-pron').text()).toBe('[гуо́ва]')
    expect(card.find('.card-meta').text()).toBe('сущ., ж. р.')
  })

  it('opens on hover, pins on click and closes on Escape', async () => {
    const wrapper = await mountSuspended(PlWord, { props: { id: 'rzeka' } })
    expect(cardHidden(wrapper)).toBe(true)

    await wrapper.trigger('mouseenter')
    expect(cardHidden(wrapper)).toBe(false)
    await wrapper.trigger('mouseleave')
    expect(cardHidden(wrapper)).toBe(true)

    await wrapper.find('button').trigger('click')
    expect(cardHidden(wrapper)).toBe(false)
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    await wrapper.trigger('mouseleave')
    expect(cardHidden(wrapper)).toBe(false)

    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(cardHidden(wrapper)).toBe(true)
  })

  it('falls back to the id for unknown words', async () => {
    const wrapper = await mountSuspended(PlWord, { props: { id: 'ghost' } })
    expect(wrapper.find('button').text()).toBe('ghost')
    expect(wrapper.find('.pl-word-card').exists()).toBe(false)
    if (import.meta.dev) expect(wrapper.find('.pl-word-missing').text()).toBe('?ghost')
  })
})
```

`tests/nuxt/pron.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import Pron from '~/components/content/Pron.vue'

const { wordsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)

describe('Pron', () => {
  it('reads Polish text and transcription from the dictionary', async () => {
    const wrapper = await mountSuspended(Pron, { props: { id: 'rzeka' } })
    expect(wrapper.find('.pron-pl').text()).toBe('rzeka')
    expect(wrapper.find('.pron-pl').attributes('lang')).toBe('pl')
    expect(wrapper.find('.pron-ru').text()).toBe('[жэ́ка]')
  })

  it('accepts explicit text and transcription', async () => {
    const wrapper = await mountSuspended(Pron, { props: { pl: 'szczęście', ru: 'щэ́нщьчэ' } })
    expect(wrapper.find('.pron-pl').text()).toBe('szczęście')
    expect(wrapper.find('.pron-ru').text()).toBe('[щэ́нщьчэ]')
  })
})
```

Fixture import pattern: `mockNuxtImport` is hoisted above normal imports, so fixtures are loaded through `await vi.hoisted(() => import('./fixtures'))`. If the transform rejects this form, inline the fixture objects inside `vi.hoisted(async () => { const { computed } = await import('vue'); …; return { wordsApi } })` in the test file.

- [ ] **Step 5: Run them to verify they fail**

Run: `pnpm vitest run --project nuxt tests/nuxt/pl-word.test.ts tests/nuxt/pron.test.ts`
Expected: FAIL — components not found.

- [ ] **Step 6: Implement `app/components/content/PlWord.vue`**

```vue
<script setup lang="ts">
import { GENDER_LABELS, POS_LABELS } from '~/utils/labels'

const props = defineProps<{ id: string }>()

const { byId } = useWords()
const word = computed(() => byId.value.get(props.id) ?? null)

const hovered = ref(false)
const pinned = ref(false)
const open = computed(() => hovered.value || pinned.value)
const root = ref<HTMLElement | null>(null)
const cardId = useId()
const isDev = import.meta.dev

const kind = computed(() => {
  if (word.value?.falseFriend) return 'is-false-friend'
  if (word.value?.pattern) return 'is-cognate'
  return ''
})

const meta = computed(() => {
  if (!word.value) return ''
  const parts = [POS_LABELS[word.value.pos]]
  if (word.value.gender) parts.push(GENDER_LABELS[word.value.gender])
  return parts.join(', ')
})

function close() {
  hovered.value = false
  pinned.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (pinned.value && root.value && !root.value.contains(event.target as Node)) pinned.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <span
    ref="root"
    class="pl-word"
    :class="kind"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @keydown.escape="close"
  >
    <button
      type="button"
      class="pl-word-trigger"
      lang="pl"
      :aria-expanded="word ? open : undefined"
      :aria-controls="word ? cardId : undefined"
      @click="pinned = !pinned"
    >
      <slot>{{ word?.pl ?? id }}</slot>
    </button>
    <span
      v-if="word"
      v-show="open"
      :id="cardId"
      class="pl-word-card"
      role="group"
      :aria-label="`Слово ${word.pl}`"
    >
      <span class="card-head">
        <span lang="pl" class="card-pl">{{ word.pl }}</span>
        <SpeakButton :text="word.pl" />
      </span>
      <span class="card-pron">[{{ word.pron }}]</span>
      <span class="card-ru">{{ word.ru }}</span>
      <span class="card-meta">{{ meta }}</span>
      <span v-if="word.falseFriend" class="card-ff">⚠ Не путать с «{{ word.falseFriend.ru }}»</span>
    </span>
    <span v-else-if="isDev" class="pl-word-missing" :title="`Нет слова с id ${id}`">?{{ id }}</span>
  </span>
</template>

<style scoped>
.pl-word {
  position: relative;
  display: inline;
}
.pl-word-trigger {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--accent-pl);
  cursor: help;
}
.is-cognate .pl-word-trigger {
  text-decoration: underline dotted var(--cognate);
  text-underline-offset: 3px;
}
.is-false-friend .pl-word-trigger {
  text-decoration: underline dotted var(--false-friend);
  text-underline-offset: 3px;
}
.pl-word-card {
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 11rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: nowrap;
}
.card-pl {
  font-weight: 700;
  color: var(--accent-pl);
}
.card-pron,
.card-meta {
  color: var(--muted);
  font-style: italic;
}
.card-ff {
  color: var(--false-friend);
}
.pl-word-missing {
  color: #fff;
  background: #c62828;
  padding: 0 0.25em;
  margin-left: 0.2em;
  border-radius: 3px;
  font-size: 0.75em;
}
</style>
```

- [ ] **Step 7: Implement `app/components/content/Pron.vue`**

```vue
<script setup lang="ts">
const props = defineProps<{ id?: string; pl?: string; ru?: string }>()

const { byId } = useWords()
const word = computed(() => (props.id ? (byId.value.get(props.id) ?? null) : null))
const polish = computed(() => props.pl ?? word.value?.pl ?? '')
const transcription = computed(() => props.ru ?? word.value?.pron ?? '')
</script>

<template>
  <span class="pron">
    <span lang="pl" class="pron-pl">{{ polish }}</span>
    <span v-if="transcription" class="pron-ru">[{{ transcription }}]</span>
    <SpeakButton v-if="polish" :text="polish" />
  </span>
</template>

<style scoped>
.pron-pl {
  color: var(--accent-pl);
  font-weight: 600;
}
.pron-ru {
  color: var(--muted);
  font-style: italic;
  margin-left: 0.25em;
}
</style>
```

- [ ] **Step 8: Run the component tests to verify they pass**

Run: `pnpm vitest run --project nuxt tests/nuxt/pl-word.test.ts tests/nuxt/pron.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 9: Use the components in sample content**

Append to `content/patterns.yml`:
```yaml
  - id: ło-оло
    pl: ło
    ru: оло
    rule: Русскому «оло» между согласными часто соответствует польское «ło».
```

Append to `content/words/sample.yml`:
```yaml
  - id: brzeg
    pl: brzeg
    ru: берег
    pos: noun
    gender: m
    pron: бжэк
    pattern: rz-р
    topic: природа
    chapter: 2
  - id: glowa
    pl: głowa
    ru: голова
    pos: noun
    gender: f
    pron: гуо́ва
    pattern: ło-оло
    topic: тело
    chapter: 2
```

Replace `content/lessons/02-sounds/01-rz.md` with:
```md
---
title: rz и р
chapter: 2
order: 1
level: A1
words: [rzeka, brzeg]
---

Сравните :pl-word{id="rzeka"} и «река», :pl-word{id="brzeg"} и «берег».

Произношение: :pron{id="rzeka"}
```

- [ ] **Step 10: Verify content and generated HTML**

Run: `pnpm validate && pnpm generate`
Expected: `✓ content is valid`, generate exit 0.

Run:
```bash
grep -c 'pl-word is-cognate' .output/public/lessons/02-sounds/01-rz/index.html
grep -c 'жэ́ка' .output/public/lessons/02-sounds/01-rz/index.html
```
Expected: both ≥ 1.

- [ ] **Step 11: Full test run, lint, typecheck, commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add word data composables, PlWord and Pron components

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 3: `CognateList`, `FalseFriend`, `CompareTable`

**Files:**
- Create: `app/components/content/CognateList.vue`, `app/components/content/FalseFriend.vue`, `app/components/content/CompareTable.vue`
- Modify: `content/lessons/02-sounds/01-rz.md` (use all three)
- Test: `tests/nuxt/cognate-list.test.ts`, `tests/nuxt/false-friend.test.ts`, `tests/nuxt/compare-table.test.ts`

**Interfaces:**
- Consumes: `useWords()`, `usePatterns()`, fixtures `wordsApi`, `patternsApi` (Task 2); `highlightGroup` (Plan 1 Task 3); `SpeakButton` (Task 1).
- Produces:
  - `<CognateList pattern="rz-р" />` — `figure.cognate-list` with the rule in `figcaption` and a table (Польский | Русский | Произношение) of every word with that `pattern`, sorted by `localeCompare(…, 'pl')`; changed letters wrapped in `<mark>`; renders nothing for an unknown pattern
  - `<FalseFriend id?="string" pl?="string" ru?="string" meaning?="string" />` — `aside.false-friend[role=note]` with text `<pl> ≠ <ru>. Значит: <meaning>`; `id` reads `word.pl` and `word.falseFriend`
  - `<CompareTable :headers="string[]" :rows="string[][]" :pl-columns?="number[]" caption?="string" />` — rows whose first cell starts with `!` get `tr.diff` (marker stripped); cells in `plColumns` (default: last column) get `lang="pl"`

Markdown usage (MDC):
```md
::cognate-list{pattern="rz-р"}
::

:false-friend{id="uroda"}

::compare-table
---
headers: [Падеж, Русский, Польский]
rows:
  - [Именительный, мама, mama]
  - ["!Звательный", "—", mamo]
---
::
```

- [ ] **Step 1: Write the failing tests**

`tests/nuxt/cognate-list.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import CognateList from '~/components/content/CognateList.vue'

const { wordsApi, patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)
mockNuxtImport('usePatterns', () => patternsApi)

describe('CognateList', () => {
  it('lists words of the pattern sorted, with highlighted groups', async () => {
    const wrapper = await mountSuspended(CognateList, { props: { pattern: 'rz-р' } })
    expect(wrapper.find('figcaption').text()).toContain('Польское rz часто стоит там')

    const rows = wrapper.findAll('tbody tr')
    expect(rows.map((r) => r.find('td').text().trim())).toEqual(['brzeg', 'rzeka'])

    const first = rows[0]!.findAll('td')
    expect(first[0]!.find('mark').text()).toBe('rz')
    expect(first[0]!.attributes('lang')).toBe('pl')
    expect(first[1]!.text().trim()).toBe('берег')
    expect(first[1]!.find('mark').text()).toBe('р')
    expect(first[2]!.text()).toBe('[бжэк]')
  })

  it('renders nothing for an unknown pattern', async () => {
    const wrapper = await mountSuspended(CognateList, { props: { pattern: 'zz-зз' } })
    expect(wrapper.find('figure').exists()).toBe(false)
  })
})
```

`tests/nuxt/false-friend.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import FalseFriend from '~/components/content/FalseFriend.vue'

const { wordsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)

describe('FalseFriend', () => {
  it('reads a false friend from the dictionary', async () => {
    const wrapper = await mountSuspended(FalseFriend, { props: { id: 'uroda' } })
    const aside = wrapper.find('aside.false-friend')
    expect(aside.attributes('role')).toBe('note')
    expect(aside.text().replace(/\s+/g, ' ')).toContain(
      'uroda ≠ урод. Значит: красота, привлекательность',
    )
    expect(aside.find('[lang="pl"]').text()).toBe('uroda')
  })

  it('accepts explicit props', async () => {
    const wrapper = await mountSuspended(FalseFriend, {
      props: { pl: 'sklep', ru: 'склеп', meaning: 'магазин' },
    })
    expect(wrapper.text().replace(/\s+/g, ' ')).toContain('sklep ≠ склеп. Значит: магазин')
  })
})
```

`tests/nuxt/compare-table.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompareTable from '~/components/content/CompareTable.vue'

const headers = ['Падеж', 'Русский', 'Польский']
const rows = [
  ['Именительный', 'мама', 'mama'],
  ['!Звательный', '—', 'mamo'],
]

describe('CompareTable', () => {
  it('renders headers and rows', async () => {
    const wrapper = await mountSuspended(CompareTable, { props: { headers, rows } })
    expect(wrapper.findAll('th').map((th) => th.text())).toEqual(headers)
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('highlights rows marked with ! and strips the marker', async () => {
    const wrapper = await mountSuspended(CompareTable, { props: { headers, rows } })
    const [plain, diff] = wrapper.findAll('tbody tr')
    expect(plain!.classes()).not.toContain('diff')
    expect(diff!.classes()).toContain('diff')
    expect(diff!.find('td').text()).toContain('Звательный')
    expect(diff!.find('td').text()).not.toContain('!')
  })

  it('marks the last column as Polish by default', async () => {
    const wrapper = await mountSuspended(CompareTable, { props: { headers, rows } })
    const cells = wrapper.find('tbody tr').findAll('td')
    expect(cells[2]!.attributes('lang')).toBe('pl')
    expect(cells[1]!.attributes('lang')).toBeUndefined()
  })

  it('respects explicit Polish columns', async () => {
    const wrapper = await mountSuspended(CompareTable, {
      props: { headers: ['Pl', 'Ru'], rows: [['dom', 'дом']], plColumns: [0] },
    })
    const cells = wrapper.find('tbody tr').findAll('td')
    expect(cells[0]!.attributes('lang')).toBe('pl')
    expect(cells[1]!.attributes('lang')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project nuxt tests/nuxt/cognate-list.test.ts tests/nuxt/false-friend.test.ts tests/nuxt/compare-table.test.ts`
Expected: FAIL — components not found.

- [ ] **Step 3: Implement `app/components/content/CognateList.vue`**

```vue
<script setup lang="ts">
import { highlightGroup } from '~/utils/pattern'

const props = defineProps<{ pattern: string }>()

const { words } = useWords()
const { byId: patternsById } = usePatterns()

const pattern = computed(() => patternsById.value.get(props.pattern) ?? null)

const rows = computed(() => {
  const p = pattern.value
  if (!p) return []
  return words.value
    .filter((w) => w.pattern === p.id)
    .sort((a, b) => a.pl.localeCompare(b.pl, 'pl'))
    .map((w) => ({
      id: w.id,
      text: w.pl,
      pl: highlightGroup(w.pl, p.pl),
      ru: highlightGroup(w.ru, p.ru),
      pron: w.pron,
    }))
})
</script>

<template>
  <figure v-if="pattern" class="cognate-list">
    <figcaption class="callout">
      <strong><span lang="pl">{{ pattern.pl }}</span> ↔ {{ pattern.ru }}</strong> —
      {{ pattern.rule }}
    </figcaption>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Польский</th>
            <th scope="col">Русский</th>
            <th scope="col">Произношение</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td lang="pl" class="pl">
              <template v-for="(segment, i) in row.pl" :key="i">
                <mark v-if="segment.hl">{{ segment.text }}</mark>
                <template v-else>{{ segment.text }}</template>
              </template>
              <SpeakButton :text="row.text" />
            </td>
            <td>
              <template v-for="(segment, i) in row.ru" :key="i">
                <mark v-if="segment.hl">{{ segment.text }}</mark>
                <template v-else>{{ segment.text }}</template>
              </template>
            </td>
            <td class="pron">[{{ row.pron }}]</td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
</template>

<style scoped>
.cognate-list {
  margin: 1.5rem 0;
}
.pl {
  color: var(--accent-pl);
  font-weight: 600;
}
mark {
  background: var(--highlight);
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}
.pron {
  color: var(--muted);
  font-style: italic;
}
</style>
```

- [ ] **Step 4: Implement `app/components/content/FalseFriend.vue`**

```vue
<script setup lang="ts">
const props = defineProps<{ id?: string; pl?: string; ru?: string; meaning?: string }>()

const { byId } = useWords()
const word = computed(() => (props.id ? (byId.value.get(props.id) ?? null) : null))

const polish = computed(() => props.pl ?? word.value?.pl ?? '')
const russian = computed(() => props.ru ?? word.value?.falseFriend?.ru ?? '')
const meaning = computed(() => props.meaning ?? word.value?.falseFriend?.meaning ?? '')
</script>

<template>
  <aside class="false-friend callout" role="note">
    <span class="icon" aria-hidden="true">⚠</span>
    <span><strong lang="pl">{{ polish }}</strong> ≠ {{ russian }}. Значит: {{ meaning }}</span>
  </aside>
</template>

<style scoped>
.false-friend {
  display: flex;
  gap: 0.5rem;
  border-left-color: var(--false-friend);
}
.icon {
  color: var(--false-friend);
}
strong {
  color: var(--accent-pl);
}
</style>
```

- [ ] **Step 5: Implement `app/components/content/CompareTable.vue`**

```vue
<script setup lang="ts">
const props = defineProps<{
  headers: string[]
  rows: string[][]
  plColumns?: number[]
  caption?: string
}>()

const polishColumns = computed(() => new Set(props.plColumns ?? [props.headers.length - 1]))

const parsedRows = computed(() =>
  props.rows.map((cells) => {
    const first = cells[0] ?? ''
    const diff = first.startsWith('!')
    return { diff, cells: diff ? [first.slice(1).trimStart(), ...cells.slice(1)] : cells }
  }),
)
</script>

<template>
  <div class="table-wrap compare-table">
    <table>
      <caption v-if="caption">{{ caption }}</caption>
      <thead>
        <tr>
          <th v-for="(header, i) in headers" :key="i" scope="col">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, r) in parsedRows" :key="r" :class="{ diff: row.diff }">
          <td
            v-for="(cell, c) in row.cells"
            :key="c"
            :lang="polishColumns.has(c) ? 'pl' : undefined"
          >
            {{ cell }}<span v-if="row.diff && c === 0" class="sr-only"> (отличие от русского)</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
td[lang='pl'] {
  color: var(--accent-pl);
}
.diff td {
  background: var(--highlight);
}
.diff td:first-child {
  font-weight: 600;
}
caption {
  text-align: left;
  color: var(--muted);
  padding-bottom: 0.25rem;
}
</style>
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm vitest run --project nuxt tests/nuxt/cognate-list.test.ts tests/nuxt/false-friend.test.ts tests/nuxt/compare-table.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 7: Use the components in the sample lesson**

Append to `content/lessons/02-sounds/01-rz.md`:
```md

::cognate-list{pattern="rz-р"}
::

:false-friend{id="uroda"}

::compare-table
---
headers: [Падеж, Русский, Польский]
rows:
  - [Именительный, мама, mama]
  - ["!Звательный", "—", mamo]
---
::
```

- [ ] **Step 8: Verify content and generated HTML**

Run: `pnpm generate`
Expected: exit 0.

Run:
```bash
f=.output/public/lessons/02-sounds/01-rz/index.html
grep -c 'cognate-list' $f
grep -c 'false-friend' $f
grep -c 'class="diff"' $f
```
Expected: each ≥ 1.

- [ ] **Step 9: Full test run, lint, typecheck, commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add CognateList, FalseFriend and CompareTable components

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 4: Bilingual stories — tokenizer, `StoryView`, `BilingualStory`, story pages

**Files:**
- Create: `app/utils/story.ts`, `app/composables/useStory.ts`, `app/components/StoryView.vue`, `app/components/content/BilingualStory.vue`, `app/pages/stories/index.vue`, `app/pages/stories/[slug].vue`, `content/stories/kot-i-mysz.yml`
- Modify: `app/components/AppSidebar.vue` (add «Истории» section link)
- Test: `tests/unit/story.test.ts`, `tests/nuxt/story-view.test.ts`

**Interfaces:**
- Consumes: `Story` type (`shared/schemas.ts`); `PlWord`, `SpeakButton`, `useWords`, fixtures (Tasks 1–2).
- Produces:
  - `interface StoryToken { text: string; wordId: string | null }`
  - `tokenizeSentence(pl: string, forms?: Record<string, string>): StoryToken[]` — marks every whole-word occurrence (Unicode letter boundaries, case-sensitive) of each form; longer forms win on overlap; concatenated token texts always equal `pl`
  - `storySlug(stem: string): string` — last path segment (`stories/kot-i-mysz` → `kot-i-mysz`)
  - `type TranslationMode = 'show' | 'hide' | 'tap'` (exported from `app/utils/story.ts`)
  - `useStory(slug: string)` — `useAsyncData` with key `story:<slug>` returning the `stories` collection item whose `stem` is `stories/<slug>`, or `null`
  - `<StoryView :story="Story" :initial-mode?="TranslationMode" />` — default mode `tap`; toolbar buttons `[data-mode]` with `aria-pressed`; each sentence `li.pair` with `p.pl[lang=pl]` and (when visible) `p.ru`; in `tap` mode clicking a Polish sentence (outside a `.pl-word`) or its `button.reveal` toggles the translation
  - `<BilingualStory id="kot-i-mysz" />` — Markdown-embeddable wrapper around `StoryView`
  - Routes `/stories` (list) and `/stories/<slug>`

- [ ] **Step 1: Write the failing unit tests**

`tests/unit/story.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { storySlug, tokenizeSentence } from '../../app/utils/story'

function joined(tokens: { text: string }[]): string {
  return tokens.map((t) => t.text).join('')
}

describe('tokenizeSentence', () => {
  it('returns one plain token without forms', () => {
    expect(tokenizeSentence('Kot śpi.')).toEqual([{ text: 'Kot śpi.', wordId: null }])
  })

  it('marks mapped forms and keeps punctuation', () => {
    const tokens = tokenizeSentence('Kot mieszka nad rzeką.', { rzeką: 'rzeka', Kot: 'kot' })
    expect(tokens).toEqual([
      { text: 'Kot', wordId: 'kot' },
      { text: ' mieszka nad ', wordId: null },
      { text: 'rzeką', wordId: 'rzeka' },
      { text: '.', wordId: null },
    ])
  })

  it('only matches whole words', () => {
    const tokens = tokenizeSentence('Kotek i kot.', { kot: 'kot' })
    expect(tokens.filter((t) => t.wordId)).toEqual([{ text: 'kot', wordId: 'kot' }])
    expect(joined(tokens)).toBe('Kotek i kot.')
  })

  it('marks every occurrence', () => {
    const tokens = tokenizeSentence('dom i dom', { dom: 'dom' })
    expect(tokens.filter((t) => t.wordId)).toHaveLength(2)
  })

  it('prefers longer multi-word forms on overlap', () => {
    const tokens = tokenizeSentence('Dzień dobry, pani!', { 'Dzień dobry': 'dzien-dobry', dobry: 'dobry' })
    expect(tokens.filter((t) => t.wordId)).toEqual([{ text: 'Dzień dobry', wordId: 'dzien-dobry' }])
    expect(joined(tokens)).toBe('Dzień dobry, pani!')
  })
})

describe('storySlug', () => {
  it('returns the last path segment', () => {
    expect(storySlug('stories/kot-i-mysz')).toBe('kot-i-mysz')
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project unit tests/unit/story.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/utils/story.ts`**

```ts
export type TranslationMode = 'show' | 'hide' | 'tap'

export interface StoryToken {
  text: string
  wordId: string | null
}

const LETTER = /\p{L}/u

interface Range {
  start: number
  end: number
  wordId: string
}

export function tokenizeSentence(pl: string, forms: Record<string, string> = {}): StoryToken[] {
  const ranges: Range[] = []
  const keys = Object.keys(forms).sort((a, b) => b.length - a.length)

  for (const form of keys) {
    let from = 0
    for (;;) {
      const start = pl.indexOf(form, from)
      if (start === -1) break
      const end = start + form.length
      const wholeWord = !LETTER.test(pl[start - 1] ?? '') && !LETTER.test(pl[end] ?? '')
      const overlaps = ranges.some((r) => start < r.end && end > r.start)
      if (wholeWord && !overlaps) ranges.push({ start, end, wordId: forms[form]! })
      from = start + 1
    }
  }

  ranges.sort((a, b) => a.start - b.start)

  const tokens: StoryToken[] = []
  let position = 0
  for (const range of ranges) {
    if (range.start > position) tokens.push({ text: pl.slice(position, range.start), wordId: null })
    tokens.push({ text: pl.slice(range.start, range.end), wordId: range.wordId })
    position = range.end
  }
  if (position < pl.length) tokens.push({ text: pl.slice(position), wordId: null })
  return tokens
}

export function storySlug(stem: string): string {
  return stem.split('/').pop() ?? stem
}
```

- [ ] **Step 4: Run them to verify they pass**

Run: `pnpm vitest run --project unit tests/unit/story.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Write the failing `StoryView` test**

`tests/nuxt/story-view.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import StoryView from '~/components/StoryView.vue'

const { wordsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)

const story = {
  title: 'Kot i rzeka',
  titleRu: 'Кот и река',
  level: 'A1' as const,
  sentences: [
    { pl: 'Kot mieszka nad rzeką.', ru: 'Кот живёт у реки.', words: { rzeką: 'rzeka' } },
    { pl: 'Na brzegu jest dom.', ru: 'На берегу стоит дом.', words: { brzegu: 'brzeg', dom: 'dom' } },
  ],
}

describe('StoryView', () => {
  it('renders Polish sentences with word links', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story } })
    const pl = wrapper.findAll('p.pl')
    expect(pl).toHaveLength(2)
    expect(pl[0]!.attributes('lang')).toBe('pl')
    expect(pl[0]!.find('.pl-word-trigger').text()).toBe('rzeką')
    expect(pl[1]!.findAll('.pl-word')).toHaveLength(2)
  })

  it('starts in tap mode and toggles a translation by clicking the sentence', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story } })
    expect(wrapper.find('[data-mode="tap"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.findAll('p.ru')).toHaveLength(0)

    await wrapper.findAll('p.pl')[1]!.trigger('click')
    const ru = wrapper.findAll('p.ru')
    expect(ru).toHaveLength(1)
    expect(ru[0]!.text()).toBe('На берегу стоит дом.')

    await wrapper.findAll('p.pl')[1]!.trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(0)
  })

  it('does not toggle when a word inside the sentence is clicked', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story } })
    await wrapper.find('.pl-word-trigger').trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(0)
  })

  it('toggles with the reveal button', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story } })
    const button = wrapper.findAll('button.reveal')[0]!
    await button.trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(1)
    expect(wrapper.findAll('button.reveal')[0]!.attributes('aria-expanded')).toBe('true')
  })

  it('shows all translations in show mode and none in hide mode', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story } })
    await wrapper.find('[data-mode="show"]').trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(2)
    expect(wrapper.find('[data-mode="show"]').attributes('aria-pressed')).toBe('true')

    await wrapper.find('[data-mode="hide"]').trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(0)
    expect(wrapper.findAll('button.reveal')).toHaveLength(0)
    await wrapper.findAll('p.pl')[0]!.trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(0)
  })

  it('respects initialMode', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story, initialMode: 'show' } })
    expect(wrapper.findAll('p.ru')).toHaveLength(2)
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm vitest run --project nuxt tests/nuxt/story-view.test.ts`
Expected: FAIL — component not found.

- [ ] **Step 7: Implement `app/components/StoryView.vue`**

```vue
<script setup lang="ts">
import type { Story } from '#shared/schemas'
import { tokenizeSentence, type TranslationMode } from '~/utils/story'

const props = withDefaults(defineProps<{ story: Story; initialMode?: TranslationMode }>(), {
  initialMode: 'tap',
})

const modes = [
  { value: 'show', label: 'Показывать перевод' },
  { value: 'hide', label: 'Скрыть перевод' },
  { value: 'tap', label: 'По нажатию' },
] as const

const mode = ref<TranslationMode>(props.initialMode)
const revealed = ref(new Set<number>())
const linked = ref<number | null>(null)

watch(
  () => props.initialMode,
  (value) => {
    mode.value = value
  },
)
watch(mode, () => {
  revealed.value = new Set()
})

const sentences = computed(() =>
  props.story.sentences.map((sentence, index) => ({
    index,
    ru: sentence.ru,
    tokens: tokenizeSentence(sentence.pl, sentence.words),
  })),
)
const fullText = computed(() => props.story.sentences.map((s) => s.pl).join(' '))

function ruVisible(index: number): boolean {
  return mode.value === 'show' || (mode.value === 'tap' && revealed.value.has(index))
}

function toggle(index: number) {
  const next = new Set(revealed.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  revealed.value = next
}

function onSentenceClick(event: MouseEvent, index: number) {
  if (mode.value !== 'tap') return
  if ((event.target as HTMLElement | null)?.closest('.pl-word')) return
  toggle(index)
}
</script>

<template>
  <div class="story" :class="`mode-${mode}`">
    <div class="story-toolbar" role="group" aria-label="Режим перевода">
      <button
        v-for="m in modes"
        :key="m.value"
        type="button"
        :data-mode="m.value"
        :aria-pressed="mode === m.value"
        @click="mode = m.value"
      >
        {{ m.label }}
      </button>
      <SpeakButton :text="fullText" label="Читать вслух" />
    </div>
    <ol class="story-sentences">
      <li
        v-for="s in sentences"
        :key="s.index"
        class="pair"
        :class="{ linked: linked === s.index }"
        @mouseenter="linked = s.index"
        @mouseleave="linked = null"
      >
        <p class="pl" lang="pl" @click="onSentenceClick($event, s.index)">
          <template v-for="(token, k) in s.tokens" :key="k">
            <PlWord v-if="token.wordId" :id="token.wordId">{{ token.text }}</PlWord>
            <template v-else>{{ token.text }}</template>
          </template>
          <button
            v-if="mode === 'tap'"
            type="button"
            class="reveal"
            lang="ru"
            :aria-expanded="revealed.has(s.index)"
            @click.stop="toggle(s.index)"
          >
            <span aria-hidden="true">↔</span>
            <span class="sr-only">Показать перевод</span>
          </button>
        </p>
        <p v-if="ruVisible(s.index)" class="ru">{{ s.ru }}</p>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.story-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0 1.5rem;
}
.story-toolbar button[data-mode] {
  font: inherit;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: none;
  color: var(--fg);
  cursor: pointer;
}
.story-toolbar button[aria-pressed='true'] {
  background: var(--callout-bg);
  border-color: var(--accent-pl);
  font-weight: 600;
}
.story-sentences {
  list-style: none;
  padding: 0;
  margin: 0;
}
.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 2rem;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
}
.mode-hide .pair {
  grid-template-columns: 1fr;
}
.pair.linked {
  background: var(--callout-bg);
}
.pair p {
  margin: 0;
}
.pl {
  grid-column: 1;
}
.mode-tap .pl {
  cursor: pointer;
}
.ru {
  grid-column: 2;
  color: var(--muted);
}
.reveal {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.8em;
  margin-left: 0.25rem;
}
@media (max-width: 1080px) {
  .pair {
    grid-template-columns: 1fr;
  }
  .ru {
    grid-column: 1;
    font-size: 0.9em;
    padding-bottom: 0.25rem;
  }
}
</style>
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `pnpm vitest run --project nuxt tests/nuxt/story-view.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 9: Implement `useStory`, `BilingualStory` and the story pages**

`app/composables/useStory.ts`:
```ts
export function useStory(slug: string) {
  return useAsyncData(`story:${slug}`, () =>
    queryCollection('stories').where('stem', '=', `stories/${slug}`).first(),
  )
}
```

`app/components/content/BilingualStory.vue`:
```vue
<script setup lang="ts">
const props = defineProps<{ id: string }>()
const { data: story } = await useStory(props.id)
</script>

<template>
  <StoryView v-if="story" :story="story" />
</template>
```

`app/pages/stories/index.vue`:
```vue
<script setup lang="ts">
import { storySlug } from '~/utils/story'

const { data: stories } = await useAsyncData('content:stories', () =>
  queryCollection('stories').all(),
)

useSeoMeta({ title: 'Истории', description: 'Двуязычные истории на польском с переводом на русский.' })
</script>

<template>
  <article class="content">
    <h1>Истории</h1>
    <p>Короткие тексты на польском с построчным переводом. Наведите на слово, чтобы увидеть его значение.</p>
    <ul class="story-list">
      <li v-for="story in stories ?? []" :key="story.stem">
        <NuxtLink :to="`/stories/${storySlug(story.stem)}`">
          <span lang="pl">{{ story.title }}</span>
        </NuxtLink>
        — {{ story.titleRu }} <span class="level">{{ story.level }}</span>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.level {
  color: var(--muted);
  font-size: 0.8em;
  margin-left: 0.25rem;
}
</style>
```

`app/pages/stories/[slug].vue`:
```vue
<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug)
const { data: story } = await useStory(slug)

if (!story.value) {
  throw createError({ statusCode: 404, statusMessage: 'История не найдена', fatal: true })
}

useSeoMeta({
  title: () => story.value?.title,
  description: () => story.value?.description ?? story.value?.titleRu,
})
</script>

<template>
  <article v-if="story" class="content">
    <h1 lang="pl">{{ story.title }}</h1>
    <p class="subtitle">{{ story.titleRu }} · {{ story.level }}</p>
    <StoryView :story="story" />
  </article>
</template>

<style scoped>
.subtitle {
  color: var(--muted);
  margin-top: -0.5rem;
}
</style>
```

In `app/components/AppSidebar.vue` change the `sections` array to:
```ts
const sections = [
  { to: '/stories', label: 'Истории' },
  { to: '/cheatsheet', label: 'Шпаргалка' },
]
```

- [ ] **Step 10: Add a sample story**

`content/stories/kot-i-mysz.yml`:
```yaml
title: Kot i mysz
titleRu: Кот и мышь
level: A1
description: Короткая история о коте, мыши и реке.
sentences:
  - pl: Kot mieszka nad rzeką.
    ru: Кот живёт у реки.
    words:
      rzeką: rzeka
  - pl: Na brzegu siedzi mysz.
    ru: На берегу сидит мышь.
    words:
      brzegu: brzeg
  - pl: Mysz ma małą głowę.
    ru: У мыши маленькая голова.
    words:
      głowę: glowa
```

- [ ] **Step 11: Verify content and generated pages**

Run: `pnpm validate && pnpm generate`
Expected: `✓ content is valid`; generate exit 0; routes `/stories` and `/stories/kot-i-mysz` prerendered.

Run:
```bash
grep -c 'Kot i mysz' .output/public/stories/index.html
grep -c 'class="pair' .output/public/stories/kot-i-mysz/index.html
grep -c 'rzeką' .output/public/stories/kot-i-mysz/index.html
```
Expected: each ≥ 1.

- [ ] **Step 12: Manual check**

Run `pnpm preview`, open `http://localhost:4173/stories/kot-i-mysz`.
Check: hover a sentence highlights it; in «По нажатию» clicking a sentence shows its translation in the right column (wide) or below (≤1080px); hovering *rzeką* shows the card for *rzeka*; «Показывать перевод» shows all; «Скрыть перевод» hides all. Stop the server.

- [ ] **Step 13: Full test run, lint, typecheck, commit**

Run: `pnpm test && pnpm format && pnpm lint && pnpm typecheck`
Expected: exit 0.

```bash
git add -A
git commit -m "feat: add bilingual stories with tap-to-translate

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```
