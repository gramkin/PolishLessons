<script setup lang="ts">
import type { Card, IndexEntry } from '#shared/dictionary'

const props = defineProps<{ card: Card; index: Map<string, IndexEntry> }>()
const aspectPair = computed(() =>
  props.card.aspectPair ? (props.index.get(props.card.aspectPair) ?? null) : null,
)
const RELATION_NAMES = {
  derived: 'производное',
  aspect: 'видовая пара',
  root: 'однокоренное',
  antonym: 'антоним',
} as const
</script>

<template>
  <section v-if="card.collocations.length > 0" id="sochetaniya" aria-labelledby="sochetaniya-title">
    <h2 id="sochetaniya-title">Сочетания</h2>
    <ul>
      <li v-for="item in card.collocations" :key="item.pl">
        <span lang="pl">{{ item.pl }}</span> — {{ item.ru }}
      </li>
    </ul>
  </section>
  <section
    v-if="card.family.length > 0 || aspectPair"
    id="rodstvennye"
    aria-labelledby="rodstvennye-title"
  >
    <h2 id="rodstvennye-title">Родственные слова</h2>
    <p v-if="aspectPair">
      Видовая пара:
      <NuxtLink :to="`/slovo/${aspectPair.id}`" lang="pl">{{ aspectPair.lemma }}</NuxtLink>
    </p>
    <ul>
      <li v-for="member in card.family" :key="member.pl">
        <NuxtLink v-if="member.id && index.has(member.id)" :to="`/slovo/${member.id}`" lang="pl">{{
          member.pl
        }}</NuxtLink>
        <span v-else lang="pl">{{ member.pl }}</span>
        — {{ member.ru }} <span class="relation">({{ RELATION_NAMES[member.relation] }})</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
[lang='pl'] {
  color: var(--accent-pl);
}
.relation {
  color: var(--muted);
  font-size: 0.875em;
}
</style>
