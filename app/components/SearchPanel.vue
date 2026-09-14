<script setup lang="ts">
import { highlightQuery, snippet, type SearchHit } from '~/utils/search'

const { open, loading, error, ensureIndex, search } = useSearch()

const query = ref('')
const active = ref(0)
const input = ref<HTMLInputElement | null>(null)

const groups = computed(() => search(query.value))
const flat = computed(() => groups.value.flatMap((group) => group.hits))

watch(query, () => {
  active.value = 0
})

watch(open, async (isOpen) => {
  if (!isOpen) {
    query.value = ''
    return
  }
  await nextTick()
  input.value?.focus()
  await ensureIndex()
})

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (open.value || event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return
  if (event.code === 'KeyS' || event.code === 'Slash' || event.key === '/') {
    event.preventDefault()
    open.value = true
  }
}

function go(hit: SearchHit) {
  open.value = false
  navigateTo(hit.url)
}

function onPanelKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    active.value = Math.min(active.value + 1, Math.max(flat.value.length - 1, 0))
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = Math.max(active.value - 1, 0)
  } else if (event.key === 'Enter') {
    const hit = flat.value[active.value]
    if (hit) {
      event.preventDefault()
      go(hit)
    }
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKeydown))
</script>

<template>
  <div v-if="open" class="search-overlay" @click.self="open = false">
    <div
      class="search-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Поиск"
      @keydown="onPanelKeydown"
    >
      <input
        ref="input"
        v-model="query"
        type="search"
        class="search-input"
        placeholder="Поиск по урокам, словам и историям"
        aria-label="Поиск"
        autocomplete="off"
        spellcheck="false"
      />
      <p v-if="loading" class="search-status">Загрузка…</p>
      <p v-else-if="error" class="search-status">Не удалось загрузить поиск.</p>
      <p v-else-if="query.trim() && flat.length === 0" class="search-status">Ничего не найдено.</p>
      <section v-for="group in groups" :key="group.type" class="search-group">
        <h2>{{ group.label }}</h2>
        <ul>
          <li v-for="hit in group.hits" :key="hit.id">
            <NuxtLink
              :to="hit.url"
              class="search-hit"
              :class="{ active: flat.indexOf(hit) === active }"
              @click.prevent="go(hit)"
              @mousemove="active = flat.indexOf(hit)"
            >
              <span class="hit-title">
                <template v-for="(segment, i) in highlightQuery(hit.title, query)" :key="i">
                  <mark v-if="segment.hl">{{ segment.text }}</mark>
                  <template v-else>{{ segment.text }}</template>
                </template>
              </span>
              <span v-if="hit.type !== 'word' && hit.text" class="hit-text">
                <template
                  v-for="(segment, i) in highlightQuery(snippet(hit.text, query), query)"
                  :key="i"
                >
                  <mark v-if="segment.hl">{{ segment.text }}</mark>
                  <template v-else>{{ segment.text }}</template>
                </template>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgb(0 0 0 / 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10vh 1rem 1rem;
}
.search-panel {
  width: 100%;
  max-width: 640px;
  max-height: 75vh;
  overflow-y: auto;
  background: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.25);
}
.search-input {
  width: 100%;
  font: inherit;
  font-size: 1.1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--fg);
}
.search-status {
  color: var(--muted);
}
.search-group h2 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin: 1rem 0 0.25rem;
}
.search-group ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.search-hit {
  display: block;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  color: var(--fg);
}
.search-hit.active {
  background: var(--callout-bg);
  text-decoration: none;
}
.hit-title {
  display: block;
  font-weight: 600;
}
.hit-text {
  display: block;
  font-size: 0.875rem;
  color: var(--muted);
}
mark {
  background: var(--highlight);
  color: inherit;
}
</style>
