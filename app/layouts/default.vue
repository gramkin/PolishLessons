<script setup lang="ts">
import { normalizePath } from '~/utils/nav'

const MOBILE_QUERY = '(max-width: 1080px)'
const SIDEBAR_KEY = 'polski:sidebar'

const route = useRoute()
const { nav, prev, next, ready } = useLessonNav()
await ready

const currentPath = computed(() => normalizePath(route.path))
const sidebarOpen = ref(true)
const topbarHidden = ref(false)
const hydrated = ref(false)

function isMobile(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
  if (isMobile()) return
  try {
    localStorage.setItem(SIDEBAR_KEY, sidebarOpen.value ? 'open' : 'closed')
  } catch {
    // storage unavailable (private mode) — state just isn't remembered
  }
}

let lastScrollY = 0
function onScroll() {
  const y = window.scrollY
  topbarHidden.value = y > lastScrollY && y > 60
  lastScrollY = y
}

onMounted(() => {
  if (isMobile()) {
    sidebarOpen.value = false
  } else {
    try {
      sidebarOpen.value = localStorage.getItem(SIDEBAR_KEY) !== 'closed'
    } catch {
      sidebarOpen.value = true
    }
  }
  hydrated.value = true
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(
  () => route.path,
  () => {
    if (isMobile()) sidebarOpen.value = false
  },
)
</script>

<template>
  <div
    class="book"
    :class="sidebarOpen ? 'sidebar-open' : 'sidebar-closed'"
    :data-ready="hydrated || undefined"
  >
    <a href="#main" class="skip-link">К содержанию</a>
    <AppSidebar :nav="nav" :current-path="currentPath" />
    <div class="sidebar-backdrop" aria-hidden="true" @click="toggleSidebar" />
    <div class="page-wrapper">
      <AppTopbar
        :sidebar-open="sidebarOpen"
        :class="{ hidden: topbarHidden }"
        @toggle-sidebar="toggleSidebar"
      />
      <main id="main" class="page">
        <slot />
      </main>
      <PageNav :prev="prev" :next="next" />
    </div>
  </div>
</template>
