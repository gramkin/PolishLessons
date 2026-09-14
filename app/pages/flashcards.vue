<script setup lang="ts">
import type { Word } from '#shared/schemas'
import { learnedWordIds, selectWords, type DeckFilter } from '~/utils/deck'
import { buildSession, isDue } from '~/utils/leitner'
import { listTopics } from '~/utils/vocabulary'

useSeoMeta({ title: 'Карточки', description: 'Повторение слов по системе Лейтнера.' })

const { words } = useWords()
const { progress, loaded, isLessonCompleted, reviewCard, updateSettings } = useProgress()
const { data: lessonWords } = await useLessonWords()
const { data: chapters } = await useAsyncData('content:chapters', () =>
  queryCollection('chapters').first(),
)

const kind = ref<DeckFilter['kind']>('learned')
const chapter = ref(1)
const topics = computed(() => listTopics(words.value))
const topic = ref('')
watch(
  topics,
  (list) => {
    if (!topic.value && list[0]) topic.value = list[0]
  },
  { immediate: true },
)

const direction = computed({
  get: () => progress.value.settings.direction,
  set: (value) => updateSettings({ direction: value }),
})

const filter = computed<DeckFilter>(() => {
  if (kind.value === 'chapter') return { kind: 'chapter', chapter: chapter.value }
  if (kind.value === 'topic') return { kind: 'topic', topic: topic.value }
  return { kind: kind.value }
})

const learned = computed(() => learnedWordIds(lessonWords.value ?? [], isLessonCompleted))
const deck = computed(() => selectWords(words.value, filter.value, learned.value))
const sessionIds = computed(() =>
  buildSession(
    deck.value.map((w) => w.id),
    progress.value.cards,
    new Date(),
  ),
)
const dueCount = computed(() => {
  const now = new Date()
  return deck.value.filter((w) => {
    const card = progress.value.cards[w.id]
    return card !== undefined && isDue(card, now)
  }).length
})
const newCount = computed(() => sessionIds.value.length - dueCount.value)

const session = ref<Word[] | null>(null)
const summary = ref<{ remembered: number; forgotten: number } | null>(null)

function start() {
  const byId = new Map(words.value.map((w) => [w.id, w]))
  session.value = sessionIds.value.map((id) => byId.get(id)).filter((w): w is Word => !!w)
  summary.value = null
}

function onFinish(result: { remembered: number; forgotten: number }) {
  summary.value = result
  session.value = null
}
</script>

<template>
  <article class="content flashcards">
    <h1>Карточки</h1>
    <ClientOnly>
      <template #fallback><p>Загрузка…</p></template>
      <p v-if="!loaded">Загрузка…</p>
      <FlashcardSession
        v-else-if="session"
        :words="session"
        :direction="direction"
        @review="reviewCard"
        @finish="onFinish"
      />
      <template v-else>
        <p v-if="summary" class="summary" role="status">
          Сессия завершена. Помню: {{ summary.remembered }} · Не помню: {{ summary.forgotten }}
        </p>
        <form class="setup" @submit.prevent="start">
          <fieldset>
            <legend>Какие слова</legend>
            <label><input v-model="kind" type="radio" value="learned" /> Изученные слова</label>
            <label>
              <input v-model="kind" type="radio" value="chapter" /> Глава
              <select v-model="chapter" :disabled="kind !== 'chapter'" aria-label="Глава">
                <option v-for="c in chapters?.chapters ?? []" :key="c.number" :value="c.number">
                  {{ c.number }}. {{ c.title }}
                </option>
              </select>
            </label>
            <label>
              <input v-model="kind" type="radio" value="topic" /> Тема
              <select v-model="topic" :disabled="kind !== 'topic'" aria-label="Тема">
                <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>
            <label>
              <input v-model="kind" type="radio" value="false-friends" /> Только ложные друзья
            </label>
          </fieldset>
          <fieldset>
            <legend>Направление</legend>
            <label
              ><input v-model="direction" type="radio" value="pl-ru" /> Польский → русский</label
            >
            <label
              ><input v-model="direction" type="radio" value="ru-pl" /> Русский → польский</label
            >
            <label><input v-model="direction" type="radio" value="mixed" /> Вперемешку</label>
          </fieldset>
          <p class="counts">К повторению: {{ dueCount }} · новых: {{ newCount }}</p>
          <p v-if="kind === 'learned' && deck.length === 0" class="hint">
            Пока нет изученных слов — пройдите урок или выберите главу.
          </p>
          <button type="submit" :disabled="sessionIds.length === 0">Начать</button>
        </form>
      </template>
    </ClientOnly>
  </article>
</template>

<style scoped>
fieldset {
  border: 1px solid var(--border);
  border-radius: 6px;
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
}
label {
  display: block;
  padding: 0.15rem 0;
}
select {
  font: inherit;
  margin-left: 0.25rem;
}
.counts,
.hint {
  color: var(--muted);
}
.summary {
  font-weight: 600;
}
button[type='submit'] {
  font: inherit;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
}
</style>
