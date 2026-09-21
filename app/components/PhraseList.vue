<script setup lang="ts">
import type { StoredPhrase } from '~/utils/progress'

defineProps<{ phrases: StoredPhrase[] }>()
const emit = defineEmits<{ remove: [id: string] }>()
</script>

<template>
  <details v-if="phrases.length > 0" class="phrase-list">
    <summary>Сохранённые фразы ({{ phrases.length }})</summary>
    <ul>
      <li v-for="phrase in phrases" :key="phrase.id">
        <span lang="pl">{{ phrase.pl }}</span>
        <span class="translation"> — {{ phrase.ru }}</span>
        <NuxtLink v-if="phrase.from" :to="`/slovo/${phrase.from}`" class="origin"
          >источник</NuxtLink
        >
        <button
          type="button"
          class="remove"
          :aria-label="`Удалить фразу: ${phrase.pl}`"
          @click="emit('remove', phrase.id)"
        >
          ✕
        </button>
      </li>
    </ul>
  </details>
</template>

<style scoped>
.phrase-list {
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
.translation {
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
