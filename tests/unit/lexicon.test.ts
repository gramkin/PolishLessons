import { describe, expect, it } from 'vitest'
import { intendedNonWords, lessonWords, unknownWords } from '../../scripts/lib/lexicon'

const known = new Set(['mam', 'kota', 'czytam', 'gazetę', 'gazeta', 'studentowi', 'widzę'])
const isKnown = (w: string) => known.has(w)

describe('lessonWords', () => {
  it('reads the Polish a reader sees, not markup, keys or short spelling fragments', () => {
    const body = [
      ':pron{pl="Mam kota."} — У меня есть кот.',
      '::drill{id="noun-acc-sg"}',
      '    explain: "ó, rz и dzi — это буквы."',
      '<!-- a comment',
      '     spanning lines -->',
    ].join('\n')
    expect(lessonWords(body).map((f) => f.word)).toEqual(['kota'])
  })
})

describe('unknownWords', () => {
  it('flags a non-word and folds sentence capitals', () => {
    const findings = lessonWords(':pron{pl="Czytam gazetę."} и *Czytam gazete.*')
    expect(unknownWords(findings, isKnown).map((f) => f.word)).toEqual(['gazete'])
  })

  it('excuses choice distractors and lexicon-ok words, but not the right answer', () => {
    const body = [
      '<!-- lexicon-ok: studentu -->',
      'не *studentu*, а *studentowi*',
      '::quiz',
      '---',
      'questions:',
      '  - type: choice',
      '    q: "Czytam ___."',
      '    options: [gazetę, gazete, gazetą]',
      '    answer: 0',
      '---',
      '::',
    ].join('\n')
    expect([...intendedNonWords(body)].sort()).toEqual(['gazete', 'gazetą', 'studentu'])
    expect(unknownWords(lessonWords(body), isKnown)).toEqual([])
  })
})
