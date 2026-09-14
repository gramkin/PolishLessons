<script setup lang="ts">
import { highlightGroup } from '~/utils/pattern'

const props = defineProps<{ pattern: string }>()

const { words } = useWords()
const { byId: patternsById } = usePatterns()

const pattern = computed(() => patternsById.value.get(props.pattern) ?? null)

const rows = computed(() => {
  const p = pattern.value
  if (!p) return []
  return words.value
    .filter((w) => w.pattern === p.id)
    .sort((a, b) => a.pl.localeCompare(b.pl, 'pl'))
    .map((w) => ({
      id: w.id,
      text: w.pl,
      pl: highlightGroup(w.pl, p.pl),
      ru: highlightGroup(w.ru, p.ru),
      pron: w.pron,
    }))
})
</script>

<template>
  <figure v-if="pattern" class="cognate-list">
    <figcaption class="callout">
      <strong><span lang="pl">{{ pattern.pl }}</span> ↔ {{ pattern.ru }}</strong> —
      {{ pattern.rule }}
    </figcaption>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Таблица соответствий">
      <table>
        <thead>
          <tr>
            <th scope="col">Польский</th>
            <th scope="col">Русский</th>
            <th scope="col">Произношение</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td lang="pl" class="pl">
              <template v-for="(segment, i) in row.pl" :key="i">
                <mark v-if="segment.hl">{{ segment.text }}</mark>
                <template v-else>{{ segment.text }}</template>
              </template>
              <SpeakButton :text="row.text" />
            </td>
            <td>
              <template v-for="(segment, i) in row.ru" :key="i">
                <mark v-if="segment.hl">{{ segment.text }}</mark>
                <template v-else>{{ segment.text }}</template>
              </template>
            </td>
            <td class="pron">[{{ row.pron }}]</td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
</template>

<style scoped>
.cognate-list {
  margin: 1.5rem 0;
}
.pl {
  color: var(--accent-pl);
  font-weight: 600;
}
mark {
  background: var(--highlight);
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}
.pron {
  color: var(--muted);
  font-style: italic;
}
</style>
