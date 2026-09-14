<script setup lang="ts">
const SITE_NAME = 'Польский для русскоговорящих'

useHead({
  titleTemplate: (title) => (title && title !== SITE_NAME ? `${title} · ${SITE_NAME}` : SITE_NAME),
})

useSeoMeta({
  description:
    'Курс польского языка для русскоговорящих: уроки, словарь, карточки и двуязычные истории.',
  ogSiteName: SITE_NAME,
  ogType: 'website',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
