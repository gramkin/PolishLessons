<script setup lang="ts">
import { chapterNeighbours } from '~/utils/book'

const route = useRoute()
const slug = String(route.params.slug)
const { data: book } = await useBook(slug)
const { data: chapters } = await useBookChapters()

if (!book.value) {
  throw createError({ statusCode: 404, statusMessage: 'Книга не найдена', fatal: true })
}

// Built from the slug rather than the document's own stem, so the links do not
// depend on the query happening to return it.
const current = computed(() =>
  book.value
    ? {
        stem: `books/${slug}`,
        title: book.value.title,
        chapter: book.value.chapter,
        chapterTitle: book.value.chapterTitle,
        chapterTitleRu: book.value.chapterTitleRu,
      }
    : null,
)
const neighbours = computed(() => chapterNeighbours(chapters.value ?? [], current.value))

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
    <nav class="chapter-nav" aria-label="Соседние главы">
      <NuxtLink
        v-if="neighbours.prev"
        :to="neighbours.prev.path"
        rel="prev"
        class="chapter-link prev"
      >
        <span class="dir">← {{ neighbours.prev.label }}</span>
        <span lang="pl" class="chapter-name">{{ neighbours.prev.title }}</span>
        <span class="chapter-name-ru">{{ neighbours.prev.titleRu }}</span>
      </NuxtLink>
      <span v-else class="chapter-slot" />
      <NuxtLink to="/books" class="chapter-toc">Оглавление</NuxtLink>
      <NuxtLink
        v-if="neighbours.next"
        :to="neighbours.next.path"
        rel="next"
        class="chapter-link next"
      >
        <span class="dir">{{ neighbours.next.label }} →</span>
        <span lang="pl" class="chapter-name">{{ neighbours.next.title }}</span>
        <span class="chapter-name-ru">{{ neighbours.next.titleRu }}</span>
      </NuxtLink>
      <span v-else class="chapter-slot" />
    </nav>
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
.chapter-nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: start;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
.chapter-link {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-decoration: none;
}
.chapter-link.next {
  grid-column: 3;
  text-align: right;
}
.dir {
  color: var(--muted);
  font-size: 0.8rem;
}
.chapter-name {
  color: var(--accent-pl);
  font-weight: 600;
}
.chapter-name-ru {
  color: var(--muted);
  font-size: 0.875rem;
}
.chapter-toc {
  grid-column: 2;
  align-self: center;
  color: var(--muted);
  font-size: 0.875rem;
}
@media (max-width: 560px) {
  .chapter-nav {
    grid-template-columns: 1fr;
  }
  .chapter-link.next,
  .chapter-toc {
    grid-column: 1;
  }
  .chapter-link.next {
    text-align: left;
  }
}
.attribution {
  margin-top: 2rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.875rem;
}
</style>
