import type { Card, Example } from '../../shared/dictionary'
import { toDay } from './leitner'

export interface Phrase {
  id: string
  pl: string
  ru: string
  from: string
  form: string | null
  box: number
  due: string
  added: string
}

// FNV-1a: a short, stable id for sentences without a Tatoeba number, computable in the browser.
function hash(text: string): string {
  let value = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i)
    value = Math.imul(value, 0x01000193) >>> 0
  }
  return value.toString(16).padStart(8, '0')
}

export function phraseId(example: Pick<Example, 'pl' | 'source'>): string {
  return example.source.kind === 'authored' ? `a${hash(example.pl)}` : `t${example.source.id}`
}

export function toPhrase(
  example: Pick<Example, 'pl' | 'ru' | 'source'>,
  meta: { from: string; form: string | null; now: Date },
): Phrase {
  const day = toDay(meta.now)
  return {
    id: phraseId(example),
    pl: example.pl,
    ru: example.ru,
    from: meta.from,
    form: meta.form,
    box: 1,
    due: day,
    added: day,
  }
}

/**
 * A saved phrase keeps the text it had when it was saved, so later fixes to
 * the card (a completed translation, a corrected typo) never reach it on
 * their own. The id survives a Russian fix: it is the Tatoeba number, or a
 * hash of the Polish. Returns the card's current text when it differs, or
 * null when it is the same or the example is no longer on the card.
 */
export function freshPhraseText(
  phrase: Pick<Phrase, 'id' | 'pl' | 'ru'>,
  card: Pick<Card, 'senses' | 'formExamples'>,
): { pl: string; ru: string } | null {
  const example = [...card.senses.flatMap((s) => s.examples), ...card.formExamples].find(
    (e) => phraseId(e) === phrase.id,
  )
  if (!example || (example.pl === phrase.pl && example.ru === phrase.ru)) return null
  return { pl: example.pl, ru: example.ru }
}
