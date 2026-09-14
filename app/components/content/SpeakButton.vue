<script setup lang="ts">
const props = defineProps<{ text: string; label?: string }>()
const { supported, speak } = useSpeech()
</script>

<template>
  <button
    v-if="supported"
    type="button"
    class="speak-button"
    :aria-label="props.label ?? `Произнести: ${props.text}`"
    :title="props.label ?? 'Произнести'"
    @click.stop="speak(props.text)"
  >
    🔊
  </button>
</template>

<style scoped>
.speak-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
  padding: 0 0.2em;
  line-height: 1;
  vertical-align: baseline;
  opacity: 0.75;
}
.speak-button:hover {
  opacity: 1;
}
</style>
