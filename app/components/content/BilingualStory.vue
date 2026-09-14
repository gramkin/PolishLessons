<script setup lang="ts">
const props = defineProps<{ id: string }>()
const { data: story } = await useStory(props.id)
</script>

<template>
  <StoryView v-if="story" :story="story" />
</template>
