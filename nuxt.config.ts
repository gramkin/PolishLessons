export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  modules: ['@nuxt/eslint', '@nuxt/content'],
  devtools: { enabled: true },
  typescript: { strict: true },
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
})
