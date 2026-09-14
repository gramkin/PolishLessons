<script setup lang="ts">
defineProps<{ path: string }>()
const { loaded, isLessonCompleted, markRead } = useProgress()
</script>

<template>
  <div class="lesson-done">
    <p v-if="isLessonCompleted(path)" class="done">✓ Урок пройден</p>
    <button v-else-if="loaded" type="button" @click="markRead(path)">Урок прочитан</button>
  </div>
</template>

<style scoped>
.lesson-done {
  margin: 3rem 0 1rem;
  text-align: center;
  min-height: 2.5rem;
}
.done {
  color: var(--cognate);
  font-weight: 600;
}
button {
  font: inherit;
  padding: 0.4rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--callout-bg);
  color: var(--fg);
  cursor: pointer;
}
</style>
