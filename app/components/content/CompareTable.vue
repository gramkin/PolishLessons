<script setup lang="ts">
import { speakableCell } from '~/utils/speech'

const props = defineProps<{
  headers: string[]
  rows: string[][]
  plColumns?: number[]
  caption?: string
}>()

const polishColumns = computed(() => new Set(props.plColumns ?? [props.headers.length - 1]))

const parsedRows = computed(() =>
  props.rows.map((cells) => {
    const first = cells[0] ?? ''
    const diff = first.startsWith('!')
    return { diff, cells: diff ? [first.slice(1).trimStart(), ...cells.slice(1)] : cells }
  }),
)
</script>

<template>
  <div
    class="table-wrap compare-table"
    tabindex="0"
    role="region"
    aria-label="Сравнительная таблица"
  >
    <table>
      <caption v-if="caption">{{ caption }}</caption>
      <thead>
        <tr>
          <th v-for="(header, i) in headers" :key="i" scope="col">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, r) in parsedRows" :key="r" :class="{ diff: row.diff }">
          <td
            v-for="(cell, c) in row.cells"
            :key="c"
            :lang="polishColumns.has(c) ? 'pl' : undefined"
          >
            {{ cell }}<span v-if="row.diff && c === 0" class="sr-only"> (отличие от русского)</span
            ><SpeakButton
              v-if="polishColumns.has(c) && speakableCell(cell)"
              :text="speakableCell(cell)!"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
td[lang='pl'] {
  color: var(--accent-pl);
}
.diff td {
  background: var(--highlight);
}
.diff td:first-child {
  font-weight: 600;
}
caption {
  text-align: left;
  color: var(--muted);
  padding-bottom: 0.25rem;
}
</style>
