const FOLD: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
  ё: 'е',
}

const EDGE_PUNCTUATION = /^[\s.,!?;:«»"„”…]+|[\s.,!?;:«»"„”…]+$/g

export function normalizeText(s: string): string {
  return s.toLowerCase().replace(EDGE_PUNCTUATION, '').replace(/\s+/g, ' ')
}

export function foldDiacritics(s: string): string {
  return s.replace(/[ąćęłńóśźżё]/g, (c) => FOLD[c] ?? c)
}

export function normalizeLoose(s: string): string {
  return foldDiacritics(normalizeText(s))
}
