<script setup lang="ts">
import { CARD_POS, type CardPos } from '#shared/dictionary'
import { POS_NAMES, rankBand } from '~/utils/dictionary'
import { bandStarts, filterVocabulary, mergeVocabulary } from '~/utils/vocabulary'

useSeoMeta({
  title: 'Словарь',
  description:
    'Частотный словарь польского языка для русскоговорящих: слова по частоте, переводы и подробные карточки.',
})

const { words } = useWords()
const { entries: index, ready } = useDictionaryIndex()
await ready

const query = ref('')
const pos = ref<CardPos | null>(null)
const band = ref<number | null>(null)
const inLessonsOnly = ref(false)

const merged = computed(() => mergeVocabulary(index.value, words.value))
const bands = computed(() => bandStarts(merged.value))
const rows = computed(() =>
  filterVocabulary(merged.value, {
    query: query.value,
    pos: pos.value,
    band: band.value,
    inLessonsOnly: inLessonsOnly.value,
  }),
)
</script>

<template>
  <article class="content vocabulary">
    <h1>Словарь</h1>
    <form class="filters" role="search" @submit.prevent>
      <input
        v-model="query"
        type="search"
        placeholder="Поиск по-польски или по-русски"
        aria-label="Поиск слова"
      />
      <select v-model="pos" aria-label="Часть речи">
        <option :value="null">Все части речи</option>
        <option v-for="p in CARD_POS" :key="p" :value="p">{{ POS_NAMES[p] }}</option>
      </select>
      <select v-model="band" aria-label="Частотность">
        <option :value="null">Все слова</option>
        <option v-for="start in bands" :key="start" :value="start">
          {{ rankBand(start).label }}
        </option>
      </select>
      <label class="checkbox">
        <input v-model="inLessonsOnly" type="checkbox" />
        Встречается в уроках
      </label>
    </form>
    <p class="count">Найдено слов: {{ rows.length }}</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Таблица слов">
      <table>
        <thead>
          <tr>
            <th scope="col">№</th>
            <th scope="col">Польский</th>
            <th scope="col">Перевод</th>
            <th scope="col">Часть речи</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in rows" :id="entry.id" :key="entry.id">
            <td class="rank">{{ entry.rank ?? '—' }}</td>
            <td lang="pl" class="pl">
              <NuxtLink v-if="entry.hasCard" :to="`/slovo/${entry.id}`">{{ entry.lemma }}</NuxtLink>
              <template v-else>{{ entry.lemma }}</template>
              <SpeakButton :text="entry.lemma" />
            </td>
            <td>{{ entry.gloss }}</td>
            <td class="meta">{{ entry.pos ? POS_NAMES[entry.pos] : 'фраза' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin: 1rem 0;
}
.filters input[type='search'],
.filters select {
  font: inherit;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--fg);
}
.filters input[type='search'] {
  flex: 1 1 14rem;
}
.count,
.rank,
.meta {
  color: var(--muted);
}
.pl {
  color: var(--accent-pl);
  font-weight: 600;
  white-space: nowrap;
}
tr:target td {
  background: var(--highlight);
}
</style>
