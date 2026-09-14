import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['docs/**', 'content/**'],
  },
  {
    rules: {
      // Prettier always writes void elements as <input />; keep ESLint consistent with it.
      'vue/html-self-closing': [
        'warn',
        { html: { void: 'always', normal: 'always', component: 'always' } },
      ],
    },
  },
)
