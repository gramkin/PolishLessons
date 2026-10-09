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

/**
 * Other published cards see a card only through its id, lemma and rank
 * (rank neighbours, aspect pair, family links), and audio.json only through
 * its lemma and recording. While none of those move and no card appears or
 * disappears, republishing just the changed cards and their index rows is
 * exact. Returns why a full publish is needed, or null.
 */
export function partialPublishBlocker(
  current: IndexEntry[],
  cardIdsOnDisk: string[],
  updated: {
    entry: IndexEntry
    recordingUrl: string | null
    publishedRecordingUrl: string | null
  }[],
): string | null {
  const byId = new Map(current.map((entry) => [entry.id, entry]))
  const onDisk = new Set(cardIdsOnDisk)
  if (onDisk.size !== byId.size || [...onDisk].some((id) => !byId.has(id)))
    return 'cards were added or removed'
  for (const { entry, recordingUrl, publishedRecordingUrl } of updated) {
    const before = byId.get(entry.id)
    if (!before) return `${entry.id} is not published yet`
    if (before.lemma !== entry.lemma) return `${entry.id} changed its lemma`
    if (before.rank !== entry.rank) return `${entry.id} changed its rank`
    if (recordingUrl !== publishedRecordingUrl) return `${entry.id} changed its recording`
  }
  return null
}

/** Replace the updated rows in place; ranks did not move, so order holds. */
export function mergeIndex(current: IndexEntry[], updated: IndexEntry[]): IndexEntry[] {
  const byId = new Map(updated.map((entry) => [entry.id, entry]))
  return current.map((entry) => byId.get(entry.id) ?? entry)
}
