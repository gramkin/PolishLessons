<script setup lang="ts">
import type { ChoiceQuestion } from '#shared/schemas'
import { checkChoice, type Verdict } from '~/utils/quiz'

const props = defineProps<{ question: ChoiceQuestion }>()
const emit = defineEmits<{ answered: [verdict: Verdict] }>()

const { supported, speak, recordingFor } = useSpeech()
const name = useId()
// A listening question plays its Polish; without a voice the learner reads it instead.
const playable = computed(
  () => !!props.question.say && (supported.value || recordingFor(props.question.say) !== null),
)
const settled = ref(false)
onMounted(() => setTimeout(() => (settled.value = true), 1000))
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
    <p v-if="question.say && playable" class="quiz-play">
      <button type="button" class="play" @click="speak(question.say)">🔊 Прослушать</button>
    </p>
    <p v-else-if="question.say && settled" class="quiz-no-audio">
      Польского голоса в браузере нет, прочитайте текст:
      <span lang="pl">{{ question.say }}</span>
    </p>
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
.quiz-play,
.quiz-no-audio {
  margin: 0 0 0.5rem;
}
.quiz-no-audio {
  color: var(--muted);
}
.play {
  font: inherit;
  cursor: pointer;
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
