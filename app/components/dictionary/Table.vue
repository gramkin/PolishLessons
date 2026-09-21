<script setup lang="ts">
import type { FormExample, FormsTable } from '#shared/dictionary'
import { highlightForms } from '~/utils/dictionary'

const props = defineProps<{
  table: FormsTable
  examples?: Record<string, FormExample[]>
  cardId?: string
}>()

const selected = ref<string | null>(null)
const panelId = useId()
const shown = computed(() => (selected.value ? (props.examples?.[selected.value] ?? []) : []))

function examplesFor(form: string): FormExample[] {
  return props.examples?.[form] ?? []
}

function toggle(form: string) {
  selected.value = selected.value === form ? null : form
}
</script>

<template>
  <div class="forms-block">
    <div class="table-wrap" tabindex="0" role="region" :aria-label="table.title">
      <table>
        <caption>
          {{
            table.title
          }}
        </caption>
        <thead>
          <tr>
            <td />
            <th v-for="column in table.columns" :key="column" scope="col">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table.rows" :key="row.label">
            <th scope="row">{{ row.label }}</th>
            <td v-for="(cell, i) in row.cells" :key="i" :lang="cell.length > 0 ? 'pl' : undefined">
              <template v-if="cell.length > 0">
                <template v-for="(form, k) in cell" :key="form">
                  <button
                    v-if="examplesFor(form).length > 0"
                    type="button"
                    class="form-button"
                    :class="{ active: selected === form }"
                    :aria-expanded="selected === form"
                    :aria-controls="panelId"
                    @click="toggle(form)"
                  >
                    {{ form }}
                  </button>
                  <span v-else>{{ form }}</span>
                  <template v-if="k < cell.length - 1">, </template>
                </template>
              </template>
              <template v-else>—</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div :id="panelId" class="form-example" aria-live="polite">
      <template v-if="shown.length > 0">
        <p class="form-example-head">
          <span lang="pl" class="form-name">{{ selected }}</span>
          <span class="count">{{ shown.length }} прим.</span>
        </p>
        <ul class="form-example-items">
          <li v-for="example in shown" :key="example.pl">
            <span lang="pl">
              <template v-for="(segment, i) in highlightForms(example.pl, [example.form])" :key="i">
                <strong v-if="segment.hl">{{ segment.text }}</strong>
                <template v-else>{{ segment.text }}</template>
              </template>
            </span>
            <SpeakButton :text="example.pl" />
            <DictionarySaveSentence
              v-if="cardId"
              :pl="example.pl"
              :ru="example.ru"
              :source="example.source"
              :from="cardId"
              :form="example.form"
            />
            <span class="translation"> — {{ example.ru }}</span>
          </li>
        </ul>
      </template>
      <p v-else class="hint">Нажмите на форму, чтобы увидеть примеры.</p>
    </div>
  </div>
</template>

<style scoped>
caption {
  text-align: left;
  font-weight: 600;
  padding-bottom: 0.25rem;
}
td[lang='pl'] {
  color: var(--accent-pl);
}
tbody th {
  font-weight: 400;
  color: var(--muted);
  text-align: left;
}
.form-button {
  font: inherit;
  color: var(--accent-pl);
  background: none;
  border: none;
  border-bottom: 1px dotted currentColor;
  padding: 0;
  cursor: pointer;
}
.form-button.active {
  background: var(--highlight);
}
.form-example {
  margin: 0.25rem 0 1.25rem;
  padding: 0.5rem 0.75rem;
  border-left: 3px solid var(--border);
  background: var(--callout-bg);
  border-radius: 0 4px 4px 0;
}
.form-example p {
  margin: 0.15rem 0;
}
.form-example-items {
  list-style: none;
  margin: 0.25rem 0 0;
  padding: 0;
}
.form-example-items li {
  padding: 0.15rem 0;
}
.form-name {
  font-weight: 600;
  color: var(--accent-pl);
}
.count {
  color: var(--muted);
  font-size: 0.85em;
  margin-left: 0.5rem;
}
.translation {
  color: var(--fg);
}
.hint {
  color: var(--muted);
  font-size: 0.875rem;
}
</style>
