export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  modules: ['@nuxt/eslint', '@nuxt/content', '@nuxtjs/color-mode', '@nuxt/fonts'],
  devtools: { enabled: true },
  typescript: { strict: true },
  css: ['~/assets/css/themes.css', '~/assets/css/base.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Польский для русскоговорящих',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  content: {
    experimental: { sqliteConnector: 'native' },
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'polski:theme',
  },
  fonts: {
    defaults: {
      weights: [400, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
    },
    families: [
      { name: 'Open Sans', provider: 'google' },
      { name: 'Source Code Pro', provider: 'google' },
    ],
  },
})
