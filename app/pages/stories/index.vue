<script setup lang="ts">
import { storySlug } from '~/utils/story'

const { data: stories } = await useAsyncData('content:stories', () =>
  queryCollection('stories').all(),
)

useSeoMeta({
  title: 'Истории',
  description: 'Двуязычные истории на польском с переводом на русский.',
})
</script>

<template>
  <article class="content">
    <h1>Истории</h1>
    <p>
      Короткие тексты на польском с построчным переводом. Наведите на слово, чтобы увидеть его
      значение.
    </p>
    <ul class="story-list">
      <li v-for="story in stories ?? []" :key="story.stem">
        <NuxtLink :to="`/stories/${storySlug(story.stem)}`">
          <span lang="pl">{{ story.title }}</span>
        </NuxtLink>
        — {{ story.titleRu }} <span class="level">{{ story.level }}</span>
        <SpeakButton :text="story.title" />
      </li>
    </ul>
  </article>
</template>

<style scoped>
.level {
  color: var(--muted);
  font-size: 0.8em;
  margin-left: 0.25rem;
}
</style>
