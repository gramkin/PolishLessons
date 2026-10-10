<script setup lang="ts">
import { storySlug } from '~/utils/story'

// Shown under a chapter's last lesson: the graded texts that become readable with it.
const props = defineProps<{ chapter: number }>()

const { data: stories } = await useAsyncData('content:stories', () =>
  queryCollection('stories').all(),
)
const list = computed(() =>
  (stories.value ?? []).filter((story) => Number(story.chapter) === props.chapter),
)
</script>

<template>
  <aside v-if="list.length > 0" class="chapter-reading" aria-labelledby="chapter-reading-title">
    <h2 id="chapter-reading-title">Почитать после главы</h2>
    <p>Тексты только из пройденного, с переводом, вопросами и диктантом:</p>
    <ul>
      <li v-for="story in list" :key="story.stem">
        <NuxtLink :to="`/stories/${storySlug(story.stem)}`">
          <span lang="pl">{{ story.title }}</span>
        </NuxtLink>
        — {{ story.titleRu }}
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.chapter-reading {
  margin: 2.5rem 0 0;
  padding: 0.75rem 1.25rem;
  border-left: 4px solid var(--accent-pl);
  background: var(--callout-bg);
  border-radius: 4px;
}
.chapter-reading h2 {
  margin-top: 0.25rem;
  font-size: 1.15rem;
}
</style>
