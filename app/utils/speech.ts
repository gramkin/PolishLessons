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
