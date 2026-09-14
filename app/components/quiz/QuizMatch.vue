<script setup lang="ts">
import type { MatchQuestion } from '#shared/schemas'
import { checkMatch, shuffle, type Verdict } from '~/utils/quiz'

const props = defineProps<{ question: MatchQuestion }>()
const emit = defineEmits<{ answered: [verdict: Verdict] }>()

const left = computed(() => props.question.pairs.map(([pl]) => pl))
const right = ref(props.question.pairs.map(([, ru]) => ru))
const active = ref<string | null>(null)
const selection = ref<Record<string, string>>({})
const verdict = ref<Verdict | null>(null)

const used = computed(() => new Set(Object.values(selection.value)))
const answer = computed(() => props.question.pairs.map(([pl, ru]) => `${pl} — ${ru}`).join(', '))

// Shuffle only on the client so the prerendered HTML matches the first render.
onMounted(() => {
  right.value = shuffle(right.value)
})

function pairOk(pl: string): boolean {
  return props.question.pairs.some(([p, r]) => p === pl && selection.value[pl] === r)
}

function pickLeft(pl: string) {
  if (verdict.value) return
  if (selection.value[pl]) {
    selection.value = Object.fromEntries(
      Object.entries(selection.value).filter(([key]) => key !== pl),
    )
    return
  }
  active.value = pl
}

function pickRight(ru: string) {
  if (verdict.value || !active.value || used.value.has(ru)) return
  selection.value = { ...selection.value, [active.value]: ru }
  active.value = null
  if (Object.keys(selection.value).length === props.question.pairs.length) {
    verdict.value = checkMatch(props.question, selection.value)
    emit('answered', verdict.value)
  }
}
</script>

<template>
  <div class="quiz-match">
    <p class="quiz-q">{{ question.q }}</p>
    <div class="columns">
      <ul>
        <li v-for="pl in left" :key="pl">
          <button
            type="button"
            lang="pl"
            :data-left="pl"
            :aria-pressed="active === pl"
            :class="{ ok: verdict && pairOk(pl), bad: verdict && !pairOk(pl) }"
            :disabled="verdict !== null"
            @click="pickLeft(pl)"
          >
            {{ pl }}<template v-if="selection[pl]"> → {{ selection[pl] }}</template>
          </button>
        </li>
      </ul>
      <ul>
        <li v-for="ru in right" :key="ru">
          <button
            type="button"
            :data-right="ru"
            :disabled="verdict !== null || used.has(ru)"
            @click="pickRight(ru)"
          >
            {{ ru }}
          </button>
        </li>
      </ul>
    </div>
    <QuizFeedback v-if="verdict" :verdict="verdict" :answer="answer" :explain="question.explain" />
  </div>
</template>

<style scoped>
.quiz-q {
  font-weight: 600;
  margin: 0 0 0.35rem;
}
.columns {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
button {
  font: inherit;
  text-align: left;
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--fg);
  cursor: pointer;
}
button[aria-pressed='true'] {
  border-color: var(--accent-pl);
  box-shadow: 0 0 0 1px var(--accent-pl);
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}
button.ok {
  border-color: var(--cognate);
  opacity: 1;
}
button.bad {
  border-color: var(--false-friend);
  opacity: 1;
}
</style>
