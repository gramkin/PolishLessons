<script setup lang="ts">
const { nav, ready } = useLessonNav()
await ready
</script>

<template>
  <article class="content">
    <h1>Польский для русскоговорящих</h1>
    <p>Курс польского языка, построенный на сходстве с русским.</p>
    <section v-for="chapter in nav" :key="chapter.number">
      <h2>{{ chapter.number }}. {{ chapter.title }}</h2>
      <ul>
        <li v-for="lesson in chapter.lessons" :key="lesson.path">
          <NuxtLink :to="lesson.path">{{ lesson.label }} {{ lesson.title }}</NuxtLink>
        </li>
      </ul>
    </section>
    <p><NuxtLink to="/cheatsheet">Шпаргалка</NuxtLink></p>
  </article>
</template>
