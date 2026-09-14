<script setup lang="ts">
import { normalizePath } from '~/utils/nav'
import { LESSON_CHAPTER_KEY } from '~/utils/pron'

const route = useRoute()
const path = normalizePath(route.path)

const { current, ready } = useLessonNav()
const { data: page } = await useAsyncData(`lesson:${path}`, () =>
  queryCollection('lessons').path(path).first(),
)
await ready

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Урок не найден', fatal: true })
}

provide(LESSON_CHAPTER_KEY, page.value.chapter)

useSeoMeta({
  title: () => (page.value ? `${current.value?.label ?? ''} ${page.value.title}`.trim() : ''),
  description: () => page.value?.description,
})
</script>

<template>
  <article v-if="page" class="content">
    <h1>
      <span v-if="current" class="lesson-label">{{ current.label }}</span>
      {{ page.title }}
    </h1>
    <ContentRenderer :value="page" />
    <LessonDone :path="path" />
  </article>
</template>
