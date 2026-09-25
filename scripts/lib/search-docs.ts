import {
  chapterFileSchema,
  lessonFrontmatterSchema,
  storySchema,
  wordFileSchema,
  type Word,
} from '../../shared/schemas'
import type { SearchDoc } from '../../shared/search'
import { cardSchema, formsFileSchema } from '../../shared/dictionary'
import { buildNav, flattenNav } from '../../app/utils/nav'
import type { ContentBundle } from './load-content'

const BLOCK_COMPONENT = /^::[a-z][\w-]*[^\n]*\n[\s\S]*?^::[ \t]*$/gm
const INLINE_COMPONENT = /:[a-z][\w-]*\{([^}]*)\}/g

export function lessonPath(file: string): string {
  return `/${file.replace(/\.md$/, '')}`
}

export function splitSections(markdown: string): { heading: string | null; body: string }[] {
  const sections: { heading: string | null; body: string }[] = [{ heading: null, body: '' }]
  for (const line of markdown.split('\n')) {
    const heading = /^#{2,3}\s+(.+)$/.exec(line)
    if (heading) sections.push({ heading: heading[1]!.trim(), body: '' })
    else sections[sections.length - 1]!.body += `${line}\n`
  }
  return sections
}

export function plainText(markdown: string, words: Map<string, Word>): string {
  return markdown
    .replace(BLOCK_COMPONENT, ' ')
    .replace(INLINE_COMPONENT, (_match, attrs: string) => {
      const id = /\bid="([^"]+)"/.exec(attrs)?.[1]
      const pl = /\bpl="([^"]+)"/.exec(attrs)?.[1]
      return ` ${(id ? words.get(id)?.pl : undefined) ?? pl ?? ''} `
    })
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1 ')
    .replace(/^\|?[\s:|-]+\|?$/gm, ' ')
    .replace(/[|*_`>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim()
}

function sectionDocs(
  idPrefix: string,
  baseTitle: string,
  url: string,
  body: string,
  words: Map<string, Word>,
): SearchDoc[] {
  return splitSections(body).map((section, i) => ({
    id: `${idPrefix}:${i}`,
    type: 'lesson',
    title: section.heading ? `${baseTitle} › ${plainText(section.heading, words)}` : baseTitle,
    text: plainText(section.body, words),
    url,
  }))
}

export function buildSearchDocs(bundle: ContentBundle): SearchDoc[] {
  const words = new Map<string, Word>()
  for (const file of bundle.words) {
    const parsed = wordFileSchema.safeParse(file.data)
    if (parsed.success) parsed.data.words.forEach((w) => words.set(w.id, w))
  }

  const chapters = bundle.chapters ? chapterFileSchema.safeParse(bundle.chapters.data) : null
  const lessons = bundle.lessons.flatMap((file) => {
    const meta = lessonFrontmatterSchema.safeParse(file.frontmatter)
    if (!meta.success) return []
    return [{ ...meta.data, path: lessonPath(file.path), body: file.body }]
  })
  const labels = new Map(
    flattenNav(buildNav(lessons, chapters?.success ? chapters.data.chapters : [])).map((l) => [
      l.path,
      l.label,
    ]),
  )

  const docs: SearchDoc[] = []

  for (const lesson of lessons) {
    const label = labels.get(lesson.path)
    const title = label ? `${label} ${lesson.title}` : lesson.title
    docs.push(...sectionDocs(`lesson:${lesson.path}`, title, lesson.path, lesson.body, words))
  }

  if (bundle.cheatsheet) {
    docs.push(
      ...sectionDocs('cheatsheet', 'Шпаргалка', '/cheatsheet', bundle.cheatsheet.body, words),
    )
  }

  const cardIds = new Set<string>()
  for (const file of bundle.cards) {
    const card = cardSchema.safeParse(file.data)
    if (!card.success) continue
    const formsFile = bundle.forms.find((f) => f.path === `forms/${card.data.id}.json`)
    const forms = formsFile ? formsFileSchema.safeParse(formsFile.data) : null
    const allForms = forms?.success ? forms.data.allForms : [card.data.lemma]
    cardIds.add(card.data.id)
    docs.push({
      id: `card:${card.data.id}`,
      type: 'word',
      title: `${card.data.lemma} — ${card.data.senses.map((s) => s.ru).join('; ')}`,
      text: `${card.data.lemma} ${card.data.senses.map((s) => s.ru).join(' ')}`,
      forms: [...new Set([card.data.lemma, ...allForms])].join(' '),
      url: `/slovo/${card.data.id}`,
    })
  }

  for (const word of words.values()) {
    if (cardIds.has(word.id)) continue
    docs.push({
      id: `word:${word.id}`,
      type: 'word',
      title: `${word.pl} — ${word.ru}`,
      text: [word.pl, word.ru, word.falseFriend?.ru].filter(Boolean).join(' '),
      url: `/vocabulary#${word.id}`,
    })
  }

  for (const file of bundle.stories) {
    const story = storySchema.safeParse(file.data)
    if (!story.success) continue
    const slug = file.path.replace(/^stories\//, '').replace(/\.yml$/, '')
    const url = `/stories/${slug}`
    docs.push({
      id: `story:${slug}`,
      type: 'story',
      title: `${story.data.title} — ${story.data.titleRu}`,
      text: story.data.description ?? '',
      url,
    })
    story.data.sentences.forEach((sentence, i) => {
      docs.push({
        id: `story:${slug}:${i}`,
        type: 'story',
        title: story.data.title,
        text: `${sentence.pl} ${sentence.ru}`,
        url,
      })
    })
  }

  return docs
}
