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
    pl: sentence.pl,
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
          <SpeakButton :text="s.pl" label="Читать предложение" />
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
