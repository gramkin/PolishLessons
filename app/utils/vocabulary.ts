import type { Word } from '../../shared/schemas'
import { normalizeLoose } from './normalize'

export interface WordFilter {
  query: string
  chapter: number | null
  topic: string | null
  falseFriendsOnly: boolean
}

export function filterWords(words: Word[], filter: WordFilter): Word[] {
  const query = normalizeLoose(filter.query)
  return words
    .filter((w) => filter.chapter === null || w.chapter === filter.chapter)
    .filter((w) => filter.topic === null || w.topic === filter.topic)
    .filter((w) => !filter.falseFriendsOnly || w.falseFriend !== undefined)
    .filter(
      (w) => !query || normalizeLoose(w.pl).includes(query) || normalizeLoose(w.ru).includes(query),
    )
    .sort((a, b) => a.pl.localeCompare(b.pl, 'pl'))
}

export function listTopics(words: Word[]): string[] {
  return [...new Set(words.map((w) => w.topic))].sort((a, b) => a.localeCompare(b, 'ru'))
}

export function listChapters(words: Word[]): number[] {
  return [...new Set(words.map((w) => w.chapter))].sort((a, b) => a - b)
}
