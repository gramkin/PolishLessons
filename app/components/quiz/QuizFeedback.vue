<script setup lang="ts">
import type { Verdict } from '~/utils/quiz'

defineProps<{ verdict: Verdict; answer: string; explain?: string }>()
</script>

<template>
  <div class="quiz-feedback" :class="`is-${verdict}`" role="status">
    <strong v-if="verdict === 'correct'">Верно!</strong>
    <strong v-else-if="verdict === 'almost'"
      >Почти! Правильно: <span lang="pl">{{ answer }}</span></strong
    >
    <strong v-else
      >Неверно. Правильный ответ: <span lang="pl">{{ answer }}</span></strong
    >
    <p v-if="explain" class="explain">{{ explain }}</p>
  </div>
</template>

<style scoped>
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
