<script setup lang="ts">
defineProps<{ sidebarOpen: boolean }>()
defineEmits<{ 'toggle-sidebar': [] }>()
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
    </div>
    <NuxtLink to="/" class="topbar-title">Польский для русскоговорящих</NuxtLink>
    <div class="topbar-right" />
  </header>
</template>
