import { defineCollection, defineContentConfig } from '@nuxt/content'
import {
  chapterFileSchema,
  lessonMetaSchema,
  patternFileSchema,
  bookSchema,
  placementFileSchema,
  storySchema,
  wordFileSchema,
} from './shared/schemas'

export default defineContentConfig({
  collections: {
    lessons: defineCollection({
      type: 'page',
      source: 'lessons/**/*.md',
      schema: lessonMetaSchema,
    }),
    cheatsheet: defineCollection({ type: 'page', source: 'cheatsheet.md' }),
    chapters: defineCollection({ type: 'data', source: 'chapters.yml', schema: chapterFileSchema }),
    patterns: defineCollection({ type: 'data', source: 'patterns.yml', schema: patternFileSchema }),
    words: defineCollection({ type: 'data', source: 'words/*.yml', schema: wordFileSchema }),
    stories: defineCollection({ type: 'data', source: 'stories/*.yml', schema: storySchema }),
    books: defineCollection({ type: 'data', source: 'books/*.yml', schema: bookSchema }),
    placement: defineCollection({
      type: 'data',
      source: 'placement.yml',
      schema: placementFileSchema,
    }),
  },
})
