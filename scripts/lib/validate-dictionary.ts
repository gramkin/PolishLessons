import { cardSchema, formsFileSchema, type Card, type FormsFile } from '../../shared/dictionary'
import { AGLT_SUFFIXES } from '../dictionary/lib/rank'
import { tokenize } from '../dictionary/lib/tatoeba'
import type { DataFile } from './load-content'

export interface DictionaryBundle {
  cards: DataFile[]
  forms: DataFile[]
  ranked: { id: string; lemma: string; rank: number }[] | null
  lessonWordIds: string[]
}

export function exampleHasForm(text: string, forms: Set<string>): boolean {
  const lower = new Set([...forms].map((f) => f.toLowerCase()))
  return tokenize(text).some(
    (token) =>
      lower.has(token) ||
      AGLT_SUFFIXES.some(
        (s) => token.length > s.length && token.endsWith(s) && lower.has(token.slice(0, -s.length)),
      ),
  )
}

export function validateDictionary(
  bundle: DictionaryBundle,
  options: { requireLessonCards: boolean },
): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  const cards = new Map<string, { path: string; card: Card }>()
  for (const file of bundle.cards) {
    const parsed = cardSchema.strict().safeParse(file.data)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(
          `${file.path}: ${issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''}${issue.message}`,
        )
      }
      continue
    }
    const card = parsed.data
    if (file.path !== `dictionary/${card.id}.yml`)
      errors.push(`${file.path}: file name must be ${card.id}.yml`)
    cards.set(card.id, { path: file.path, card })
  }

  const forms = new Map<string, FormsFile>()
  for (const file of bundle.forms) {
    const parsed = formsFileSchema.safeParse(file.data)
    if (!parsed.success) {
      errors.push(`${file.path}: invalid generated forms file`)
      continue
    }
    forms.set(parsed.data.id, parsed.data)
    const owner = cards.get(parsed.data.id)
    if (!owner) errors.push(`${file.path}: no matching dictionary/${parsed.data.id}.yml`)
    else if (owner.card.lemma !== parsed.data.lemma)
      errors.push(`${file.path}: id or lemma does not match dictionary/${parsed.data.id}.yml`)
  }

  const ranked = new Map((bundle.ranked ?? []).map((r) => [r.id, r]))
  const rankOwner = new Map<number, string>()

  for (const { path, card } of cards.values()) {
    const all = card.senses.flatMap((s) => s.examples)
    if (all.length < 5 || all.length > 8)
      errors.push(`${path}: ${all.length} examples (expected 5–8)`)

    const formsFile = forms.get(card.id)
    if (!formsFile) {
      errors.push(`${path}: missing forms/${card.id}.json (run pnpm dict:build)`)
    } else {
      const allForms = new Set(formsFile.allForms)
      for (const example of all) {
        if (example.source.kind !== 'authored') {
          const snapshot = formsFile.tatoeba[String(example.source.id)]
          if (
            example.source.kind === 'tatoeba' &&
            (!snapshot || snapshot.pl !== example.pl || snapshot.ru !== example.ru)
          ) {
            errors.push(
              `${path}: example tatoeba #${example.source.id} differs from the Tatoeba text; use source kind "translated" for edited translations`,
            )
          }
          if (example.source.kind === 'translated' && (!snapshot || snapshot.pl !== example.pl)) {
            errors.push(
              `${path}: example translated #${example.source.id} must keep the original Polish sentence`,
            )
          }
        }
        if (!exampleHasForm(example.pl, allForms)) {
          errors.push(`${path}: example "${example.pl}" contains no form of "${card.lemma}"`)
        }
      }
    }

    if (card.aspectPair && !cards.has(card.aspectPair))
      errors.push(`${path}: aspectPair "${card.aspectPair}" is not a card`)
    for (const member of card.family) {
      if (member.id && !cards.has(member.id))
        errors.push(`${path}: family id "${member.id}" is not a card`)
    }

    if (bundle.ranked) {
      const entry = ranked.get(card.id)
      if (!entry) errors.push(`${path}: "${card.lemma}" is not in data/ranked.json`)
      else if (entry.rank !== card.rank)
        errors.push(`${path}: rank ${card.rank} does not match data/ranked.json (${entry.rank})`)
    }
    const other = rankOwner.get(card.rank)
    if (other) errors.push(`${path}: duplicate rank ${card.rank} (also ${other})`)
    else rankOwner.set(card.rank, path)
  }

  for (const id of bundle.lessonWordIds) {
    if (!cards.has(id)) {
      const message = `words: lesson word "${id}" has no dictionary card`
      if (options.requireLessonCards) errors.push(message)
      else warnings.push(message)
    }
  }

  return { errors, warnings }
}
