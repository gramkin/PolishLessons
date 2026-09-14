<script setup lang="ts">
import { GENDER_LABELS, POS_LABELS } from '~/utils/labels'
import { filterWords, listChapters, listTopics } from '~/utils/vocabulary'

useSeoMeta({
  title: 'Словарь',
  description: 'Все слова курса с переводом, произношением и соответствиями русскому.',
})

const { words } = useWords()
const { byId: patternsById } = usePatterns()

const query = ref('')
const chapter = ref<number | null>(null)
const topic = ref<string | null>(null)
const falseFriendsOnly = ref(false)

const chapters = computed(() => listChapters(words.value))
const topics = computed(() => listTopics(words.value))
const rows = computed(() =>
  filterWords(words.value, {
    query: query.value,
    chapter: chapter.value,
    topic: topic.value,
    falseFriendsOnly: falseFriendsOnly.value,
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
      <select v-model="chapter" aria-label="Глава">
        <option :value="null">Все главы</option>
        <option v-for="c in chapters" :key="c" :value="c">Глава {{ c }}</option>
      </select>
      <select v-model="topic" aria-label="Тема">
        <option :value="null">Все темы</option>
        <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
      </select>
      <label class="checkbox">
        <input v-model="falseFriendsOnly" type="checkbox" />
        Только ложные друзья
      </label>
    </form>
    <p class="count">Найдено слов: {{ rows.length }}</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Таблица слов">
      <table>
        <thead>
          <tr>
            <th scope="col">Польский</th>
            <th scope="col">Русский</th>
            <th scope="col">Произношение</th>
            <th scope="col">Грамматика</th>
            <th scope="col">Заметка</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="word in rows" :id="word.id" :key="word.id">
            <td lang="pl" class="pl">{{ word.pl }} <SpeakButton :text="word.pl" /></td>
            <td>{{ word.ru }}</td>
            <td class="pron">[{{ word.pron }}]</td>
            <td class="meta">
              {{ POS_LABELS[word.pos]
              }}<template v-if="word.gender">, {{ GENDER_LABELS[word.gender] }}</template>
            </td>
            <td>
              <span v-if="word.falseFriend" class="ff">
                ⚠ не «{{ word.falseFriend.ru }}»: {{ word.falseFriend.meaning }}
              </span>
              <span v-else-if="word.pattern && patternsById.get(word.pattern)" class="pattern">
                <span lang="pl">{{ patternsById.get(word.pattern)?.pl }}</span> ↔
                {{ patternsById.get(word.pattern)?.ru }}
              </span>
            </td>
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
.count {
  color: var(--muted);
  font-size: 0.875rem;
}
.pl {
  color: var(--accent-pl);
  font-weight: 600;
  white-space: nowrap;
}
.pron,
.meta {
  color: var(--muted);
  font-style: italic;
}
.ff {
  color: var(--false-friend);
}
.pattern {
  color: var(--cognate);
}
tr:target td {
  background: var(--highlight);
}
</style>
