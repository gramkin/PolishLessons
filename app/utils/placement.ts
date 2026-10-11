import type { Verdict } from './quiz'

export interface ChapterScore {
  chapter: number
  correct: number
  total: number
}

/** A chapter counts as known when at least this share of its questions is right. */
export const PLACEMENT_PASS = 2 / 3

/**
 * Where a learner should start: the first chapter, in course order, whose questions they did
 * not mostly get right. An unanswered question counts as wrong; a skipped one (no voice for a
 * dictation) is left out. When every chapter is known, `start` is `after`, the chapter that
 * follows the last one tested.
 */
export function placementResult(
  chapters: number[],
  verdicts: (Verdict | null)[],
  after: number,
): { start: number; byChapter: ChapterScore[] } {
  const byChapter = new Map<number, ChapterScore>()
  chapters.forEach((chapter, i) => {
    const verdict = verdicts[i] ?? 'wrong'
    if (verdict === 'skipped') return
    const score = byChapter.get(chapter) ?? { chapter, correct: 0, total: 0 }
    score.total++
    if (verdict !== 'wrong') score.correct++
    byChapter.set(chapter, score)
  })
  const scores = [...byChapter.values()].sort((a, b) => a.chapter - b.chapter)
  const weak = scores.find((s) => s.correct < s.total * PLACEMENT_PASS)
  return { start: weak?.chapter ?? after, byChapter: scores }
}
