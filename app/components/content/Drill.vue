<script setup lang="ts">
import type { InputQuestion, ListenQuestion } from '#shared/schemas'
import { BLANK, sampleItems, type DrillFile, type DrillItem } from '~/utils/drill'
import { scoreQuiz, type Verdict } from '~/utils/quiz'
import { LESSON_TITLE_KEY } from '~/utils/mistakes'
import { normalizePath } from '~/utils/nav'

const SESSION = 10
// Dictation keeps to short sentences: a long one tests memory span, not hearing.
const LISTEN_MAX_WORDS = 6

const props = defineProps<{ id: string }>()
const { app } = useRuntimeConfig()
const route = useRoute()
const { recordMistake } = useProgress()
const lessonTitle = inject(LESSON_TITLE_KEY, null)

// Loaded on the first click: a drill file is tens of kilobytes the page does not need until then.
const file = shallowRef<DrillFile | null>(null)
const loading = ref(false)
const failed = ref(false)
const session = ref<DrillItem[]>([])
const verdicts = ref<(Verdict | null)[]>([])
const round = ref(0)
const mode = ref<'fill' | 'listen'>('fill')

async function start(next: 'fill' | 'listen' = mode.value) {
  mode.value = next
  if (!file.value) {
    loading.value = true
    failed.value = false
    try {
      file.value = await $fetch<DrillFile>(`${app.baseURL.replace(/\/$/, '')}/drills/${props.id}.json`)
    } catch {
      failed.value = true
    } finally {
      loading.value = false
    }
  }
  if (!file.value) return
  const pool =
    mode.value === 'listen'
      ? file.value.items.filter((i) => fullSentence(i).split(/\s+/).length <= LISTEN_MAX_WORDS)
      : file.value.items
  session.value = sampleItems(pool, SESSION)
  verdicts.value = session.value.map(() => null)
  round.value++
}

function fullSentence(item: DrillItem): string {
  return item.pl.replace(BLANK, item.answer)
}

const questions = computed<(InputQuestion | ListenQuestion)[]>(() =>
  session.value.map((item) =>
    mode.value === 'listen'
      ? { type: 'listen', q: 'Напишите, что услышите.', text: fullSentence(item), explain: item.ru }
      : { type: 'input', q: `${item.pl} (${item.hint})`, answer: item.answer, explain: item.ru },
  ),
)

function onAnswered(index: number, verdict: Verdict) {
  const next = [...verdicts.value]
  next[index] = verdict
  verdicts.value = next
  const item = session.value[index]
  const question = questions.value[index]
  if (verdict === 'wrong' && item && question) {
    const path = normalizePath(route.path)
    const title = `${lessonTitle?.value || path} · Тренажёр`
    recordMistake(question, { kind: 'drill', path, title, card: item.card })
  }
}

const done = computed(() => verdicts.value.length > 0 && verdicts.value.every((v) => v !== null))
const score = computed(() => scoreQuiz(verdicts.value.filter((v): v is Verdict => v !== null)))
</script>

<template>
  <section class="drill" aria-label="Тренажёр">
    <p class="drill-title">
      <strong>Тренажёр{{ file ? `: ${file.title}` : '' }}</strong>
    </p>
    <p class="drill-instruction">
      {{
        session.length > 0 && mode === 'listen'
          ? 'Прослушайте предложение и запишите его целиком.'
          : (file?.instruction ?? 'Десять предложений из словаря — каждый раз новые.')
      }}
    </p>
    <div v-if="session.length === 0" class="drill-start">
      <button type="button" :disabled="loading" @click="start('fill')">
        {{ loading ? 'Загружаю…' : 'Начать' }}
      </button>
      <button type="button" :disabled="loading" @click="start('listen')">На слух</button>
    </div>
    <p v-if="failed" class="drill-error" role="alert">Не удалось загрузить предложения.</p>
    <ol v-if="session.length > 0" :key="round" class="drill-questions">
      <li v-for="(item, i) in session" :key="i" class="drill-question">
        <QuizListen
          v-if="questions[i]?.type === 'listen'"
          :question="questions[i] as ListenQuestion"
          @answered="onAnswered(i, $event)"
        />
        <QuizText
          v-else
          :question="questions[i] as InputQuestion"
          @answered="onAnswered(i, $event)"
        />
        <NuxtLink v-if="verdicts[i]" :to="`/slovo/${item.card}`" class="drill-card"
          >карточка слова</NuxtLink
        >
      </li>
    </ol>
    <div v-if="done" class="drill-summary" role="status">
      <strong>{{ score.correct }} из {{ score.total }}</strong>
      <button type="button" @click="start(mode)">Ещё {{ SESSION }}</button>
      <button type="button" @click="start(mode === 'listen' ? 'fill' : 'listen')">
        {{ mode === 'listen' ? 'С пропуском' : 'На слух' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.drill {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1rem 1.25rem;
  margin: 2rem 0;
}
.drill-title,
.drill-instruction {
  margin: 0 0 0.5rem;
}
.drill-instruction {
  color: var(--muted);
}
.drill button {
  font: inherit;
  cursor: pointer;
}
.drill-questions {
  margin: 1rem 0 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.drill-card {
  display: inline-block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
.drill-summary {
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.drill-summary button:first-of-type {
  margin-left: auto;
}
.drill-start {
  display: flex;
  gap: 0.5rem;
}
.drill-error {
  color: var(--false-friend);
}
</style>
