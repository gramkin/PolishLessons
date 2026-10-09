<script setup lang="ts">
useSeoMeta({
  title: 'Источники и лицензии',
  description: 'Откуда взяты данные частотного словаря и на каких условиях они используются.',
})

const sources = [
  {
    name: 'FrequencyWords (OpenSubtitles 2018)',
    url: 'https://github.com/hermitdave/FrequencyWords',
    use: 'частотность словоформ',
    license: 'CC BY-SA 4.0',
  },
  {
    name: 'PoliMorf 0.6.7',
    url: 'http://zil.ipipan.waw.pl/PoliMorf',
    use: 'все формы слов и грамматические пометы',
    license: 'BSD 2-clause',
  },
  {
    name: 'Викисловарь (pl.wiktionary.org), выгрузка kaikki.org',
    url: 'https://kaikki.org/',
    use: 'значения, транскрипция IPA, переводы, родственные слова',
    license: 'CC BY-SA',
  },
  {
    name: 'Tatoeba',
    url: 'https://tatoeba.org/',
    use: 'примеры предложений и переводы',
    license: 'CC BY 2.0 FR',
  },
  {
    name: 'Wikimedia Commons',
    url: 'https://commons.wikimedia.org/',
    use: 'записи произношения',
    license: 'лицензия указана в карточке слова и в подсказке кнопки 🔊',
  },
]
</script>

<template>
  <article class="content">
    <h1>Источники и лицензии</h1>
    <p>
      Частотный словарь собран из открытых источников. Формы слов и примеры взяты из данных,
      переводы примеров без отметки Tatoeba и заметки для русскоговорящих написаны для этого курса и
      проходят проверку.
    </p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Таблица источников">
      <table>
        <thead>
          <tr>
            <th scope="col">Источник</th>
            <th scope="col">Что используется</th>
            <th scope="col">Лицензия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="source in sources" :key="source.name">
            <td>
              <a :href="source.url">{{ source.name }}</a>
            </td>
            <td>{{ source.use }}</td>
            <td>{{ source.license }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      Данные, производные от источников под CC BY-SA (частотность, значения из Викисловаря),
      распространяются на тех же условиях — CC BY-SA.
    </p>
  </article>
</template>
