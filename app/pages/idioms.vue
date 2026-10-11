<script setup lang="ts">
import { IDIOM_BANDS, IDIOM_KIND_NAMES, type PublishedIdiom } from '#shared/idioms'
import { filterIdioms } from '~/utils/idioms'

useSeoMeta({
  title: 'Идиомы и выражения',
  description:
    'Польские идиомы и устойчивые выражения по частоте употребления: с переводом, озвучкой и ссылками на карточки слов.',
})

const { idioms, ready } = useIdioms()
const { byId, ready: indexReady } = useDictionaryIndex()
await Promise.all([ready, indexReady])

const query = ref('')
const kind = ref<PublishedIdiom['kind'] | null>(null)
const band = ref<number | null>(null)
const vulgar = ref(false)

const rows = computed(() =>
  filterIdioms(idioms.value, {
    query: query.value,
    kind: kind.value,
    band: band.value,
    vulgar: vulgar.value,
  }),
)
const kinds = Object.entries(IDIOM_KIND_NAMES) as [PublishedIdiom['kind'], string][]

// A page of rows at a time: every row hydrates audio, ⊕ and its examples, and all 1,400 at
// once made the page slow to become usable. Search and the filters still cover the whole list.
const PAGE = 200
const shown = ref(PAGE)
watch([query, kind, band, vulgar], () => {
  shown.value = PAGE
})
const visible = computed(() => rows.value.slice(0, shown.value))
</script>

<template>
  <article class="content idioms">
    <h1>Идиомы и выражения</h1>
    <p>
      Устойчивые выражения из карточек словаря, от самых частых к редким. Частоту посчитали по
      польским субтитрам к фильмам — это живая разговорная речь, тот же источник, что и у частотного
      словаря. Начните с первой сотни. У каждого выражения есть примеры; кнопка ⊕ добавляет
      выражение или пример в карточки «Фразы».
    </p>
    <form class="filters" role="search" @submit.prevent>
      <input
        v-model="query"
        type="search"
        placeholder="Поиск по-польски или по-русски"
        aria-label="Поиск выражения"
      />
      <select v-model="kind" aria-label="Тип">
        <option :value="null">Все типы</option>
        <option v-for="[value, label] in kinds" :key="value" :value="value">{{ label }}</option>
      </select>
      <select v-model="band" aria-label="Частотность">
        <option :value="null">Все</option>
        <option v-for="(b, i) in IDIOM_BANDS" :key="b.label" :value="i">{{ b.label }}</option>
      </select>
      <label class="checkbox">
        <input v-model="vulgar" type="checkbox" />
        Показывать грубые
      </label>
    </form>
    <p class="count">Найдено: {{ rows.length }}</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Таблица выражений">
      <table>
        <thead>
          <tr>
            <th scope="col">№</th>
            <th scope="col">Польский</th>
            <th scope="col">Перевод</th>
            <th scope="col">Тип</th>
            <th scope="col">Слова</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="idiom in visible" :key="idiom.pl">
            <td class="rank">{{ idiom.rank }}</td>
            <td lang="pl" class="pl">
              {{ idiom.pl }}
              <SpeakButton :text="idiom.pl" />
              <SaveSentence
                :pl="idiom.pl"
                :ru="idiom.ru"
                :source="{ kind: 'authored' }"
                :from="idiom.cards[0] ?? ''"
              />
              <DictionaryIdiomExamples :pl="idiom.pl" :from="idiom.cards[0] ?? ''" />
            </td>
            <td>
              {{ idiom.ru }}
              <span v-if="idiom.register === 'colloquial'" class="register">разг.</span>
              <span v-else-if="idiom.register === 'bookish'" class="register">книжн.</span>
              <span v-else-if="idiom.register === 'vulgar'" class="register">груб.</span>
            </td>
            <td class="meta">{{ IDIOM_KIND_NAMES[idiom.kind] }}</td>
            <td class="cards">
              <template v-for="(id, i) in idiom.cards" :key="id">
                <template v-if="i > 0">, </template>
                <NuxtLink :to="`/slovo/${id}`" lang="pl">{{ byId.get(id)?.lemma ?? id }}</NuxtLink>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button v-if="rows.length > shown" type="button" class="more" @click="shown += PAGE">
      Показать ещё {{ Math.min(PAGE, rows.length - shown) }}
    </button>
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
.meta,
.register {
  color: var(--muted);
}
.register {
  font-size: 0.85em;
  margin-left: 0.25rem;
}
.pl {
  color: var(--accent-pl);
  font-weight: 600;
}
.cards {
  font-size: 0.9em;
}
.more {
  font: inherit;
  margin: 1rem 0;
  padding: 0.4rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--callout-bg);
  color: var(--fg);
  cursor: pointer;
}
</style>
