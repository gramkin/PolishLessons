<script setup lang="ts">
import type { Card, CardRef } from '#shared/dictionary'

// Resolved at publish time: the page no longer holds the whole dictionary index
// just to look up one aspect pair and a few family members.
const props = defineProps<{ card: Card; aspectPair: CardRef | null; familyIds: string[] }>()
// 93% of cards repeat a phrase in both lists, which printed it twice. Show it once.
const idioms = computed(() => {
  const listed = new Set(props.card.collocations.map((c) => c.pl))
  return props.card.idioms.filter((i) => !listed.has(i.pl))
})
const RELATION_NAMES = {
  derived: 'производное',
  aspect: 'видовая пара',
  root: 'однокоренное',
  antonym: 'антоним',
} as const
</script>

<template>
  <section
    v-if="card.collocations.length > 0 || idioms.length > 0"
    id="sochetaniya"
    aria-labelledby="sochetaniya-title"
  >
    <h2 id="sochetaniya-title">Сочетания и выражения</h2>
    <ul>
      <li v-for="item in card.collocations" :key="item.pl">
        <span lang="pl">{{ item.pl }}</span> — {{ item.ru }} <SpeakButton :text="item.pl" />
        <!-- A collocation that is also a published idiom gets its examples here. -->
        <DictionaryIdiomExamples :pl="item.pl" :from="card.id" />
      </li>
      <li v-for="item in idioms" :key="item.pl" class="idiom">
        <span lang="pl">{{ item.pl }}</span> — {{ item.ru }} <SpeakButton :text="item.pl" />
        <DictionaryIdiomExamples :pl="item.pl" :from="card.id" />
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
        <NuxtLink
          v-if="member.id && props.familyIds.includes(member.id)"
          :to="`/slovo/${member.id}`"
          lang="pl"
          >{{ member.pl }}</NuxtLink
        >
        <span v-else lang="pl">{{ member.pl }}</span>
        — {{ member.ru }} <span class="relation">({{ RELATION_NAMES[member.relation] }})</span>
        <SpeakButton :text="member.pl" />
      </li>
    </ul>
    <p v-if="card.synonyms.length > 0" class="lexicon">
      <strong>Синонимы:</strong>
      <span v-for="(word, i) in card.synonyms" :key="word"
        ><span lang="pl">{{ word }}</span> <SpeakButton :text="word" /><template
          v-if="i < card.synonyms.length - 1"
          >,
        </template></span
      >
    </p>
    <p v-if="card.antonyms.length > 0" class="lexicon">
      <strong>Антонимы:</strong>
      <span v-for="(word, i) in card.antonyms" :key="word"
        ><span lang="pl">{{ word }}</span> <SpeakButton :text="word" /><template
          v-if="i < card.antonyms.length - 1"
          >,
        </template></span
      >
    </p>
  </section>
</template>

<style scoped>
.idiom > span[lang='pl'] {
  font-style: italic;
}
.lexicon {
  margin: 0.25rem 0;
}
[lang='pl'] {
  color: var(--accent-pl);
}
.relation {
  color: var(--muted);
  font-size: 0.875em;
}
</style>
