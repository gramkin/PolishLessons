import { describe, expect, it } from 'vitest'
import { findRecording, packRecordings, recordingKey } from '../../app/utils/recordings'

const commons = (path: string) => `https://upload.wikimedia.org/wikipedia/commons/${path}`
const maz = {
  file: 'Pl-mąż.ogg',
  url: commons('7/70/Pl-m%C4%85%C5%BC.ogg'),
  license: 'CC BY 2.5',
  author: 'Derbeth',
}
const dobry = {
  file: 'Pl-dobry.ogg',
  url: commons('3/33/Pl-dobry.ogg'),
  license: 'CC BY 2.5',
  author: 'Derbeth',
}

describe('recordingKey', () => {
  it('ignores case, surrounding punctuation and Unicode form', () => {
    expect(recordingKey('  Mąż! ')).toBe('mąż')
    expect(recordingKey('mąż')).toBe('mąż')
  })
})

describe('packRecordings / findRecording', () => {
  const file = packRecordings([
    { lemma: 'mąż', audio: maz },
    { lemma: 'dobry', audio: dobry },
  ])

  it('stores the Commons prefix, author and licence once', () => {
    expect(file.authors).toEqual(['Derbeth'])
    expect(file.licenses).toEqual(['CC BY 2.5'])
    expect(file.words['mąż']).toEqual(['7/70/Pl-m%C4%85%C5%BC.ogg', 0, 0])
  })

  it('round-trips a recording', () => {
    expect(findRecording(file, 'Mąż')).toEqual({
      url: maz.url,
      author: 'Derbeth',
      license: 'CC BY 2.5',
    })
  })

  it('finds nothing for phrases or unrecorded words', () => {
    expect(findRecording(file, 'mąż i żona')).toBeNull()
    expect(findRecording(file, 'żona')).toBeNull()
  })

  it('keeps a URL outside Commons whole', () => {
    const other = packRecordings([
      { lemma: 'kot', audio: { ...dobry, url: 'https://example.org/kot.ogg' } },
    ])
    expect(findRecording(other, 'kot')?.url).toBe('https://example.org/kot.ogg')
  })
})
