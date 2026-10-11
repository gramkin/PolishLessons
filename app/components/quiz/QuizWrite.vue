<script setup lang="ts">
import type { WriteQuestion } from '#shared/schemas'
import { writeVerdict, type Verdict } from '~/utils/quiz'

const props = defineProps<{ question: WriteQuestion }>()
const emit = defineEmits<{ answered: [verdict: Verdict] }>()

const textId = useId()
const value = ref('')
// A free text has no single right answer. The model appears only once something is written, so
// it is compared with, not copied; the learner then ticks what their text covers.
const showModel = ref(false)
const ticked = ref<boolean[]>(props.question.checklist.map(() => false))
const verdict = ref<Verdict | null>(null)
const tickedCount = computed(() => ticked.value.filter(Boolean).length)

function submit() {
  if (showModel.value || !value.value.trim()) return
  showModel.value = true
}

function done() {
  if (verdict.value) return
  verdict.value = writeVerdict(tickedCount.value, props.question.checklist.length)
  emit('answered', verdict.value)
}
</script>

<template>
  <form class="quiz-write" @submit.prevent="submit">
    <label :for="textId" class="quiz-q">{{ question.q }}</label>
    <textarea
      :id="textId"
      v-model="value"
      rows="8"
      lang="pl"
      autocapitalize="off"
      spellcheck="false"
      :disabled="showModel"
    />
    <button v-if="!showModel" type="submit">Показать образец</button>
    <div v-else class="quiz-write-check">
      <p class="label">Образец:</p>
      <p class="model">
        <span lang="pl">{{ question.model }}</span>
        <SpeakButton :text="question.model" />
      </p>
      <p class="label">Что есть в вашем тексте?</p>
      <ul>
        <li v-for="(point, i) in question.checklist" :key="i">
          <label>
            <input v-model="ticked[i]" type="checkbox" :disabled="verdict !== null" />
            {{ point }}
          </label>
        </li>
      </ul>
      <button v-if="!verdict" type="button" class="quiz-write-done" @click="done">Готово</button>
      <div v-else class="quiz-feedback" :class="`is-${verdict}`" role="status">
        <strong
          >Отмечено {{ tickedCount }} из {{ question.checklist.length
          }}{{
            verdict === 'correct' ? ' — отлично!' : verdict === 'almost' ? ' — почти.' : '.'
          }}</strong
        >
        <p v-if="question.explain" class="explain">{{ question.explain }}</p>
      </div>
    </div>
  </form>
</template>

<style scoped>
.quiz-q {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
textarea {
  box-sizing: border-box;
  width: 100%;
  font: inherit;
  padding: 0.4rem 0.5rem;
}
button {
  font: inherit;
  cursor: pointer;
  margin-top: 0.5rem;
}
.quiz-write-check .label {
  margin: 0.75rem 0 0.25rem;
  color: var(--muted);
}
.model {
  margin: 0;
  white-space: pre-line;
}
.model span[lang='pl'] {
  color: var(--accent-pl);
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  margin: 0.2rem 0;
}
.quiz-feedback {
  margin-top: 0.5rem;
  font-size: 0.925rem;
}
.is-correct strong {
  color: var(--cognate);
}
.is-almost strong {
  color: var(--accent-pl);
}
.is-wrong strong {
  color: var(--false-friend);
}
.explain {
  margin: 0.25rem 0 0;
  color: var(--muted);
}
</style>
