<script setup lang="ts">
import type { NavLesson } from '~/utils/nav'

const props = withDefaults(
  defineProps<{ prev: NavLesson | null; next: NavLesson | null; label?: string }>(),
  { label: 'Соседние уроки' },
)

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

function onKeydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (isTyping(event.target)) return
  if (event.key === 'ArrowLeft' && props.prev) navigateTo(props.prev.path)
  if (event.key === 'ArrowRight' && props.next) navigateTo(props.next.path)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <nav class="page-nav" :aria-label="props.label">
    <NuxtLink v-if="prev" :to="prev.path" rel="prev" class="page-nav-link prev">
      <span aria-hidden="true">‹</span>
      <span class="sr-only">Предыдущий урок: {{ prev.label }} {{ prev.title }}</span>
    </NuxtLink>
    <NuxtLink v-if="next" :to="next.path" rel="next" class="page-nav-link next">
      <span aria-hidden="true">›</span>
      <span class="sr-only">Следующий урок: {{ next.label }} {{ next.title }}</span>
    </NuxtLink>
  </nav>
</template>
