<script setup lang="ts">
import type { Mistake } from '~/utils/mistakes'
import type { Verdict } from '~/utils/quiz'

// Mistakes are questions, so they are answered again, not flipped and self-graded like word cards.
const props = defineProps<{ items: Mistake[] }>()
const emit = defineEmits<{
  review: [id: string, correct: boolean]
  finish: [result: { remembered: number; forgotten: number }]
}>()

const verdicts = ref<(Verdict | null)[]>(props.items.map(() => null))

function onAnswered(index: number, verdict: Verdict) {
  const item = props.items[index]
  if (!item || verdicts.value[index]) return
  const next = [...verdicts.value]
  next[index] = verdict
  verdicts.value = next
  // An "almost" (a missing diacritic) counts as right, as it does in the lesson. A skipped
  // dictation (no audio here) leaves the item as it was.
  if (verdict !== 'skipped') emit('review', item.id, verdict !== 'wrong')
}

const done = computed(() => verdicts.value.every((v) => v !== null))
const remembered = computed(
  () => verdicts.value.filter((v) => v && v !== 'wrong' && v !== 'skipped').length,
)

function finish() {
  const forgotten = verdicts.value.filter((v) => v === 'wrong').length
  emit('finish', { remembered: remembered.value, forgotten })
}
</script>

<template>
  <section class="mistake-session" aria-label="Повторение ошибок">
    <ol class="mistake-questions">
      <li v-for="(item, i) in items" :key="item.id" class="mistake-question">
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
        <p v-if="verdicts[i]" class="mistake-source">
          <NuxtLink :to="item.source.path">{{ item.source.title }}</NuxtLink>
          <template v-if="item.source.card">
            · <NuxtLink :to="`/slovo/${item.source.card}`">карточка слова</NuxtLink>
          </template>
        </p>
      </li>
    </ol>
    <div v-if="done" class="mistake-summary" role="status">
      <strong>{{ remembered }} из {{ items.length }}</strong>
      <button type="button" @click="finish">Готово</button>
    </div>
  </section>
</template>

<style scoped>
.mistake-session {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1rem 1.25rem;
}
.mistake-questions {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.mistake-source {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
}
.mistake-summary {
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.mistake-summary button {
  font: inherit;
  margin-left: auto;
  cursor: pointer;
}
</style>
