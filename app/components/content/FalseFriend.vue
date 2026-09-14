<script setup lang="ts">
const props = defineProps<{ id?: string; pl?: string; ru?: string; meaning?: string }>()

const { byId } = useWords()
const word = computed(() => (props.id ? (byId.value.get(props.id) ?? null) : null))

const polish = computed(() => props.pl ?? word.value?.pl ?? '')
const russian = computed(() => props.ru ?? word.value?.falseFriend?.ru ?? '')
const meaning = computed(() => props.meaning ?? word.value?.falseFriend?.meaning ?? '')
</script>

<template>
  <aside class="false-friend callout" role="note">
    <span class="icon" aria-hidden="true">⚠</span>
    <span><strong lang="pl">{{ polish }}</strong> ≠ {{ russian }}. Значит: {{ meaning }}</span>
  </aside>
</template>

<style scoped>
.false-friend {
  display: flex;
  gap: 0.5rem;
  border-left-color: var(--false-friend);
}
.icon {
  color: var(--false-friend);
}
strong {
  color: var(--accent-pl);
}
</style>
