import { describe, expect, it } from 'vitest'
import { pickPolishVoice, speakableCell } from '../../app/utils/speech'

describe('pickPolishVoice', () => {
  it('returns null without Polish voices', () => {
    expect(pickPolishVoice([{ lang: 'ru-RU' }, { lang: 'en-US' }])).toBeNull()
  })

  it('prefers a local pl-PL voice', () => {
    const voices = [
      { lang: 'pl-PL', localService: false, name: 'remote' },
      { lang: 'pl-PL', localService: true, name: 'local' },
    ]
    expect(pickPolishVoice(voices)?.name).toBe('local')
  })

  it('accepts pl_PL and bare pl', () => {
    expect(pickPolishVoice([{ lang: 'en-GB' }, { lang: 'pl_PL' }])?.lang).toBe('pl_PL')
    expect(pickPolishVoice([{ lang: 'PL' }])?.lang).toBe('PL')
  })
})

describe('speakableCell', () => {
  it('reads words, phrases and syllables', () => {
    expect(speakableCell('książkę')).toBe('książkę')
    expect(speakableCell('piszę, piszesz')).toBe('piszę, piszesz')
    expect(speakableCell('dzi')).toBe('dzi')
    expect(speakableCell('ją')).toBe('ją')
  })

  it('cuts Russian glosses and case notes, and lists alternatives', () => {
    expect(speakableCell('cię (ciebie)')).toBe('cię')
    expect(speakableCell('nowy (неодуш.) / nowego (одуш.)')).toBe('nowy, nowego')
    expect(speakableCell('niż + именительный')).toBe('niż')
    expect(speakableCell('liść (дерева), kartka (бумаги)')).toBe('liść, kartka')
  })

  it('stays silent on notation', () => {
    for (const cell of [
      '-ę',
      '-isz / -ysz',
      'ą',
      'sz',
      'rz',
      'dź',
      'poeta → poeci',
      'падежи и предлоги',
      '',
    ])
      expect(speakableCell(cell)).toBeNull()
  })
})
