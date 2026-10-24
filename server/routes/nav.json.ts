import { queryCollection } from '@nuxt/content/nitro'
import { buildNav } from '../../app/utils/nav'

// The full table of contents, prerendered to a static nav.json. Pages carry only a slim copy
// (`slimNav`); the browser fetches this file once and opens every chapter in the sidebar.
export default defineEventHandler(async (event) => {
  const [lessons, chapters] = await Promise.all([
    queryCollection(event, 'lessons').select('path', 'title', 'chapter', 'order').all(),
    queryCollection(event, 'chapters').first(),
  ])
  return buildNav(lessons, chapters?.chapters ?? [])
})
