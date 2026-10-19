<script setup lang="ts">
import type { CardPos, FormExample, FormsTable } from '#shared/dictionary'

const props = withDefaults(
  defineProps<{
    tables: FormsTable[]
    formExamples: FormExample[]
    cardId: string
    negatedForms: string[]
    skipped?: { form: string; reason: string; cell?: string }[]
    pos?: CardPos
  }>(),
  { skipped: () => [], pos: undefined },
)

const main = computed(() => props.tables.filter((t) => !t.extra))
const extra = computed(() => props.tables.filter((t) => t.extra))
const byForm = computed(() => {
  const map: Record<string, FormExample[]> = {}
  for (const example of props.formExamples) {
    ;(map[example.form] ??= []).push(example)
  }
  return map
})
const groups = computed(() => Object.entries(byForm.value))
// A skip without `cell` covers the whole form; one with `cell` covers that row only.
const formSkips = computed(() => props.skipped.filter((item) => !item.cell))
const skippedByForm = computed(() =>
  Object.fromEntries(formSkips.value.map((item) => [item.form, item.reason])),
)
const skippedByRow = computed(() =>
  Object.fromEntries(
    props.skipped
      .filter((item) => item.cell)
      .map((item) => [`${item.cell}|${item.form}`, item.reason]),
  ),
)
// Forms shown in a table explain themselves there. What remains are forms that
// appear in no table at all — 7213 of them across 582 cards — so the list below
// stays, carrying only those.
const tableCells = computed(
  () => new Set(props.tables.flatMap((t) => t.rows.flatMap((r) => r.cells.flat()))),
)
const orphanSkips = computed(() => formSkips.value.filter((s) => !tableCells.value.has(s.form)))
</script>

<template>
  <section v-if="tables.length > 0" id="formy" aria-labelledby="formy-title">
    <h2 id="formy-title">Формы</h2>
    <DictionaryTable
      v-for="table in main"
      :key="table.title"
      :table="table"
      :examples="byForm"
      :card-id="cardId"
      :skipped="skippedByForm"
      :skipped-rows="skippedByRow"
      :pos="pos"
    />
    <details v-if="extra.length > 0" class="all-forms">
      <summary>Все формы</summary>
      <DictionaryTable
        v-for="table in extra"
        :key="table.title"
        :table="table"
        :examples="byForm"
        :card-id="cardId"
        :skipped="skippedByForm"
        :skipped-rows="skippedByRow"
        :pos="pos"
      />
    </details>
    <p v-if="negatedForms.length > 0" class="negation">
      Отрицание образуется приставкой <b lang="pl">nie</b>:
      <span lang="pl">{{ negatedForms.slice(0, 3).join(', ') }}</span
      >. Отдельных примеров для таких форм нет.
    </p>
    <ul v-if="orphanSkips.length > 0" class="skipped">
      <li v-for="item in orphanSkips" :key="item.form">
        <span lang="pl" class="form-name">{{ item.form }}</span> — {{ item.reason }}
      </li>
    </ul>
    <details v-if="formExamples.length > 0" class="form-example-list">
      <summary>Все примеры к формам ({{ formExamples.length }})</summary>
      <div v-for="[form, examples] in groups" :key="form" class="form-group">
        <p class="form-name" lang="pl">{{ form }}</p>
        <ul>
          <li v-for="example in examples" :key="example.pl">
            <span lang="pl">{{ example.pl }}</span>
            <span v-if="example.cell" class="cell-tag"> ({{ example.cell.toLowerCase() }})</span>
            <SpeakButton :text="example.pl" />
            <span class="translation"> — {{ example.ru }}</span>
            <DictionarySaveSentence
              :pl="example.pl"
              :ru="example.ru"
              :source="example.source"
              :from="cardId"
              :form="example.form"
            />
          </li>
        </ul>
      </div>
    </details>
  </section>
</template>

<style scoped>
.skipped {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
  color: var(--muted);
  font-size: 0.9375rem;
}
.all-forms,
.form-example-list {
  margin: 1rem 0;
}
summary {
  cursor: pointer;
  font-weight: 600;
}
.negation {
  color: var(--muted);
}
.form-group {
  margin: 0.5rem 0;
}
.form-example-list ul {
  list-style: none;
  padding: 0 0 0 1rem;
  margin: 0.15rem 0;
}
.form-example-list li {
  padding: 0.1rem 0;
}
.form-name {
  font-weight: 600;
  color: var(--accent-pl);
  margin: 0;
}
.translation,
.cell-tag {
  color: var(--muted);
}
</style>
