import type { Word } from '../../shared/schemas'

export type DeckFilter =
  | { kind: 'chapter'; chapter: number }
  | { kind: 'topic'; topic: string }
  | { kind: 'learned' }
  | { kind: 'false-friends' }

export type CardSide = 'pl-ru' | 'ru-pl'

export function learnedWordIds(
  lessons: { path: string; words?: string[] }[],
  isCompleted: (path: string) => boolean,
): Set<string> {
  return new Set(lessons.filter((l) => isCompleted(l.path)).flatMap((l) => l.words ?? []))
}

export function selectWords(words: Word[], filter: DeckFilter, learned: Set<string>): Word[] {
  switch (filter.kind) {
    case 'chapter':
      return words.filter((w) => w.chapter === filter.chapter)
    case 'topic':
      return words.filter((w) => w.topic === filter.topic)
    case 'learned':
      return words.filter((w) => learned.has(w.id))
    case 'false-friends':
      return words.filter((w) => w.falseFriend !== undefined)
  }
}

export function resolveDirection(
  setting: 'pl-ru' | 'ru-pl' | 'mixed',
  random: () => number = Math.random,
): CardSide {
  if (setting !== 'mixed') return setting
  return random() < 0.5 ? 'pl-ru' : 'ru-pl'
}
