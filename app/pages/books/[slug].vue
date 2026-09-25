<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug)
const { data: book } = await useBook(slug)

if (!book.value) {
  throw createError({ statusCode: 404, statusMessage: 'Книга не найдена', fatal: true })
}

useSeoMeta({
  title: () => `${book.value?.title} — глава ${book.value?.chapter}`,
  description: () => `${book.value?.titleRu}: ${book.value?.chapterTitleRu}`,
})
</script>

<template>
  <article v-if="book" class="content">
    <h1 lang="pl">{{ book.chapterTitle }}</h1>
    <p class="subtitle">
      {{ book.chapterTitleRu }} · {{ book.title }} · {{ book.level }}
      <SpeakButton :text="book.chapterTitle" />
    </p>
    <BookReader :book="book" />
    <footer class="attribution">
      <p>
        {{ book.author }}, <span lang="pl">{{ book.title }}</span>
        <template v-if="book.translator">, перевод на польский — {{ book.translator }}</template
        >. Источник:
        <a :href="book.source.url" rel="noopener" target="_blank">{{ book.source.name }}</a
        >. Лицензия:
        <a :href="book.source.licenseUrl" rel="noopener" target="_blank">{{
          book.source.license
        }}</a
        >. Русский перевод по методу Ильи Франка распространяется на тех же условиях.
      </p>
    </footer>
  </article>
</template>

<style scoped>
.subtitle {
  color: var(--muted);
  margin-top: -0.5rem;
}
.attribution {
  margin-top: 2rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.875rem;
}
</style>
