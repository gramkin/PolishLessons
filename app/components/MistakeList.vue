<script setup lang="ts">
import type { Mistake } from '~/utils/mistakes'

defineProps<{ mistakes: Mistake[] }>()
const emit = defineEmits<{ remove: [id: string] }>()

function answerOf(m: Mistake): string {
  const q = m.question
  if (q.type === 'choice') return q.options[q.answer] ?? ''
  if (q.type === 'match') return ''
  if (q.type === 'listen') return q.text
  return Array.isArray(q.answer) ? (q.answer[0] ?? '') : q.answer
}
</script>

<template>
  <details v-if="mistakes.length > 0" class="mistake-list">
    <summary>Все ошибки ({{ mistakes.length }})</summary>
    <ul>
      <li v-for="m in mistakes" :key="m.id">
        <span class="q">{{ m.question.q }}</span>
        <span class="answer">
          — <span lang="pl">{{ answerOf(m) }}</span></span
        >
        <NuxtLink :to="m.source.path" class="origin">{{ m.source.title }}</NuxtLink>
        <button
          type="button"
          class="remove"
          :aria-label="`Удалить ошибку: ${m.question.q}`"
          @click="emit('remove', m.id)"
        >
          ✕
        </button>
      </li>
    </ul>
  </details>
</template>

<style scoped>
.mistake-list {
  margin: 1rem 0;
}
summary {
  cursor: pointer;
  font-weight: 600;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 0.2rem 0;
}
span[lang='pl'] {
  color: var(--accent-pl);
}
.answer,
.origin {
  color: var(--muted);
}
.origin {
  margin-left: 0.5rem;
  font-size: 0.8em;
}
.remove {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
}
</style>
