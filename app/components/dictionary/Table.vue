<script setup lang="ts">
import { rowAliases, type CardPos, type FormExample, type FormsTable } from '#shared/dictionary'
import { examplesForCell, highlightForms, rowsHoldingForm } from '~/utils/dictionary'

const props = defineProps<{
  table: FormsTable
  examples?: Record<string, FormExample[]>
  cardId?: string
  /** form -> why it carries no example, for the forms shown in this table */
  skipped?: Record<string, string>
  /** "row|form" -> why that row of the form carries no example */
  skippedRows?: Record<string, string>
  /** the card's part of speech; an adjective's vocative row repeats its nominative */
  pos?: CardPos
}>()

// A cell, not a spelling, is selected: «tchórzu» fills both «Предложный» and
// «Звательный», and each row shows its own examples.
const selected = ref<{ form: string; row: string; key: string } | null>(null)
const panelId = useId()

// An alias row (an adjective's vocative) shows the examples of the row it repeats.
const aliases = computed(() => rowAliases(props.table, props.pos))

function distinctRows(form: string): string[] {
  return rowsHoldingForm(props.table, form).filter((r) => !aliases.value.has(r))
}

function cellExamples(form: string, row: string) {
  const target = aliases.value.get(row) ?? row
  return examplesForCell(props.examples?.[form] ?? [], target, distinctRows(form).length)
}

function hasExamples(form: string, row: string): boolean {
  const { own, shared } = cellExamples(form, row)
  return own.length + shared.length > 0
}

const shown = computed(() =>
  selected.value ? cellExamples(selected.value.form, selected.value.row) : { own: [], shared: [] },
)
const shownCount = computed(() => shown.value.own.length + shown.value.shared.length)
// Untagged examples of a shared form may illustrate any of its rows; say so.
const sharedNote = computed(() => {
  if (!selected.value || shown.value.shared.length === 0) return ''
  const rows = distinctRows(selected.value.form)
  if (rows.length <= 1) return ''
  const names = rows.map((r) => r.toLowerCase())
  return `Та же форма — ${names.slice(0, -1).join(', ')} и ${names.at(-1)}:`
})

// rowAliases maps only an adjective's vocative, always onto the nominative.
const aliasNote = computed(() =>
  selected.value && aliases.value.has(selected.value.row)
    ? `${selected.value.row} совпадает с именительным:`
    : '',
)

// A form with no example is explained right under its own table: the reader
// looking at «Повелительное наклонение» should not have to hunt for the reason.
const tableSkips = computed(() => {
  const grouped = new Map<string, string[]>()
  for (const row of props.table.rows) {
    for (const cell of row.cells) {
      for (const form of cell) {
        const reason = skipReason(form, row.label)
        if (!reason) continue
        const forms = grouped.get(reason) ?? []
        if (!forms.includes(form)) forms.push(form)
        grouped.set(reason, forms)
      }
    }
  }
  return [...grouped].map(([reason, forms]) => ({ reason, forms }))
})

function skipReason(form: string, row: string): string | undefined {
  return props.skippedRows?.[`${row}|${form}`] ?? props.skipped?.[form]
}

function toggle(form: string, row: string, key: string) {
  selected.value = selected.value?.key === key ? null : { form, row, key }
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
                    v-if="hasExamples(form, row.label)"
                    type="button"
                    class="form-button"
                    :class="{ active: selected?.key === `${row.label}|${i}|${form}` }"
                    :aria-expanded="selected?.key === `${row.label}|${i}|${form}`"
                    :aria-controls="panelId"
                    @click="toggle(form, row.label, `${row.label}|${i}|${form}`)"
                  >
                    {{ form }}
                  </button>
                  <span v-else :class="{ 'is-skipped': skipReason(form, row.label) }">{{
                    form
                  }}</span>
                  <template v-if="k < cell.length - 1">, </template>
                </template>
              </template>
              <template v-else>—</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ul v-if="tableSkips.length > 0" class="table-skips">
      <li v-for="item in tableSkips" :key="item.reason">
        <span lang="pl">{{ item.forms.join(', ') }}</span> — {{ item.reason }}
      </li>
    </ul>
    <div :id="panelId" class="form-example" aria-live="polite">
      <template v-if="selected && shownCount > 0">
        <p class="form-example-head">
          <span lang="pl" class="form-name">{{ selected.form }}</span>
          <span class="count">{{ shownCount }} прим.</span>
        </p>
        <p v-if="aliasNote" class="shared-note">{{ aliasNote }}</p>
        <template v-for="part in ['own', 'shared'] as const" :key="part">
          <p v-if="part === 'shared' && sharedNote" class="shared-note">{{ sharedNote }}</p>
          <ul v-if="shown[part].length > 0" class="form-example-items">
            <li v-for="example in shown[part]" :key="example.pl">
              <span lang="pl">
                <template
                  v-for="(segment, i) in highlightForms(example.pl, [example.form])"
                  :key="i"
                >
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
.table-skips {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.9375rem;
}
.table-skips [lang='pl'] {
  color: var(--accent-pl);
}
.is-skipped {
  color: var(--muted);
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
.shared-note {
  color: var(--muted);
  font-size: 0.875rem;
}
.hint {
  color: var(--muted);
  font-size: 0.875rem;
}
</style>
