<script setup lang="ts">
import { rankNeighbours } from '~/utils/dictionary'

const route = useRoute()
const id = String(route.params.id)
const { data } = await useWordCard(id)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Слово не найдено', fatal: true })
}

const { entries, byId, ready } = useDictionaryIndex()
await ready
const neighbours = computed(() =>
  data.value ? rankNeighbours(entries.value, data.value.card.rank) : { prev: null, next: null },
)

useSeoMeta({
  title: () =>
    data.value ? `${data.value.card.lemma} — ${data.value.card.senses[0]?.ru ?? ''}` : '',
  description: () =>
    data.value
      ? `${data.value.card.lemma}: ${data.value.card.senses.map((s) => s.ru).join('; ')}. Формы, примеры и заметки.`
      : '',
})
</script>

<template>
  <article v-if="data" class="content word-card">
    <DictionaryHeader :card="data.card" :forms="data.forms" />
    <DictionarySenses :senses="data.card.senses" :all-forms="data.forms.allForms" />
    <DictionaryFormsTables :tables="data.forms.tables" />
    <DictionaryNotes :notes="data.card.notes" />
    <DictionaryRelated :card="data.card" :index="byId" />
    <DictionarySources :card="data.card" :forms="data.forms" />
    <PageNav :prev="neighbours.prev" :next="neighbours.next" label="Соседние слова" />
  </article>
</template>
