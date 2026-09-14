<script setup lang="ts">
import type { ChoiceQuestion } from '#shared/schemas'
import { checkChoice, type Verdict } from '~/utils/quiz'

const props = defineProps<{ question: ChoiceQuestion }>()
const emit = defineEmits<{ answered: [verdict: Verdict] }>()

const name = useId()
const selected = ref<number | null>(null)
const verdict = ref<Verdict | null>(null)

function choose(index: number) {
  if (verdict.value) return
  selected.value = index
  verdict.value = checkChoice(props.question, index)
  emit('answered', verdict.value)
}
</script>

<template>
  <fieldset class="quiz-choice">
    <legend>{{ question.q }}</legend>
    <label
      v-for="(option, i) in question.options"
      :key="i"
      class="option"
      :class="{
        correct: verdict !== null && i === question.answer,
        wrong: verdict === 'wrong' && i === selected,
      }"
    >
      <input
        type="radio"
        :name="name"
        :checked="selected === i"
        :disabled="verdict !== null"
        @change="choose(i)"
      />
      {{ option }}
    </label>
    <QuizFeedback
      v-if="verdict"
      :verdict="verdict"
      :answer="question.options[question.answer] ?? ''"
      :explain="question.explain"
    />
  </fieldset>
</template>

<style scoped>
.quiz-choice {
  border: none;
  padding: 0;
  margin: 0;
}
legend {
  font-weight: 600;
  margin-bottom: 0.35rem;
}
.option {
  display: block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}
.option.correct {
  background: color-mix(in srgb, var(--cognate) 15%, transparent);
}
.option.wrong {
  background: color-mix(in srgb, var(--false-friend) 15%, transparent);
}
</style>
