import type { CardPos, IndexEntry } from '../../shared/dictionary'
import type { Word } from '../../shared/schemas'
import { rankBand } from './dictionary'
import { normalizeLoose } from './normalize'

export interface VocabularyEntry {
  id: string
  lemma: string
  gloss: string
  pos: CardPos | null
  rank: number | null
  inLessons: boolean
  hasCard: boolean
}

export interface VocabularyFilter {
  query: string
  pos: CardPos | null
  band: number | null
  inLessonsOnly: boolean
}

const LESSON_POS: Partial<Record<Word['pos'], CardPos>> = {
  noun: 'noun',
  verb: 'verb',
  adj: 'adj',
  adv: 'adv',
  pron: 'pron',
  num: 'num',
  prep: 'prep',
  conj: 'conj',
  part: 'part',
}

export function mergeVocabulary(index: IndexEntry[], words: Word[]): VocabularyEntry[] {
  const lessonIds = new Set(words.map((w) => w.id))
  const cardIds = new Set(index.map((e) => e.id))
  const cards = [...index]
    .sort((a, b) => a.rank - b.rank)
    .map((e) => ({
      id: e.id,
      lemma: e.lemma,
      gloss: e.gloss,
      pos: e.pos,
      rank: e.rank,
      inLessons: lessonIds.has(e.id),
      hasCard: true,
    }))
  const lessonOnly = words
    .filter((w) => !cardIds.has(w.id))
    .sort((a, b) => a.pl.localeCompare(b.pl, 'pl'))
    .map((w) => ({
      id: w.id,
      lemma: w.pl,
      gloss: w.ru,
      pos: LESSON_POS[w.pos] ?? null,
      rank: null,
      inLessons: true,
      hasCard: false,
    }))
  return [...cards, ...lessonOnly]
}

export function filterVocabulary(
  entries: VocabularyEntry[],
  filter: VocabularyFilter,
): VocabularyEntry[] {
  const query = normalizeLoose(filter.query)
  return entries.filter(
    (e) =>
      (!query ||
        normalizeLoose(e.lemma).includes(query) ||
        normalizeLoose(e.gloss).includes(query)) &&
      (filter.pos === null || e.pos === filter.pos) &&
      (filter.band === null || (e.rank !== null && rankBand(e.rank).start === filter.band)) &&
      (!filter.inLessonsOnly || e.inLessons),
  )
}

export function bandStarts(entries: VocabularyEntry[]): number[] {
  return [
    ...new Set(entries.filter((e) => e.rank !== null).map((e) => rankBand(e.rank!).start)),
  ].sort((a, b) => a - b)
}

export function listTopics(words: Word[]): string[] {
  return [...new Set(words.map((w) => w.topic))].sort((a, b) => a.localeCompare(b, 'ru'))
}

export function listChapters(words: Word[]): number[] {
  return [...new Set(words.map((w) => w.chapter))].sort((a, b) => a - b)
}
