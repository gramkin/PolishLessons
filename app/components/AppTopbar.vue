<script setup lang="ts">
defineProps<{ sidebarOpen: boolean }>()
defineEmits<{ 'toggle-sidebar': [] }>()

const { open: searchOpen } = useSearch()
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <button
        type="button"
        class="icon-button"
        aria-label="Показать или скрыть оглавление"
        aria-controls="sidebar"
        :aria-expanded="sidebarOpen"
        @click="$emit('toggle-sidebar')"
      >
        ☰
      </button>
      <ThemePicker />
      <button
        type="button"
        class="icon-button"
        aria-label="Поиск"
        title="Поиск (S или /)"
        @click="searchOpen = true"
      >
        🔍
      </button>
    </div>
    <NuxtLink to="/" class="topbar-title">Польский для русскоговорящих</NuxtLink>
    <div class="topbar-right">
      <NuxtLink to="/settings" class="icon-button" aria-label="Настройки" title="Настройки"
        >⚙</NuxtLink
      >
    </div>
  </header>
</template>
