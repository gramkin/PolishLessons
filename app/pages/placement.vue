<script setup lang="ts">
import { questionSchema, type Question } from '#shared/schemas'
import { placementResult } from '~/utils/placement'
import type { Verdict } from '~/utils/quiz'

useSeoMeta({
  title: 'Тест на уровень',
  description: 'Короткий тест: уже знаете немного польского? Узнайте, с какой главы курса начать.',
})

const { data: file } = await useAsyncData('content:placement', () =>
  queryCollection('placement').first(),
)
const { nav, ready } = useLessonNav()
await ready
const { markRead } = useProgress()

// Each stored question carries the chapter it checks; the rest is an ordinary quiz question.
const items = computed(() =>
  (file.value?.questions ?? []).flatMap((raw) => {
    const { chapter, ...rest } = raw as Record<string, unknown>
    const parsed = questionSchema.safeParse(rest)
    return parsed.success && typeof chapter === 'number'
      ? [{ chapter, question: parsed.data as Question }]
      : []
  }),
)
const verdicts = ref<(Verdict | null)[]>([])
watch(items, (list) => (verdicts.value = list.map(() => null)), { immediate: true })
const answered = computed(() => verdicts.value.filter((v) => v !== null).length)
const finished = ref(false)

const lastChapter = computed(() => Math.max(0, ...nav.value.map((c) => c.number)))
const result = computed(() =>
  placementResult(
    items.value.map((i) => i.chapter),
    verdicts.value,
    lastChapter.value,
  ),
)
const chapterOf = (n: number) => nav.value.find((c) => c.number === n)
const startChapter = computed(() => chapterOf(result.value.start))
const earlierLessons = computed(() =>
  nav.value.filter((c) => c.number < result.value.start).flatMap((c) => c.lessons),
)
const marked = ref(false)

function onAnswered(index: number, verdict: Verdict) {
  const next = [...verdicts.value]
  next[index] = verdict
  verdicts.value = next
}

function markEarlier() {
  for (const lesson of earlierLessons.value) markRead(lesson.path)
  marked.value = true
}
</script>

<template>
  <article class="content placement">
    <h1>Тест на уровень</h1>
    <p v-if="file?.intro">{{ file.intro }}</p>
    <ol v-if="!finished" class="quiz-questions">
      <li v-for="(item, i) in items" :key="i" class="quiz-question">
        <QuizChoice
          v-if="item.question.type === 'choice'"
          :question="item.question"
          @answered="onAnswered(i, $event)"
        />
        <QuizText
          v-else-if="item.question.type === 'input' || item.question.type === 'pattern'"
          :question="item.question"
          @answered="onAnswered(i, $event)"
        />
        <QuizTranslate
          v-else-if="item.question.type === 'translate'"
          :question="item.question"
          @answered="onAnswered(i, $event)"
        />
        <QuizListen
          v-else-if="item.question.type === 'listen'"
          :question="item.question"
          @answered="onAnswered(i, $event)"
        />
        <QuizWrite
          v-else-if="item.question.type === 'write'"
          :question="item.question"
          @answered="onAnswered(i, $event)"
        />
        <QuizMatch v-else :question="item.question" @answered="onAnswered(i, $event)" />
      </li>
    </ol>
    <p v-if="!finished" class="progress-line">
      Отвечено {{ answered }} из {{ items.length }}.
      <button type="button" class="finish" @click="finished = true">Показать результат</button>
    </p>

    <section v-else class="result" role="status">
      <h2>Результат</h2>
      <p v-if="startChapter && result.start < lastChapter" class="recommendation">
        Начните с главы {{ result.start }} «{{ startChapter.title }}»:
        <NuxtLink :to="startChapter.lessons[0]?.path"
          >{{ startChapter.lessons[0]?.label }} {{ startChapter.lessons[0]?.title }}</NuxtLink
        >.
      </p>
      <p v-else class="recommendation">
        Материал курса вам знаком. Проверьте себя в
        <NuxtLink :to="startChapter?.lessons[0]?.path">итоговых тестах</NuxtLink>.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Глава</th>
            <th scope="col">Верно</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in result.byChapter" :key="s.chapter">
            <td>{{ s.chapter }}. {{ chapterOf(s.chapter)?.title }}</td>
            <td>{{ s.correct }} из {{ s.total }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="earlierLessons.length > 0">
        <button v-if="!marked" type="button" @click="markEarlier">
          Отметить уроки глав 1–{{ result.start - 1 }} как пройденные
        </button>
        <span v-else>✓ Отмечено: {{ earlierLessons.length }} уроков.</span>
      </p>
      <button type="button" @click="finished = false">Вернуться к вопросам</button>
    </section>
  </article>
</template>

<style scoped>
.quiz-questions {
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.progress-line {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
button {
  font: inherit;
  cursor: pointer;
}
.recommendation {
  font-size: 1.1em;
  font-weight: 600;
}
</style>
