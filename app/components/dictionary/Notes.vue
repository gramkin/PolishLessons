<script setup lang="ts">
import type { Card } from '#shared/dictionary'
import { NOTE_KIND_NAMES } from '~/utils/dictionary'

defineProps<{ notes: Card['notes'] }>()
</script>

<template>
  <section v-if="notes.length > 0" id="zametki" aria-labelledby="zametki-title">
    <h2 id="zametki-title">Заметки для русскоговорящих</h2>
    <aside
      v-for="(note, i) in notes"
      :key="i"
      class="note callout"
      :class="`is-${note.kind}`"
      role="note"
    >
      <strong>{{ NOTE_KIND_NAMES[note.kind] }}.</strong> {{ note.text }}
    </aside>
  </section>
</template>

<style scoped>
.is-false-friend {
  border-left-color: var(--false-friend);
}
.is-false-friend strong {
  color: var(--false-friend);
}
</style>
