<script setup lang="ts">
import { storySlug } from '~/utils/story'

const { data: stories } = await useAsyncData('content:stories', () =>
  queryCollection('stories').all(),
)
const { data: chapters } = await useAsyncData('content:chapters', () =>
  queryCollection('chapters').first(),
)

// Graded texts are listed under the chapter after which they are readable.
const groups = computed(() => {
  const byChapter = new Map<number, NonNullable<typeof stories.value>>()
  for (const story of stories.value ?? []) {
    const n = Number(story.chapter)
    byChapter.set(n, [...(byChapter.get(n) ?? []), story])
  }
  return [...byChapter.entries()]
    .sort(([a], [b]) => a - b)
    .map(([number, list]) => ({
      number,
      title: chapters.value?.chapters.find((c) => Number(c.number) === number)?.title ?? '',
      stories: list,
    }))
})

useSeoMeta({
  title: 'Истории',
  description: 'Двуязычные истории на польском с переводом на русский.',
})
</script>

<template>
  <article class="content">
    <h1>Истории</h1>
    <p>
      Тексты на польском с построчным переводом. Наведите на слово, чтобы увидеть его значение.
      Каждый текст стоит после главы, с которой он уже понятен: в нём только слова и грамматика
      пройденных уроков. После текста — вопросы и диктант.
    </p>
    <section v-for="group in groups" :key="group.number">
      <h2>
        После главы {{ group.number }}<template v-if="group.title"> · {{ group.title }}</template>
      </h2>
      <ul class="story-list">
        <li v-for="story in group.stories" :key="story.stem">
          <NuxtLink :to="`/stories/${storySlug(story.stem)}`">
            <span lang="pl">{{ story.title }}</span>
          </NuxtLink>
          — {{ story.titleRu }} <span class="level">{{ story.level }}</span>
          <SpeakButton :text="story.title" />
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.level {
  color: var(--muted);
  font-size: 0.8em;
  margin-left: 0.25rem;
}
</style>
