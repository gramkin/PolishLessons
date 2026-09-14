<script setup lang="ts">
import type { Word } from '#shared/schemas'
import { resolveDirection } from '~/utils/deck'

const props = defineProps<{ words: Word[]; direction: 'pl-ru' | 'ru-pl' | 'mixed' }>()
const emit = defineEmits<{
  review: [wordId: string, remembered: boolean]
  finish: [summary: { remembered: number; forgotten: number }]
}>()

const { byId: patternsById } = usePatterns()

// Directions are fixed per session so a card does not change sides on re-render.
const sides = props.words.map(() => resolveDirection(props.direction))

const index = ref(0)
const flipped = ref(false)
const remembered = ref(0)
const forgotten = ref(0)

const word = computed(() => props.words[index.value] ?? null)
const side = computed(() => sides[index.value] ?? 'pl-ru')
const pattern = computed(() =>
  word.value?.pattern ? (patternsById.value.get(word.value.pattern) ?? null) : null,
)

function flip() {
  flipped.value = true
}

function answer(ok: boolean) {
  if (!word.value || !flipped.value) return
  emit('review', word.value.id, ok)
  if (ok) remembered.value++
  else forgotten.value++
  flipped.value = false
  index.value++
  if (index.value >= props.words.length) {
    emit('finish', { remembered: remembered.value, forgotten: forgotten.value })
  }
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target
  if (target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName))
    return
  if ((event.key === ' ' || event.key === 'Enter') && !flipped.value) {
    event.preventDefault()
    flip()
  } else if (event.key === '1') {
    answer(false)
  } else if (event.key === '2') {
    answer(true)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="word" class="flashcard-session">
    <p class="counter">{{ index + 1 }} / {{ words.length }}</p>
    <div class="card">
      <div class="card-front">
        <template v-if="side === 'pl-ru'">
          <span lang="pl" class="card-word">{{ word.pl }}</span>
          <SpeakButton :text="word.pl" />
        </template>
        <span v-else class="card-word">{{ word.ru }}</span>
      </div>
      <div v-if="flipped" class="card-back">
        <span v-if="side === 'pl-ru'" class="card-answer">{{ word.ru }}</span>
        <span v-else class="card-answer">
          <span lang="pl">{{ word.pl }}</span>
          <SpeakButton :text="word.pl" />
        </span>
        <span class="card-pron">[{{ word.pron }}]</span>
        <span v-if="pattern" class="card-pattern">
          <span lang="pl">{{ pattern.pl }}</span> ↔ {{ pattern.ru }}
        </span>
        <span v-if="word.falseFriend" class="card-ff">
          ⚠ Ложный друг: не «{{ word.falseFriend.ru }}»
        </span>
      </div>
    </div>
    <div class="actions">
      <button v-if="!flipped" type="button" class="flip" @click="flip">
        Показать ответ <kbd>Пробел</kbd>
      </button>
      <template v-else>
        <button type="button" class="forgot" @click="answer(false)">Не помню <kbd>1</kbd></button>
        <button type="button" class="remember" @click="answer(true)">Помню <kbd>2</kbd></button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.counter {
  color: var(--muted);
  text-align: center;
}
.card {
  border: 1px solid var(--border);
  border-radius: 8px;
  min-height: 12rem;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
}
.card-word {
  font-size: 2rem;
  font-weight: 600;
}
.card-front [lang='pl'],
.card-back [lang='pl'] {
  color: var(--accent-pl);
}
.card-back {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.card-answer {
  font-size: 1.5rem;
}
.card-pron {
  color: var(--muted);
  font-style: italic;
}
.card-pattern {
  color: var(--cognate);
}
.card-ff {
  color: var(--false-friend);
}
.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
.actions button {
  font: inherit;
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--callout-bg);
  color: var(--fg);
  cursor: pointer;
}
kbd {
  font-size: 0.75em;
  color: var(--muted);
  margin-left: 0.25rem;
}
</style>
