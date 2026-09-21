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
const byForm = computed(() => Object.fromEntries(props.formExamples.map((e) => [e.form, e])))
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
      <ul>
        <li v-for="example in formExamples" :key="example.form">
          <span lang="pl" class="form-name">{{ example.form }}</span>
          <span lang="pl"> — {{ example.pl }}</span>
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
.form-example-list ul {
  list-style: none;
  padding: 0;
}
.form-example-list li {
  padding: 0.15rem 0;
}
.form-name {
  font-weight: 600;
  color: var(--accent-pl);
}
.translation {
  color: var(--muted);
}
</style>
