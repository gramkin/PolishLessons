<script setup lang="ts">
import type { TranslateQuestion } from '#shared/schemas'
import { checkSentence, type Verdict } from '~/utils/quiz'

const props = defineProps<{ question: TranslateQuestion }>()
const emit = defineEmits<{ answered: [verdict: Verdict] }>()

const inputId = useId()
const value = ref('')
const verdict = ref<Verdict | null>(null)
// A translation that matches none of the listed versions may still be right: Polish word
// order is free and synonyms abound. The learner compares it with the reference and decides,
// and only then is the question answered, so a score or a saved mistake never needs undoing.
const judging = ref(false)

const reference = computed(() =>
  Array.isArray(props.question.answer) ? (props.question.answer[0] ?? '') : props.question.answer,
)

function submit() {
  if (verdict.value || judging.value || !value.value.trim()) return
  const result = checkSentence(value.value, props.question.answer)
  if (result === 'wrong') {
    judging.value = true
    return
  }
  verdict.value = result
  emit('answered', result)
}

function judge(right: boolean) {
  judging.value = false
  verdict.value = right ? 'correct' : 'wrong'
  emit('answered', verdict.value)
}
</script>

<template>
  <form class="quiz-text quiz-translate" @submit.prevent="submit">
    <label :for="inputId" class="quiz-q">Переведите на польский: {{ question.q }}</label>
    <div class="row">
      <input
        :id="inputId"
        v-model="value"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        lang="pl"
        :disabled="verdict !== null || judging"
      />
      <button type="submit" :disabled="verdict !== null || judging">Проверить</button>
    </div>
    <div v-if="judging" class="quiz-judge" role="status">
      <p>
        Эталон: <span lang="pl">{{ reference }}</span>
        <SpeakButton :text="reference" />
      </p>
      <p class="quiz-judge-q">Ваш вариант тоже верен?</p>
      <div class="row">
        <button type="button" @click="judge(true)">Да, мой вариант верен</button>
        <button type="button" @click="judge(false)">Нет, я ошибся</button>
      </div>
    </div>
    <QuizFeedback
      v-if="verdict"
      :verdict="verdict"
      :answer="reference"
      :explain="question.explain"
    />
  </form>
</template>

<style scoped>
.quiz-q {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
input {
  flex: 1 1 14rem;
  font: inherit;
  padding: 0.3rem 0.5rem;
}
button {
  font: inherit;
  cursor: pointer;
}
.quiz-judge {
  margin-top: 0.5rem;
}
.quiz-judge p {
  margin: 0.25rem 0;
}
.quiz-judge span[lang='pl'] {
  color: var(--accent-pl);
}
.quiz-judge-q {
  color: var(--muted);
}
</style>
