<script setup lang="ts">
import type { NavChapter } from '~/utils/nav'

const props = defineProps<{
  nav: NavChapter[]
  currentPath: string
  isCompleted?: (path: string) => boolean
}>()

const sections = [
  { to: '/stories', label: 'Истории' },
  { to: '/books', label: 'Книги' },
  { to: '/vocabulary', label: 'Словарь' },
  { to: '/idioms', label: 'Выражения' },
  { to: '/flashcards', label: 'Карточки' },
  { to: '/cheatsheet', label: 'Шпаргалка' },
]

const root = ref<HTMLElement | null>(null)

function revealActive() {
  root.value?.querySelector('a.active')?.scrollIntoView?.({ block: 'nearest' })
}

onMounted(revealActive)
watch(
  () => props.currentPath,
  () => nextTick(revealActive),
)
</script>

<template>
  <nav id="sidebar" ref="root" class="sidebar" aria-label="Оглавление">
    <ol>
      <li>
        <NuxtLink
          to="/"
          :class="{ active: currentPath === '/' }"
          :aria-current="currentPath === '/' ? 'page' : undefined"
        >
          Введение
        </NuxtLink>
      </li>
      <li v-for="chapter in nav" :key="chapter.number" class="chapter">
        <NuxtLink :to="chapter.lessons[0]?.path" class="chapter-title">
          <strong>{{ chapter.number }}.</strong> {{ chapter.title }}
        </NuxtLink>
        <ol class="section">
          <li v-for="lesson in chapter.lessons" :key="lesson.path">
            <NuxtLink
              :to="lesson.path"
              :class="{ active: lesson.path === currentPath }"
              :aria-current="lesson.path === currentPath ? 'page' : undefined"
            >
              <strong>{{ lesson.label }}</strong> {{ lesson.title }}
              <span v-if="isCompleted?.(lesson.path)" class="done" aria-label="пройдено">✓</span>
            </NuxtLink>
          </li>
        </ol>
      </li>
    </ol>
    <div class="spacer" />
    <ol>
      <li v-for="section in sections" :key="section.to">
        <NuxtLink
          :to="section.to"
          :class="{ active: currentPath === section.to }"
          :aria-current="currentPath === section.to ? 'page' : undefined"
        >
          {{ section.label }}
        </NuxtLink>
      </li>
    </ol>
    <p class="sidebar-footer">
      <NuxtLink to="/sources" :class="{ active: currentPath === '/sources' }"
        >Источники и лицензии</NuxtLink
      >
    </p>
  </nav>
</template>
