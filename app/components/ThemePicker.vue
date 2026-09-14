<script setup lang="ts">
const colorMode = useColorMode()
const open = ref(false)

const themes = [
  { value: 'system', label: 'Системная' },
  { value: 'light', label: 'Светлая' },
  { value: 'sepia', label: 'Сепия' },
  { value: 'dark', label: 'Тёмная' },
] as const

function choose(value: (typeof themes)[number]['value']) {
  colorMode.preference = value
  open.value = false
}
</script>

<template>
  <div class="theme-picker" @keydown.escape="open = false">
    <button
      type="button"
      class="icon-button"
      aria-label="Выбрать тему"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      🖌
    </button>
    <ul v-if="open" class="theme-menu" role="menu">
      <li v-for="theme in themes" :key="theme.value" role="none">
        <button
          type="button"
          role="menuitemradio"
          :data-theme="theme.value"
          :aria-checked="colorMode.preference === theme.value"
          @click="choose(theme.value)"
        >
          {{ theme.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
