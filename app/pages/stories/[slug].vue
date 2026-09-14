<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug)
const { data: story } = await useStory(slug)
const { progress } = useProgress()

if (!story.value) {
  throw createError({ statusCode: 404, statusMessage: 'История не найдена', fatal: true })
}

useSeoMeta({
  title: () => story.value?.title,
  description: () => story.value?.description ?? story.value?.titleRu,
})
</script>

<template>
  <article v-if="story" class="content">
    <h1 lang="pl">{{ story.title }}</h1>
    <p class="subtitle">{{ story.titleRu }} · {{ story.level }}</p>
    <StoryView :story="story" :initial-mode="progress.settings.translationMode" />
  </article>
</template>

<style scoped>
.subtitle {
  color: var(--muted);
  margin-top: -0.5rem;
}
</style>
