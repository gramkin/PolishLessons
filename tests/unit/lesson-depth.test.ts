import { describe, expect, it } from 'vitest'
import { lessonDepth, lessonDepthWarnings } from '../../scripts/lib/lesson-depth'

const quiz = (n: number) =>
  [
    '::quiz',
    '---',
    'questions:',
    ...Array.from({ length: n }, () => '  - type: choice'),
    '---',
    '::',
  ].join('\n')

describe('lessonDepth', () => {
  it('counts spoken examples, quiz questions and the mistakes section', () => {
    const body = [':pron{pl="Mam kota."} — x', '## Типичные ошибки', quiz(3), quiz(2)].join('\n\n')
    expect(lessonDepth(body)).toEqual({ examples: 1, questions: 5, mistakes: true, exam: false })
  })
})

describe('lessonDepthWarnings', () => {
  it('reports what a thin lesson lacks, and nothing for a full one', () => {
    const full = [
      ...Array.from({ length: 10 }, () => ':pron{pl="Tak."}'),
      '## Типичные ошибки',
      quiz(8),
    ].join('\n')
    const lessons = [
      { path: 'lessons/a.md', frontmatter: {}, body: full },
      { path: 'lessons/b.md', frontmatter: {}, body: quiz(2) },
    ]
    expect(lessonDepthWarnings(lessons)).toEqual([
      'lessons/b.md: thin lesson: 0 spoken examples (min 10), 2 questions (min 8), no «Типичные ошибки» section',
    ])
  })
})

describe('an exam page', () => {
  it('needs only enough questions when every question names a skill', () => {
    const quiz = [
      '::quiz',
      '---',
      'questions:',
      ...Array.from({ length: 9 }, () => '  - type: choice\n    skill: reading'),
      '---',
      '::',
    ].join('\n')
    expect(lessonDepth(quiz).exam).toBe(true)
    expect(lessonDepthWarnings([{ path: 'lessons/exam.md', frontmatter: {}, body: quiz }])).toEqual(
      [],
    )
  })
})
