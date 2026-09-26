import type {
  Card,
  CardRef,
  FormsFile,
  IndexEntry,
  PublishedCard,
} from '../../../shared/dictionary'

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

function toRef(entry: IndexEntry | undefined): CardRef | null {
  return entry ? { id: entry.id, lemma: entry.lemma, rank: entry.rank } : null
}

/**
 * The card page needs only four things from the index: its two rank
 * neighbours, its aspect pair, and which of its family members have cards.
 * Resolving them here keeps the index off the page entirely.
 */
export function buildPublishedCard(
  card: Card,
  forms: FormsFile,
  index: IndexEntry[],
): PublishedCard {
  // buildIndex returns the cards already in rank order.
  const at = index.findIndex((entry) => entry.id === card.id)
  const published = new Set(index.map((entry) => entry.id))
  return {
    card,
    forms,
    prev: toRef(at > 0 ? index[at - 1] : undefined),
    next: toRef(at === -1 ? undefined : index[at + 1]),
    aspectPair: toRef(
      card.aspectPair ? index.find((entry) => entry.id === card.aspectPair) : undefined,
    ),
    familyIds: card.family
      .map((member) => member.id)
      .filter((id): id is string => Boolean(id) && published.has(id!)),
  }
}
