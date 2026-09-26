<script setup lang="ts">
import { bookSlug } from '~/utils/book'

const { data: books } = await useBookChapters()

useSeoMeta({
  title: 'Книги',
  description: 'Польские книги с параллельным переводом по методу Ильи Франка.',
})
</script>

<template>
  <article class="content">
    <h1>Книги</h1>
    <p>
      Тексты по методу Ильи Франка: каждый абзац разбит на короткие отрывки с переводом, а затем
      повторён целиком — без подсказок. Знакомые слова в чистом абзаце ведут в словарь.
    </p>
    <ul class="book-list">
      <li v-for="book in books ?? []" :key="book.stem">
        <NuxtLink :to="`/books/${bookSlug(book.stem)}`">
          <span lang="pl">{{ book.title }}</span>
        </NuxtLink>
        — {{ book.titleRu }}, глава {{ book.chapter }}
        <span class="level">{{ book.level }}</span>
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
