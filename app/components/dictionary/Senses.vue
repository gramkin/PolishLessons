<script setup lang="ts">
import type { Sense } from '#shared/dictionary'
import { highlightForms, tatoebaUrl } from '~/utils/dictionary'

defineProps<{ senses: Sense[]; allForms: string[]; cardId: string }>()
</script>

<template>
  <section id="znacheniya" aria-labelledby="znacheniya-title">
    <h2 id="znacheniya-title">Значения</h2>
    <ol class="senses">
      <li v-for="sense in senses" :key="sense.id" class="sense">
        <p class="sense-ru">{{ sense.ru }}</p>
        <p v-if="sense.note" class="sense-note">{{ sense.note }}</p>
        <ul class="examples">
          <li v-for="(example, i) in sense.examples" :key="i" class="example">
            <span lang="pl" class="example-pl">
              <template v-for="(segment, k) in highlightForms(example.pl, allForms)" :key="k">
                <strong v-if="segment.hl">{{ segment.text }}</strong>
                <template v-else>{{ segment.text }}</template>
              </template>
            </span>
            <span class="example-ru"> — {{ example.ru }}</span>
            <a
              v-if="example.source.kind === 'tatoeba'"
              class="badge is-reviewed"
              :href="tatoebaUrl(example.source.id)"
              target="_blank"
              rel="noopener"
              title="Предложение и перевод из Tatoeba"
              >✓ Tatoeba</a
            >
            <span v-else class="badge is-pending">на проверке</span>
            <DictionarySaveSentence
              :pl="example.pl"
              :ru="example.ru"
              :source="example.source"
              :from="cardId"
              :form="null"
            />
          </li>
        </ul>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.senses {
  padding-left: 1.25rem;
}
.sense-ru {
  font-weight: 600;
  margin: 0.75rem 0 0.25rem;
}
.sense-note {
  color: var(--muted);
  margin: 0 0 0.25rem;
}
.examples {
  list-style: none;
  padding: 0;
  margin: 0;
}
.example {
  margin: 0.25rem 0;
}
.example-pl {
  color: var(--accent-pl);
}
.example-ru {
  color: var(--fg);
}
.badge {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  padding: 0 0.4rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  white-space: nowrap;
}
.is-reviewed {
  color: var(--cognate);
}
.is-pending {
  color: var(--muted);
}
</style>
