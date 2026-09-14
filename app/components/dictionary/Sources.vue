<script setup lang="ts">
import type { Card, FormsFile } from '#shared/dictionary'
import { tatoebaUrl } from '~/utils/dictionary'

const props = defineProps<{ card: Card; forms: FormsFile }>()
const tatoebaIds = computed(() => Object.keys(props.forms.tatoeba).map(Number))
</script>

<template>
  <section id="istochniki" aria-labelledby="istochniki-title" class="word-sources">
    <h2 id="istochniki-title">Источники</h2>
    <ul>
      <li>
        Значения и формы:
        <a :href="`https://pl.wiktionary.org/wiki/${encodeURIComponent(card.lemma)}`">Wiktionary</a>
        (CC BY-SA), <a href="http://zil.ipipan.waw.pl/PoliMorf">PoliMorf</a> (BSD)
      </li>
      <li v-if="tatoebaIds.length > 0">
        Примеры Tatoeba (CC BY 2.0 FR):
        <template v-for="(id, i) in tatoebaIds" :key="id"
          ><a :href="tatoebaUrl(id)">#{{ id }}</a
          ><template v-if="i < tatoebaIds.length - 1">, </template></template
        >
      </li>
      <li v-if="forms.audio">
        Запись: {{ forms.audio.author }}, {{ forms.audio.license }} (Wikimedia Commons)
      </li>
    </ul>
    <p><NuxtLink to="/sources">Все источники и лицензии</NuxtLink></p>
  </section>
</template>

<style scoped>
.word-sources {
  font-size: 0.875rem;
  color: var(--muted);
}
</style>
