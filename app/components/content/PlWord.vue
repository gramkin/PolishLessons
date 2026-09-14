<script setup lang="ts">
import { GENDER_LABELS, POS_LABELS } from '~/utils/labels'

const props = defineProps<{ id: string }>()

const { byId } = useWords()
const word = computed(() => byId.value.get(props.id) ?? null)
const { byId: cardsById } = useDictionaryIndex({ lazy: true })
const hasCard = computed(() => cardsById.value.has(props.id))

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
      <NuxtLink v-if="hasCard" :to="`/slovo/${id}`" class="card-more">Подробнее →</NuxtLink>
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
.card-more {
  margin-top: 0.25rem;
}
</style>
