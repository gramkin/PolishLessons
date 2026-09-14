import type { CardPos } from '../../../shared/dictionary'

export const HEAD_POS: Record<string, CardPos> = {
  subst: 'noun',
  depr: 'noun',
  adj: 'adj',
  adja: 'adj',
  adjp: 'adj',
  adjc: 'adj',
  adv: 'adv',
  pred: 'adv',
  fin: 'verb',
  bedzie: 'verb',
  aglt: 'verb',
  praet: 'verb',
  impt: 'verb',
  imps: 'verb',
  inf: 'verb',
  pcon: 'verb',
  pant: 'verb',
  pact: 'verb',
  ppas: 'verb',
  ger: 'verb',
  winien: 'verb',
  ppron12: 'pron',
  ppron3: 'pron',
  siebie: 'pron',
  num: 'num',
  numcol: 'num',
  prep: 'prep',
  conj: 'conj',
  comp: 'conj',
  qub: 'part',
  interj: 'interj',
  brev: 'part',
  burk: 'part',
}

export function posOfHead(head: string): CardPos | null {
  return HEAD_POS[head] ?? null
}

export function posForHeads(heads: Map<string, number>): CardPos {
  const weights = new Map<CardPos, number>()
  for (const [head, weight] of heads) {
    const pos = posOfHead(head)
    if (pos) weights.set(pos, (weights.get(pos) ?? 0) + weight)
  }
  let best: CardPos = 'part'
  let bestWeight = -1
  for (const [pos, weight] of weights) {
    if (weight > bestWeight) {
      best = pos
      bestWeight = weight
    }
  }
  return best
}
