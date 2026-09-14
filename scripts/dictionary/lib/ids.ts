import { foldDiacritics } from '../../../app/utils/normalize'

export function transliterateId(lemma: string): string {
  return foldDiacritics(lemma.toLowerCase())
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function assignId(lemma: string, reserved: Map<string, string>, taken: Set<string>): string {
  const reservedId = reserved.get(lemma)
  if (reservedId && !taken.has(reservedId)) {
    taken.add(reservedId)
    return reservedId
  }
  const base = transliterateId(lemma) || 'word'
  let id = base
  let n = 2
  while (taken.has(id)) id = `${base}-${n++}`
  taken.add(id)
  return id
}
