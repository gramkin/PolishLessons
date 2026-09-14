import { readLines } from './lines'
import { AGLT_SUFFIXES } from './rank'

export interface TatoebaSentence {
  id: number
  pl: string
  ru: string | null
}

export async function readTatoeba(paths: {
  pol: string
  links: string
  rus: string
}): Promise<TatoebaSentence[]> {
  const polish = new Map<number, string>()
  for await (const line of readLines(paths.pol)) {
    const [id, , text] = line.split('\t')
    if (id && text) polish.set(Number(id), text)
  }
  const linkTo = new Map<number, number>()
  for await (const line of readLines(paths.links)) {
    const [plId, ruId] = line.split('\t').map(Number)
    if (plId !== undefined && ruId !== undefined && polish.has(plId) && !linkTo.has(plId))
      linkTo.set(plId, ruId)
  }
  const wantedRu = new Set(linkTo.values())
  const russian = new Map<number, string>()
  for await (const line of readLines(paths.rus)) {
    const [id, , text] = line.split('\t')
    if (id && text && wantedRu.has(Number(id))) russian.set(Number(id), text)
  }
  return [...polish.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, pl]) => {
      const ruId = linkTo.get(id)
      return { id, pl, ru: ruId !== undefined ? (russian.get(ruId) ?? null) : null }
    })
}

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\p{L}+/gu) ?? []
}

export function buildTokenIndex(sentences: TatoebaSentence[]): Map<string, number[]> {
  const index = new Map<string, number[]>()
  sentences.forEach((sentence, position) => {
    for (const token of new Set(tokenize(sentence.pl))) {
      if (!index.has(token)) index.set(token, [])
      index.get(token)!.push(position)
    }
  })
  return index
}

export function matchedForms(tokens: string[], forms: Set<string>): string[] {
  const matched: string[] = []
  for (const token of tokens) {
    if (forms.has(token)) {
      matched.push(token)
      continue
    }
    const suffix = AGLT_SUFFIXES.find(
      (s) => token.length > s.length && token.endsWith(s) && forms.has(token.slice(0, -s.length)),
    )
    if (suffix) matched.push(token.slice(0, -suffix.length))
  }
  return matched
}

export function pickCandidates(
  sentences: TatoebaSentence[],
  index: Map<string, number[]>,
  forms: string[],
  limit = 30,
): TatoebaSentence[] {
  const formSet = new Set(forms.map((f) => f.toLowerCase()))
  const positions = new Set<number>()
  for (const form of formSet) for (const p of index.get(form) ?? []) positions.add(p)

  const pool = [...positions]
    .map((p) => ({ sentence: sentences[p]!, tokens: tokenize(sentences[p]!.pl) }))
    .sort(
      (a, b) =>
        Number(a.sentence.ru === null) - Number(b.sentence.ru === null) ||
        a.tokens.length - b.tokens.length ||
        a.sentence.id - b.sentence.id,
    )

  const picked: TatoebaSentence[] = []
  const taken = new Set<number>()
  const covered = new Set<string>()
  for (const item of pool) {
    if (picked.length === limit) break
    if (item.tokens.length > 12) continue
    const fresh = matchedForms(item.tokens, formSet).filter((f) => !covered.has(f))
    if (fresh.length === 0) continue
    fresh.forEach((f) => covered.add(f))
    picked.push(item.sentence)
    taken.add(item.sentence.id)
  }
  for (const item of pool) {
    if (picked.length === limit) break
    if (taken.has(item.sentence.id)) continue
    picked.push(item.sentence)
    taken.add(item.sentence.id)
  }
  return picked
}
