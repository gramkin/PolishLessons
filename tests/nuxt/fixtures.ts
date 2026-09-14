import { computed } from 'vue'
import type { Pattern, Word } from '../../shared/schemas'

export const words: Word[] = [
  {
    id: 'rzeka',
    pl: 'rzeka',
    ru: 'река',
    pos: 'noun',
    gender: 'f',
    pron: 'жэ́ка',
    pattern: 'rz-р',
    topic: 'природа',
    chapter: 2,
  },
  {
    id: 'brzeg',
    pl: 'brzeg',
    ru: 'берег',
    pos: 'noun',
    gender: 'm',
    pron: 'бжэк',
    pattern: 'rz-р',
    topic: 'природа',
    chapter: 2,
  },
  {
    id: 'glowa',
    pl: 'głowa',
    ru: 'голова',
    pos: 'noun',
    gender: 'f',
    pron: 'гуо́ва',
    pattern: 'ło-оло',
    topic: 'тело',
    chapter: 2,
  },
  {
    id: 'uroda',
    pl: 'uroda',
    ru: 'красота',
    pos: 'noun',
    gender: 'f',
    pron: 'уро́да',
    falseFriend: { ru: 'урод', meaning: 'красота, привлекательность' },
    topic: 'люди',
    chapter: 2,
  },
  {
    id: 'dom',
    pl: 'dom',
    ru: 'дом',
    pos: 'noun',
    gender: 'm',
    pron: 'дом',
    topic: 'дом',
    chapter: 3,
  },
]

export const patterns: Pattern[] = [
  { id: 'rz-р', pl: 'rz', ru: 'р', rule: 'Польское rz часто стоит там, где в русском «р».' },
  { id: 'ło-оло', pl: 'ło', ru: 'оло', rule: 'Русскому «оло» часто соответствует польское «ło».' },
]

export function wordsApi() {
  return {
    words: computed(() => words),
    byId: computed(() => new Map(words.map((w) => [w.id, w]))),
    ready: Promise.resolve(),
  }
}

export function patternsApi() {
  return {
    patterns: computed(() => patterns),
    byId: computed(() => new Map(patterns.map((p) => [p.id, p]))),
    ready: Promise.resolve(),
  }
}
