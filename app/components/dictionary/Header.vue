<script setup lang="ts">
import type { Card, FormsFile } from '#shared/dictionary'
import { ASPECT_NAMES, POS_NAMES, conjugationLabel, conjugations } from '~/utils/dictionary'

const props = defineProps<{ card: Card; forms: FormsFile }>()

const conjugation = computed(() =>
  props.card.pos === 'verb'
    ? conjugationLabel(
        conjugations(
          props.forms.tables,
          props.card.formExamplesSkip.map((s) => s.form),
        ),
      )
    : null,
)

const meta = computed(() =>
  [
    POS_NAMES[props.card.pos],
    props.card.aspect ? ASPECT_NAMES[props.card.aspect] : null,
    props.forms.grammarLabel,
    conjugation.value,
    `№${props.card.rank} по частоте`,
  ]
    .filter(Boolean)
    .join(' · '),
)

const sections = computed(() =>
  [
    { id: 'znacheniya', label: 'Значения', show: true },
    { id: 'formy', label: 'Формы', show: props.forms.tables.length > 0 },
    {
      id: 'proishozhdenie',
      label: 'Происхождение',
      show: Boolean(props.card.etymology || props.card.memory),
    },
    { id: 'zametki', label: 'Заметки', show: props.card.notes.length > 0 },
    {
      id: 'sochetaniya',
      label: 'Сочетания',
      show: props.card.collocations.length > 0 || props.card.idioms.length > 0,
    },
    {
      id: 'rodstvennye',
      label: 'Родственные',
      show: props.card.family.length > 0 || !!props.card.aspectPair,
    },
    { id: 'istochniki', label: 'Источники', show: true },
  ].filter((s) => s.show),
)
</script>

<template>
  <header class="word-header">
    <div class="title-row">
      <h1 lang="pl">{{ card.lemma }}</h1>
      <SpeakButton :text="card.lemma" />
    </div>
    <p class="meta">{{ meta }}</p>
    <p class="pron">
      <span v-if="forms.ipa" class="ipa">[{{ forms.ipa }}]</span>
      <span class="cyr">{{ card.pron.cyr }}</span>
    </p>
    <audio
      v-if="forms.audio"
      class="recording"
      controls
      preload="none"
      :src="forms.audio.url"
      :aria-label="`Запись произношения: ${card.lemma}`"
    />
    <nav class="toc" aria-label="Разделы карточки">
      <a v-for="s in sections" :key="s.id" :href="`#${s.id}`">{{ s.label }}</a>
    </nav>
  </header>
</template>

<style scoped>
.title-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
h1 {
  color: var(--accent-pl);
  margin-bottom: 0.25rem;
}
.meta,
.pron {
  margin: 0.25rem 0;
  color: var(--muted);
}
.ipa {
  margin-right: 0.5rem;
}
.cyr {
  font-style: italic;
}
.recording {
  display: block;
  margin: 0.5rem 0;
  max-width: 100%;
}
.toc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1rem 0 1.5rem;
  font-size: 0.9rem;
}
</style>
