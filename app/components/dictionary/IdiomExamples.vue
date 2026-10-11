<script setup lang="ts">
import { idiomKey } from '#shared/idioms'

// The example sentences of one idiom, behind a toggle, each with audio and ⊕ to the
// «Фразы» flashcards — the same as a card's examples.
const props = defineProps<{ pl: string; from: string }>()

const all = useIdiomExamples()
const examples = computed(() => all.value[idiomKey(props.pl)] ?? [])
const open = ref(false)
</script>

<template>
  <span v-if="examples.length > 0" class="idiom-examples">
    <button type="button" class="toggle" :aria-expanded="open" @click="open = !open">
      {{ open ? 'скрыть примеры' : `примеры (${examples.length})` }}
    </button>
    <ul v-if="open">
      <li v-for="example in examples" :key="example.pl">
        <span lang="pl">{{ example.pl }}</span> — {{ example.ru }}
        <SpeakButton :text="example.pl" />
        <DictionarySaveSentence
          :pl="example.pl"
          :ru="example.ru"
          :source="example.source"
          :from="from"
          :form="null"
        />
      </li>
    </ul>
  </span>
</template>

<style scoped>
.toggle {
  font: inherit;
  font-size: 0.8em;
  margin-left: 0.25rem;
  padding: 0 0.4rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: none;
  color: var(--muted);
  cursor: pointer;
}
ul {
  margin: 0.35rem 0 0.5rem;
  padding-left: 1.25rem;
  font-weight: normal;
  font-style: normal;
  color: var(--fg);
}
li [lang='pl'] {
  color: var(--accent-pl);
}
</style>
