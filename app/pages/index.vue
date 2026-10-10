<script setup lang="ts">
import { learnedWordIds } from '~/utils/deck'
import { isDue } from '~/utils/leitner'
import { dueMistakes } from '~/utils/mistakes'

const { progress, loaded, isLessonCompleted } = useProgress()
const { data: lessonWords } = await useLessonWords()

const learnedCount = computed(() => learnedWordIds(lessonWords.value ?? [], isLessonCompleted).size)
const phraseCount = computed(() => Object.keys(progress.value.phrases).length)
const dueCount = computed(() => {
  const now = new Date()
  const cards = Object.values(progress.value.cards).filter((card) => isDue(card, now)).length
  const phrases = Object.values(progress.value.phrases).filter((p) =>
    isDue({ box: p.box, due: p.due }, now),
  ).length
  const mistakes = dueMistakes(progress.value.mistakes, now).length
  return cards + phrases + mistakes
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
      Изучено слов: {{ learnedCount }} · фраз: {{ phraseCount }} · к повторению сегодня:
      <NuxtLink to="/flashcards">{{ dueCount }}</NuxtLink>
    </p>
    <p><NuxtLink to="/lessons/01-alphabet/01-letters">Начать: 1.1 Буквы →</NuxtLink></p>
  </article>
</template>
