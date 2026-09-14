<script setup lang="ts">
import type { FormsTable } from '#shared/dictionary'

const props = defineProps<{ tables: FormsTable[] }>()
const main = computed(() => props.tables.filter((t) => !t.extra))
const extra = computed(() => props.tables.filter((t) => t.extra))
</script>

<template>
  <section v-if="tables.length > 0" id="formy" aria-labelledby="formy-title">
    <h2 id="formy-title">Формы</h2>
    <DictionaryTable v-for="table in main" :key="table.title" :table="table" />
    <details v-if="extra.length > 0" class="all-forms">
      <summary>Все формы</summary>
      <DictionaryTable v-for="table in extra" :key="table.title" :table="table" />
    </details>
  </section>
</template>

<style scoped>
.all-forms {
  margin: 1rem 0;
}
summary {
  cursor: pointer;
  font-weight: 600;
}
</style>
