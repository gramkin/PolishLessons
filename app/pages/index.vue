<script setup lang="ts">
import { learnedWordIds } from '~/utils/deck'
import { isDue } from '~/utils/leitner'

const { progress, loaded, isLessonCompleted } = useProgress()
const { data: lessonWords } = await useLessonWords()

const learnedCount = computed(() => learnedWordIds(lessonWords.value ?? [], isLessonCompleted).size)
const dueCount = computed(() => {
  const now = new Date()
  return Object.values(progress.value.cards).filter((card) => isDue(card, now)).length
})
</script>

<template>
  <article class="content">
    <h1>Польский для русскоговорящих</h1>
    <p>
      Курс польского языка, построенный на сходстве с русским. Выберите урок в оглавлении слева или
      начните с первого.
    </p>
    <p v-if="loaded" class="progress-summary">
      Изучено слов: {{ learnedCount }} · к повторению сегодня:
      <NuxtLink to="/flashcards">{{ dueCount }}</NuxtLink>
    </p>
    <p><NuxtLink to="/lessons/01-alphabet/01-letters">Начать: 1.1 Буквы →</NuxtLink></p>
  </article>
</template>
