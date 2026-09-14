<script setup lang="ts">
const props = defineProps<{ id: string }>()
const { data: story } = await useStory(props.id)
const { progress } = useProgress()
</script>

<template>
  <StoryView v-if="story" :story="story" :initial-mode="progress.settings.translationMode" />
</template>
