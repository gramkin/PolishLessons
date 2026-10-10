<script setup lang="ts">
import { quizSchema, type Question } from '#shared/schemas'
import { normalizePath } from '~/utils/nav'
import { PASS_PERCENT, scoreQuiz, type Verdict } from '~/utils/quiz'
import { LESSON_TITLE_KEY } from '~/utils/mistakes'

const props = defineProps<{ questions: unknown; final?: boolean }>()

const route = useRoute()
const { recordQuiz, recordMistake } = useProgress()
const lessonTitle = inject(LESSON_TITLE_KEY, null)
const isDev = import.meta.dev

const parsed = computed(() => quizSchema.safeParse(props.questions))
const list = computed<Question[]>(() => (parsed.value.success ? parsed.value.data : []))
const errors = computed(() =>
  parsed.value.success
    ? []
    : parsed.value.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
)

const attempt = ref(0)
const verdicts = ref<(Verdict | null)[]>([])

watch(
  [list, attempt],
  () => {
    verdicts.value = list.value.map(() => null)
  },
  { immediate: true },
)

const done = computed(() => verdicts.value.length > 0 && verdicts.value.every((v) => v !== null))
const score = computed(() => scoreQuiz(verdicts.value.filter((v): v is Verdict => v !== null)))

function onAnswered(index: number, verdict: Verdict) {
  const next = [...verdicts.value]
  next[index] = verdict
  verdicts.value = next
  const question = list.value[index]
  if (verdict === 'wrong' && question) {
    const path = normalizePath(route.path)
    recordMistake(question, { kind: 'lesson', path, title: lessonTitle?.value || path })
  }
  if (props.final && next.every((v) => v !== null)) {
    recordQuiz(normalizePath(route.path), scoreQuiz(next as Verdict[]).percent)
  }
}
</script>

<template>
  <section v-if="list.length > 0" :key="attempt" class="quiz" aria-label="Упражнение">
    <ol class="quiz-questions">
      <li v-for="(question, i) in list" :key="i" class="quiz-question">
        <QuizChoice
          v-if="question.type === 'choice'"
          :question="question"
          @answered="onAnswered(i, $event)"
        />
        <QuizText
          v-else-if="question.type === 'input' || question.type === 'pattern'"
          :question="question"
          @answered="onAnswered(i, $event)"
        />
        <QuizTranslate
          v-else-if="question.type === 'translate'"
          :question="question"
          @answered="onAnswered(i, $event)"
        />
        <QuizListen
          v-else-if="question.type === 'listen'"
          :question="question"
          @answered="onAnswered(i, $event)"
        />
        <QuizMatch v-else :question="question" @answered="onAnswered(i, $event)" />
      </li>
    </ol>
    <div v-if="done" class="quiz-summary" role="status">
      <strong>{{ score.correct }} из {{ score.total }}</strong>
      <span v-if="final && score.passed"> — урок пройден!</span>
      <span v-else-if="final"> — нужно {{ PASS_PERCENT }}%, попробуйте ещё раз.</span>
      <button type="button" @click="attempt++">Пройти ещё раз</button>
    </div>
  </section>
  <div v-else-if="isDev" class="quiz-error">
    Ошибка в упражнении:
    <ul>
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<style scoped>
.quiz {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1rem 1.25rem;
  margin: 2rem 0;
}
.quiz-questions {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.quiz-summary {
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.quiz-summary button {
  font: inherit;
  margin-left: auto;
  cursor: pointer;
}
.quiz-error {
  color: #fff;
  background: #c62828;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}
</style>
