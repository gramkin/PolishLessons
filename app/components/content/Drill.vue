<script setup lang="ts">
import type { InputQuestion } from '#shared/schemas'
import { sampleItems, type DrillFile, type DrillItem } from '~/utils/drill'
import { scoreQuiz, type Verdict } from '~/utils/quiz'

const SESSION = 10

const props = defineProps<{ id: string }>()
const { app } = useRuntimeConfig()

// Loaded on the first click: a drill file is tens of kilobytes the page does not need until then.
const file = shallowRef<DrillFile | null>(null)
const loading = ref(false)
const failed = ref(false)
const session = ref<DrillItem[]>([])
const verdicts = ref<(Verdict | null)[]>([])
const round = ref(0)

async function start() {
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
  session.value = sampleItems(file.value.items, SESSION)
  verdicts.value = session.value.map(() => null)
  round.value++
}

const questions = computed<InputQuestion[]>(() =>
  session.value.map((item) => ({
    type: 'input',
    q: `${item.pl} (${item.hint})`,
    answer: item.answer,
    explain: item.ru,
  })),
)

function onAnswered(index: number, verdict: Verdict) {
  const next = [...verdicts.value]
  next[index] = verdict
  verdicts.value = next
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
      {{ file?.instruction ?? 'Десять предложений из словаря — каждый раз новые.' }}
    </p>
    <button v-if="session.length === 0" type="button" :disabled="loading" @click="start">
      {{ loading ? 'Загружаю…' : 'Начать' }}
    </button>
    <p v-if="failed" class="drill-error" role="alert">Не удалось загрузить предложения.</p>
    <ol v-if="session.length > 0" :key="round" class="drill-questions">
      <li v-for="(item, i) in session" :key="i" class="drill-question">
        <QuizText :question="questions[i]!" @answered="onAnswered(i, $event)" />
        <NuxtLink v-if="verdicts[i]" :to="`/slovo/${item.card}`" class="drill-card"
          >карточка слова</NuxtLink
        >
      </li>
    </ol>
    <div v-if="done" class="drill-summary" role="status">
      <strong>{{ score.correct }} из {{ score.total }}</strong>
      <button type="button" @click="start">Ещё {{ SESSION }}</button>
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
.drill-summary button {
  margin-left: auto;
}
.drill-error {
  color: var(--false-friend);
}
</style>
