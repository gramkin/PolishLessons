import { describe, expect, it } from 'vitest'
import { foldDiacritics, normalizeLoose, normalizeText } from '../../app/utils/normalize'

describe('normalizeText', () => {
  it('lowercases, trims and collapses spaces', () => {
    expect(normalizeText('  Dzień   Dobry ')).toBe('dzień dobry')
  })

  it('strips surrounding punctuation', () => {
    expect(normalizeText('«Cześć!»')).toBe('cześć')
    expect(normalizeText('Jak się masz?')).toBe('jak się masz')
  })
})

describe('foldDiacritics', () => {
  it('folds all Polish diacritics', () => {
    expect(foldDiacritics('ąćęłńóśźż')).toBe('acelnoszz')
  })

  it('folds ё to е but keeps й', () => {
    expect(foldDiacritics('ёжик йогурт')).toBe('ежик йогурт')
  })
})

describe('normalizeLoose', () => {
  it('matches words typed without diacritics', () => {
    expect(normalizeLoose('Żółw')).toBe(normalizeLoose('zolw'))
    expect(normalizeLoose('ZĄB')).toBe('zab')
  })
})
