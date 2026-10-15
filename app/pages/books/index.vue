<script setup lang="ts">
import { groupBooks } from '~/utils/book'

const { data: chapters } = await useBookChapters()
const books = computed(() => groupBooks(chapters.value ?? []))

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
      <li v-for="book in books" :key="book.id">
        <NuxtLink :to="book.path">
          <span lang="pl">{{ book.title }}</span>
        </NuxtLink>
        — {{ book.titleRu }}
        <span class="meta"
          >· {{ book.author }} · {{ book.chapters.length }} гл. · {{ book.level }}</span
        >
      </li>
    </ul>
  </article>
</template>

<style scoped>
.book-list li {
  margin-bottom: 0.4rem;
}
.meta {
  color: var(--muted);
  font-size: 0.875em;
}
</style>
