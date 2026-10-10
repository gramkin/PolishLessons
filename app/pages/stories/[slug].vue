<script setup lang="ts">
import { LESSON_TITLE_KEY } from '~/utils/mistakes'

const route = useRoute()
const slug = String(route.params.slug)
// StoryView marks known words with PlWord, which reads the word list synchronously.
const { ready: wordsReady } = useWords()
const { data: story } = await useStory(slug)
const { progress } = useProgress()
await wordsReady

if (!story.value) {
  throw createError({ statusCode: 404, statusMessage: 'История не найдена', fatal: true })
}

// Mistakes in the questions below are filed under the story's title, as lesson quizzes are.
provide(
  LESSON_TITLE_KEY,
  computed(() => story.value?.title ?? ''),
)

useSeoMeta({
  title: () => story.value?.title,
  description: () => story.value?.description ?? story.value?.titleRu,
})
</script>

<template>
  <article v-if="story" class="content">
    <h1 lang="pl">{{ story.title }}</h1>
    <p class="subtitle">
      {{ story.titleRu }} · {{ story.level }} <SpeakButton :text="story.title" />
    </p>
    <StoryView :story="story" :initial-mode="progress.settings.translationMode" />
    <template v-if="story.questions?.length">
      <h2>Вопросы к тексту</h2>
      <Quiz :questions="story.questions" />
    </template>
  </article>
</template>

<style scoped>
.subtitle {
  color: var(--muted);
  margin-top: -0.5rem;
}
</style>
