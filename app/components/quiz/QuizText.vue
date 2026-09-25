<script setup lang="ts">
import type { InputQuestion, PatternQuestion } from '#shared/schemas'
import { checkText, type Verdict } from '~/utils/quiz'

const props = defineProps<{ question: InputQuestion | PatternQuestion }>()
const emit = defineEmits<{ answered: [verdict: Verdict] }>()

const { byId: patternsById } = usePatterns()
const inputId = useId()
const value = ref('')
const verdict = ref<Verdict | null>(null)

const hint = computed(() =>
  props.question.type === 'pattern'
    ? (patternsById.value.get(props.question.pattern) ?? null)
    : null,
)
const expected = computed(() =>
  Array.isArray(props.question.answer) ? (props.question.answer[0] ?? '') : props.question.answer,
)

function submit() {
  if (verdict.value || !value.value.trim()) return
  verdict.value = checkText(value.value, props.question.answer)
  emit('answered', verdict.value)
}
</script>

<template>
  <form class="quiz-text" @submit.prevent="submit">
    <label :for="inputId" class="quiz-q">{{ question.q }}</label>
    <p v-if="hint" class="quiz-hint">
      Подсказка: <span lang="pl">{{ hint.pl }}</span> ↔ {{ hint.ru }}
      <SpeakButton :text="hint.pl" />
    </p>
    <div class="row">
      <input
        :id="inputId"
        v-model="value"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        :disabled="verdict !== null"
      />
      <button type="submit" :disabled="verdict !== null">Проверить</button>
    </div>
    <QuizFeedback
      v-if="verdict"
      :verdict="verdict"
      :answer="expected"
      :explain="question.explain"
    />
  </form>
</template>

<style scoped>
.quiz-q {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}
.quiz-hint {
  margin: 0 0 0.35rem;
  color: var(--muted);
  font-size: 0.875rem;
}
.row {
  display: flex;
  gap: 0.5rem;
}
input {
  font: inherit;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--fg);
  min-width: 0;
  flex: 1 1 12rem;
  max-width: 20rem;
}
button {
  font: inherit;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
}
</style>
