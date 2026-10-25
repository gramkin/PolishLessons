<script setup lang="ts">
// `say` is what the voice reads when it differs from the text shown (respelled names).
const props = defineProps<{ text: string; label?: string; say?: string }>()
const { supported, speak, recordingFor } = useSpeech()
const recording = computed(() => recordingFor(props.text))
// CC BY recordings need their author credited where they play.
const title = computed(() => {
  if (props.label) return props.label
  if (!recording.value) return 'Произнести'
  return `Произнести (запись: ${recording.value.author}, ${recording.value.license}, Wikimedia Commons)`
})
</script>

<template>
  <button
    v-if="supported || recording"
    type="button"
    class="speak-button"
    :aria-label="props.label ?? `Произнести: ${props.text}`"
    :title="title"
    @click.stop="speak(props.say ?? props.text)"
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
