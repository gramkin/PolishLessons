import type { Card, FormsFile, IndexEntry, PublishedCard } from '../../../shared/dictionary'

export function glossOf(card: Card): string {
  return card.senses[0]?.ru ?? ''
}

export function buildIndex(cards: Card[]): IndexEntry[] {
  return [...cards]
    .sort((a, b) => a.rank - b.rank)
    .map((card) => ({
      id: card.id,
      lemma: card.lemma,
      rank: card.rank,
      pos: card.pos,
      gloss: glossOf(card),
    }))
}

export function buildPublishedCard(card: Card, forms: FormsFile): PublishedCard {
  return { card, forms }
}
