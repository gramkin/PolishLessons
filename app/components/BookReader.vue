<script setup lang="ts">
import type { Book } from '#shared/schemas'
import { tokenizeSentence, type TranslationMode } from '~/utils/story'

const props = withDefaults(defineProps<{ book: Book; initialMode?: TranslationMode }>(), {
  initialMode: 'show',
})

const modes = [
  { value: 'show', label: 'Показывать перевод' },
  { value: 'hide', label: 'Скрыть перевод' },
  { value: 'tap', label: 'По нажатию' },
] as const

const mode = ref<TranslationMode>(props.initialMode)
const revealed = ref(new Set<number>())

watch(
  () => props.initialMode,
  (value) => {
    mode.value = value
  },
)
watch(mode, () => {
  revealed.value = new Set()
})

// The clean repeat carries the word links: on the second, unaided pass the reader
// is the one who needs the dictionary, not on the glossed pass.
// A row of asterisks is a scene break, not language: there is nothing in it to
// gloss, to look up, or to read aloud.
const SCENE_BREAK = /^[*\s]+$/

const paragraphs = computed(() =>
  props.book.paragraphs.map((paragraph, index) => ({
    index,
    sceneBreak: paragraph.clean.includes('*') && SCENE_BREAK.test(paragraph.clean),
    // Chunks carry the spacing that rebuilds the source text, so the gloss and note
    // are trimmed here: otherwise the bracket renders as "( перевод".
    verse: paragraph.verse === true,
    chunks: paragraph.chunks.map((chunk) => ({
      pl: chunk.pl,
      ru: chunk.ru.trim(),
      note: chunk.note?.trim(),
    })),
    clean: paragraph.clean,
    tokens: tokenizeSentence(paragraph.clean, paragraph.words),
  })),
)

// The source repeats the asterisk row two or three times to widen the gap. That
// is typesetting, not three separate breaks, so a run collapses into one.
const items = computed(() =>
  paragraphs.value.filter((paragraph, i, all) => !(paragraph.sceneBreak && all[i - 1]?.sceneBreak)),
)

function ruVisible(index: number): boolean {
  return mode.value === 'show' || (mode.value === 'tap' && revealed.value.has(index))
}

function toggle(index: number) {
  const next = new Set(revealed.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  revealed.value = next
}
</script>

<template>
  <div class="book" :class="`mode-${mode}`">
    <div class="book-toolbar" role="group" aria-label="Режим перевода">
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
    </div>

    <template v-for="p in items" :key="p.index">
      <div
        v-if="p.sceneBreak"
        class="scene-break"
        role="separator"
        aria-label="Разрыв в повествовании"
      >
        * * *
      </div>
      <section v-else class="para">
        <p
          class="glossed"
          lang="pl"
          :class="{ tappable: mode === 'tap', verse: p.verse }"
          @click="mode === 'tap' && toggle(p.index)"
        >
          <template v-for="(chunk, k) in p.chunks" :key="k"
            ><span class="pl">{{ chunk.pl }}</span
            ><span v-if="ruVisible(p.index)" class="gloss" lang="ru">
              ({{ chunk.ru
              }}<template v-if="chunk.note"
                >; <i class="note">{{ chunk.note }}</i></template
              >)</span
            ></template
          >
          <button
            v-if="mode === 'tap' && !ruVisible(p.index)"
            type="button"
            class="reveal"
            :aria-expanded="false"
            @click.stop="toggle(p.index)"
          >
            <span aria-hidden="true">↔</span>
            <span class="sr-only">Показать перевод</span>
          </button>
        </p>
        <p class="clean" lang="pl" :class="{ verse: p.verse }">
          <template v-for="(token, k) in p.tokens" :key="k">
            <NuxtLink
              v-if="token.wordId"
              class="book-word"
              :to="`/slovo/${token.wordId}`"
              target="_blank"
              rel="noopener"
              >{{ token.text }}</NuxtLink
            >
            <template v-else>{{ token.text }}</template>
          </template>
          <SpeakButton :text="p.clean" label="Читать абзац" />
        </p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.book-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0 1.5rem;
}
.book-toolbar button[data-mode] {
  font: inherit;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: none;
  color: var(--fg);
  cursor: pointer;
}
.book-toolbar button[aria-pressed='true'] {
  background: var(--callout-bg);
  border-color: var(--accent-pl);
  font-weight: 600;
}
.para {
  margin: 0 0 1.75rem;
}
.scene-break {
  margin: 0 0 1.75rem;
  color: var(--muted);
  text-align: center;
  letter-spacing: 0.5em;
  user-select: none;
}
.glossed {
  margin: 0;
  line-height: 1.9;
}
.glossed.tappable {
  cursor: pointer;
}
.glossed .pl {
  color: var(--accent-pl);
}
.gloss {
  color: var(--muted);
  font-size: 0.9375em;
}
.note {
  font-style: italic;
}
/* Verse only: keep the line breaks the poem was written with. */
.verse {
  white-space: pre-line;
}
.clean {
  margin: 0.6rem 0 0;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
  line-height: 1.7;
}
.book-word {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dotted var(--accent-pl);
}
.book-word:hover {
  background: var(--highlight);
}
.reveal {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.8em;
}
</style>
