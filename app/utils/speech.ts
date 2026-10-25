export interface VoiceLike {
  lang: string
  localService?: boolean
}

function normalizedLang(voice: VoiceLike): string {
  return voice.lang.toLowerCase().replace('_', '-')
}

export function pickPolishVoice<T extends VoiceLike>(voices: readonly T[]): T | null {
  const polish = voices.filter((v) => normalizedLang(v).startsWith('pl'))
  if (polish.length === 0) return null
  const exact = polish.filter((v) => normalizedLang(v) === 'pl-pl')
  return exact.find((v) => v.localService) ?? exact[0] ?? polish[0] ?? null
}

const VOWEL = /[aeiouyąęó]/i
const CYRILLIC = /[а-яё]/i

/**
 * What a table cell in a Polish column should read aloud, or null when it
 * is notation rather than speech: an ending (-ę), an arrow chain, a lone
 * letter, or a letter group without a vowel (sz, rz, dź), which a voice
 * would spell out. Russian glosses in brackets and "+ case" notes are cut;
 * alternatives split by " / " are read as a list.
 */
export function speakableCell(cell: string): string | null {
  const text = cell
    .replace(/\([^)]*\)/g, '')
    .replace(/\s\+\s.*$/, '')
    .split(/\s+\/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ')
    .replace(/\s+,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim()
  if (!text || CYRILLIC.test(text) || text.includes('→') || text.startsWith('-')) return null
  const letters = text.replace(/[^\p{L}]/gu, '')
  if (letters.length < 2 || !VOWEL.test(letters)) return null
  return text
}

/** Written name → what a Polish voice should say for it, e.g. `Buck: 'Bak'`. */
export type Respelling = Readonly<Record<string, string>>

const WORD = /\p{L}+(?:['’]\p{L}+)*/gu
// Case endings a declined foreign name can take, joined by an apostrophe after a
// silent letter (Dave'a). Anything else after a listed name makes another word.
const ENDING = /^['’]?(?:a|u|y|i|ę|ą|ie|em|iem|owi|owie|ów|om|ami|ach|ego|emu|m)$/

/**
 * Text for a Polish voice with foreign names said the way the original language
 * says them: the voice reads Buck by Polish spelling as «буцк». A word listed
 * in the table is replaced whole; a listed name plus a case ending keeps the
 * ending (Bucka → Baka). Matching is case-sensitive, so a capitalised name
 * never catches a common word.
 */
export function respell(text: string, table: Respelling): string {
  return text.replace(WORD, (word) => {
    const exact = table[word]
    if (exact !== undefined) return exact
    let best = ''
    for (const name of Object.keys(table)) {
      if (
        name.length > best.length &&
        word.startsWith(name) &&
        ENDING.test(word.slice(name.length))
      ) {
        best = name
      }
    }
    return best ? table[best] + word.slice(best.length).replace(/^['’]/, '') : word
  })
}
