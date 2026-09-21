import type { Card, FormsFile } from '../../../shared/dictionary'
import type { AudioMeta } from './commons'
import type { Draft } from './draft'
import type { TatoebaSentence } from './tatoeba'

export interface SourceVersions {
  polimorf: string
  wiktionary: string
  tatoeba: string
}

export function referencedTatoebaIds(card: Card): number[] {
  const ids = new Set<number>()
  for (const sense of card.senses) {
    for (const example of sense.examples) {
      if (example.source.kind !== 'authored') ids.add(example.source.id)
    }
  }
  for (const example of card.formExamples) {
    if (example.source.kind !== 'authored') ids.add(example.source.id)
  }
  return [...ids].sort((a, b) => a - b)
}

export function buildFormsFile(
  card: Card,
  draft: Draft,
  audio: AudioMeta | null,
  sentences: Map<number, TatoebaSentence>,
  versions: SourceVersions,
): FormsFile {
  if (draft.id !== card.id) throw new Error(`draft ${draft.id} does not belong to card ${card.id}`)
  const tatoeba: FormsFile['tatoeba'] = {}
  for (const id of referencedTatoebaIds(card)) {
    const sentence = sentences.get(id)
    if (!sentence) throw new Error(`card ${card.id}: unknown Tatoeba sentence ${id}`)
    tatoeba[String(id)] = { pl: sentence.pl, ru: sentence.ru }
  }
  return {
    generated: true,
    sources: versions,
    id: card.id,
    lemma: card.lemma,
    pos: card.pos,
    grammarLabel: draft.grammarLabel,
    ipa: draft.ipa,
    audio,
    allForms: draft.allForms,
    tables: draft.tables,
    tatoeba,
  }
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}
