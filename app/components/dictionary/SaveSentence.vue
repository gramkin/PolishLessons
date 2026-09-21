<script setup lang="ts">
import type { ExampleSource } from '#shared/dictionary'
import { phraseId, toPhrase } from '~/utils/phrases'

const props = defineProps<{
  pl: string
  ru: string
  source: ExampleSource
  from: string
  form?: string | null
}>()

const { loaded, hasPhrase, savePhrase, deletePhrase } = useProgress()
const id = computed(() => phraseId({ pl: props.pl, source: props.source }))
const saved = computed(() => hasPhrase(id.value))

function toggle() {
  if (saved.value) {
    deletePhrase(id.value)
    return
  }
  savePhrase(toPhrase(props, { from: props.from, form: props.form ?? null, now: new Date() }))
}
</script>

<template>
  <button
    v-if="loaded"
    type="button"
    class="save-sentence"
    :class="{ saved }"
    :aria-pressed="saved"
    :title="saved ? 'Убрать из списка фраз' : 'Добавить в список фраз'"
    @click.stop="toggle"
  >
    <span aria-hidden="true">{{ saved ? '✓' : '⊕' }}</span>
    <span class="sr-only">{{ saved ? 'В списке фраз' : 'В список фраз' }}</span>
  </button>
</template>

<style scoped>
.save-sentence {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  font-size: 0.9em;
  padding: 0 0.25em;
}
.save-sentence.saved {
  color: var(--cognate);
}
</style>
