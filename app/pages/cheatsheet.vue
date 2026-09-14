<script setup lang="ts">
const { data: page } = await useAsyncData('content:cheatsheet', () =>
  queryCollection('cheatsheet').first(),
)

useSeoMeta({ title: 'Шпаргалка', description: () => page.value?.description })
</script>

<template>
  <article v-if="page" class="content">
    <ContentRenderer :value="page" />
  </article>
</template>
