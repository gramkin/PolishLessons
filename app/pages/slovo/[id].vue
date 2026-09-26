<script setup lang="ts">
import { cardNav } from '~/utils/dictionary'

const route = useRoute()
const id = String(route.params.id)
const { data } = await useWordCard(id)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Слово не найдено', fatal: true })
}

const negatedForms = computed(() => {
  const forms = data.value?.forms.allForms ?? []
  const set = new Set(forms.map((f) => f.toLowerCase()))
  return forms.filter((f) => f.toLowerCase().startsWith('nie') && set.has(f.toLowerCase().slice(3)))
})
const neighbours = computed(() => ({
  prev: cardNav(data.value?.prev),
  next: cardNav(data.value?.next),
}))

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
    <DictionarySenses
      :senses="data.card.senses"
      :all-forms="data.forms.allForms"
      :card-id="data.card.id"
    />
    <DictionaryFormsTables
      :tables="data.forms.tables"
      :form-examples="data.card.formExamples"
      :card-id="data.card.id"
      :negated-forms="negatedForms"
      :skipped="data.card.formExamplesSkip"
    />
    <DictionaryOrigin :etymology="data.card.etymology" :memory="data.card.memory" />
    <DictionaryNotes :notes="data.card.notes" />
    <DictionaryRelated
      :card="data.card"
      :aspect-pair="data.aspectPair"
      :family-ids="data.familyIds"
    />
    <DictionarySources :card="data.card" :forms="data.forms" />
    <PageNav :prev="neighbours.prev" :next="neighbours.next" label="Соседние слова" />
  </article>
</template>
