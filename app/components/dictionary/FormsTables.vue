<script setup lang="ts">
import type { FormExample, FormsTable } from '#shared/dictionary'

const props = defineProps<{
  tables: FormsTable[]
  formExamples: FormExample[]
  cardId: string
  negatedForms: string[]
}>()

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
    />
    <details v-if="extra.length > 0" class="all-forms">
      <summary>Все формы</summary>
      <DictionaryTable
        v-for="table in extra"
        :key="table.title"
        :table="table"
        :examples="byForm"
        :card-id="cardId"
      />
    </details>
    <p v-if="negatedForms.length > 0" class="negation">
      Отрицание образуется приставкой <b lang="pl">nie</b>:
      <span lang="pl">{{ negatedForms.slice(0, 3).join(', ') }}</span
      >. Отдельных примеров для таких форм нет.
    </p>
    <details v-if="formExamples.length > 0" class="form-example-list">
      <summary>Все примеры к формам ({{ formExamples.length }})</summary>
      <div v-for="[form, examples] in groups" :key="form" class="form-group">
        <p class="form-name" lang="pl">{{ form }}</p>
        <ul>
          <li v-for="example in examples" :key="example.pl">
            <span lang="pl">{{ example.pl }}</span>
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
.translation {
  color: var(--muted);
}
</style>
