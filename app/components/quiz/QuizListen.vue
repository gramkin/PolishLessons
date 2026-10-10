<script setup lang="ts">
import type { ListenQuestion } from '#shared/schemas'
import { checkSentence, type Verdict } from '~/utils/quiz'

const props = defineProps<{ question: ListenQuestion }>()
const emit = defineEmits<{ answered: [verdict: Verdict] }>()

const { supported, speak, recordingFor } = useSpeech()
const inputId = useId()
const value = ref('')
const verdict = ref<Verdict | null>(null)

// A recording for the word, or a Polish system voice for anything else; without either the
// question cannot be asked, and it is skipped rather than counted against the learner.
const playable = computed(() => supported.value || recordingFor(props.question.text) !== null)
// Voices and recordings arrive just after mount; wait before calling the audio missing.
const settled = ref(false)
onMounted(() => setTimeout(() => (settled.value = true), 1000))

function play() {
  speak(props.question.text)
}

function submit() {
  if (verdict.value || !value.value.trim()) return
  verdict.value = checkSentence(value.value, props.question.text)
  emit('answered', verdict.value)
}

function skip() {
  if (verdict.value) return
  verdict.value = 'skipped'
  emit('answered', 'skipped')
}
</script>

<template>
  <form class="quiz-text quiz-listen" @submit.prevent="submit">
    <label :for="inputId" class="quiz-q">{{ question.q }}</label>
    <p v-if="playable" class="quiz-play">
      <button type="button" class="play" aria-label="Прослушать" @click="play">
        🔊 Прослушать
      </button>
    </p>
    <p v-else-if="settled && verdict === null" class="quiz-no-audio">
      В этом браузере нет польского голоса, поэтому задание на слух недоступно.
      <button type="button" @click="skip">Пропустить</button>
    </p>
    <div class="row">
      <input
        :id="inputId"
        v-model="value"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        lang="pl"
        :disabled="verdict !== null"
      />
      <button type="submit" :disabled="verdict !== null">Проверить</button>
    </div>
    <QuizFeedback
      v-if="verdict && verdict !== 'skipped'"
      :verdict="verdict"
      :answer="question.text"
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
.quiz-play,
.quiz-no-audio {
  margin: 0 0 0.5rem;
}
.quiz-no-audio {
  color: var(--muted);
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
</style>
