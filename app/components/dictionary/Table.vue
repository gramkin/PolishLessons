<script setup lang="ts">
import type { FormsTable } from '#shared/dictionary'

defineProps<{ table: FormsTable }>()
</script>

<template>
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
            {{ cell.length > 0 ? cell.join(', ') : '—' }}
          </td>
        </tr>
      </tbody>
    </table>
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
</style>
