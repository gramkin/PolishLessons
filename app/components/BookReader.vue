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
const paragraphs = computed(() =>
  props.book.paragraphs.map((paragraph, index) => ({
    index,
    chunks: paragraph.chunks,
    clean: paragraph.clean,
    tokens: tokenizeSentence(paragraph.clean, paragraph.words),
  })),
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

    <section v-for="p in paragraphs" :key="p.index" class="para">
      <ol class="chunks">
        <li v-for="(chunk, k) in p.chunks" :key="k" class="chunk">
          <span class="pl" lang="pl">{{ chunk.pl }}</span>
          <SpeakButton :text="chunk.pl" />
          <span v-if="ruVisible(p.index)" class="ru">{{ chunk.ru }}</span>
          <button
            v-else-if="mode === 'tap'"
            type="button"
            class="reveal"
            :aria-expanded="false"
            @click="toggle(p.index)"
          >
            <span aria-hidden="true">↔</span>
            <span class="sr-only">Показать перевод</span>
          </button>
        </li>
      </ol>
      <p class="clean" lang="pl">
        <template v-for="(token, k) in p.tokens" :key="k">
          <NuxtLink v-if="token.wordId" class="book-word" :to="`/slovo/${token.wordId}`">{{
            token.text
          }}</NuxtLink>
          <template v-else>{{ token.text }}</template>
        </template>
        <SpeakButton :text="p.clean" label="Читать абзац" />
      </p>
    </section>
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
.chunks {
  list-style: none;
  margin: 0;
  padding: 0;
}
.chunk {
  padding: 0.1rem 0;
  line-height: 1.5;
}
.chunk .pl {
  color: var(--accent-pl);
}
.chunk .ru {
  color: var(--muted);
}
.chunk .ru::before {
  content: ' — ';
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
.mode-hide .chunk .pl {
  color: inherit;
}
</style>
