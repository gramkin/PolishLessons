<script setup lang="ts">
const props = defineProps<{ id?: string; pl?: string; ru?: string }>()

const { byId } = useWords()
const word = computed(() => (props.id ? (byId.value.get(props.id) ?? null) : null))
const polish = computed(() => props.pl ?? word.value?.pl ?? '')
const transcription = computed(() => props.ru ?? word.value?.pron ?? '')
</script>

<template>
  <span class="pron">
    <span lang="pl" class="pron-pl">{{ polish }}</span>
    <span v-if="transcription" class="pron-ru">[{{ transcription }}]</span>
    <SpeakButton v-if="polish" :text="polish" />
  </span>
</template>

<style scoped>
.pron-pl {
  color: var(--accent-pl);
  font-weight: 600;
}
.pron-ru {
  color: var(--muted);
  font-style: italic;
  margin-left: 0.25em;
}
</style>
