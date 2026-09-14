<script setup lang="ts">
import { toDay } from '~/utils/leitner'
import { exportProgress, importProgress, THEMES, type Settings } from '~/utils/progress'

useSeoMeta({
  title: 'Настройки',
  description: 'Тема, произношение, режим историй и перенос прогресса.',
})

const colorMode = useColorMode()
const { progress, loaded, updateSettings, replace } = useProgress()

const themeLabels: Record<(typeof THEMES)[number], string> = {
  system: 'Системная',
  light: 'Светлая',
  sepia: 'Сепия',
  dark: 'Тёмная',
}

const groups = [
  {
    key: 'showPron',
    legend: 'Произношение кириллицей',
    options: [
      { value: 'auto', label: 'Авто (главы 1–3)' },
      { value: 'always', label: 'Всегда' },
      { value: 'never', label: 'Никогда' },
    ],
  },
  {
    key: 'translationMode',
    legend: 'Перевод в историях',
    options: [
      { value: 'tap', label: 'По нажатию' },
      { value: 'show', label: 'Показывать' },
      { value: 'hide', label: 'Скрывать' },
    ],
  },
  {
    key: 'direction',
    legend: 'Карточки',
    options: [
      { value: 'pl-ru', label: 'Польский → русский' },
      { value: 'ru-pl', label: 'Русский → польский' },
      { value: 'mixed', label: 'Вперемешку' },
    ],
  },
] as const

const message = ref<{ kind: 'ok' | 'error'; text: string } | null>(null)

function setOption(key: keyof Settings, value: string) {
  updateSettings({ [key]: value } as Partial<Settings>)
}

function download() {
  const text = exportProgress(progress.value, colorMode.preference)
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `polski-progress-${toDay(new Date())}.json`
  link.click()
  URL.revokeObjectURL(url)
}

async function upload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const result = importProgress(await file.text())
  if (!result) {
    message.value = { kind: 'error', text: 'Этот файл не похож на сохранённый прогресс курса.' }
    return
  }
  replace(result.progress)
  if (result.theme) colorMode.preference = result.theme
  message.value = { kind: 'ok', text: 'Прогресс загружен.' }
  input.value = ''
}
</script>

<template>
  <article class="content settings">
    <h1>Настройки</h1>

    <fieldset>
      <legend>Тема</legend>
      <label v-for="theme in THEMES" :key="theme">
        <input
          type="radio"
          name="theme"
          :value="theme"
          :checked="colorMode.preference === theme"
          @change="colorMode.preference = theme"
        />
        {{ themeLabels[theme] }}
      </label>
    </fieldset>

    <fieldset v-for="group in groups" :key="group.key" :disabled="!loaded">
      <legend>{{ group.legend }}</legend>
      <label v-for="option in group.options" :key="option.value">
        <input
          type="radio"
          :name="group.key"
          :value="option.value"
          :checked="progress.settings[group.key] === option.value"
          @change="setOption(group.key, option.value)"
        />
        {{ option.label }}
      </label>
    </fieldset>

    <fieldset :disabled="!loaded">
      <legend>Прогресс</legend>
      <p class="hint">
        Прогресс хранится только в этом браузере. Скачайте файл, чтобы перенести его на другое
        устройство.
      </p>
      <button type="button" class="export" @click="download">Скачать прогресс</button>
      <label class="import">
        Загрузить из файла:
        <input type="file" accept="application/json,.json" @change="upload" />
      </label>
      <p v-if="message" class="settings-message" :class="`is-${message.kind}`" role="status">
        {{ message.text }}
      </p>
    </fieldset>
  </article>
</template>

<style scoped>
fieldset {
  border: 1px solid var(--border);
  border-radius: 6px;
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
}
label {
  display: block;
  padding: 0.15rem 0;
}
.hint {
  color: var(--muted);
  margin-top: 0;
}
.export {
  font: inherit;
  cursor: pointer;
  margin-bottom: 0.5rem;
}
.is-ok {
  color: var(--cognate);
}
.is-error {
  color: var(--false-friend);
}
</style>
