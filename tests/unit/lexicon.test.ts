import { describe, expect, it } from 'vitest'
import {
  intendedNonWords,
  isKnownForm,
  lessonWords,
  storyText,
  unknownWords,
} from '../../scripts/lib/lexicon'

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

describe('isKnownForm', () => {
  const forms = new Set(['mógł', 'gdyby', 'gdzie', 'zrobili', 'przyszedł', 'co'])
  const has = (w: string) => forms.has(w)

  it('accepts a known form with the conditional by and a person ending', () => {
    for (const w of [
      'mógłbym',
      'Gdybym',
      'gdybyśmy',
      'zrobilibyśmy',
      'Gdzieśmy',
      'coście',
      'przyszedłem',
    ])
      expect(isKnownForm(w, has)).toBe(true)
  })

  it('still rejects a misspelled stem', () => {
    for (const w of ['mogłbym', 'gdibym', 'przyszłem']) expect(isKnownForm(w, has)).toBe(false)
  })
})

describe('storyText', () => {
  it('collects the sentences, dictations and accepted answers, but not choice options', () => {
    const text = storyText({
      sentences: [{ pl: 'Mam kota.', ru: 'У меня есть кот.' }],
      questions: [
        { type: 'choice', q: 'Кто?', options: ['kotek', 'piesek'], answer: 0 },
        { type: 'listen', text: 'Czytam gazetę.' },
        { type: 'translate', q: 'Я вижу кота.', answer: ['Widzę kota.'] },
        { type: 'input', q: '___', answer: 'studentowi' },
      ],
    })
    expect(text.split('\n')).toEqual(['Mam kota.', 'Czytam gazetę.', 'Widzę kota.', 'studentowi'])
  })
})
