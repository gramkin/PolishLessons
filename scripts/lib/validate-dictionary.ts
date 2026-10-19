import {
  CARD_FORMAT,
  cardSchema,
  formsFileSchema,
  rowAliases,
  type Card,
  type FormsFile,
} from '../../shared/dictionary'
import {
  AGLT_SUFFIXES,
  EXCLUSION_REASONS,
  REASONS_NEEDING_SEE,
  type ExclusionNote,
} from '../dictionary/lib/rank'
import { affirmativeForms } from '../dictionary/lib/draft'
import { tokenize } from '../dictionary/lib/tatoeba'
import type { DataFile } from './load-content'

export interface DictionaryBundle {
  cards: DataFile[]
  forms: DataFile[]
  ranked: { id: string; lemma: string; rank: number }[] | null
  lessonWordIds: string[]
  /** The exclude list and its notes from data/overrides.yml; omitted disables the check. */
  exclusions?: { exclude: string[]; notes: Record<string, ExclusionNote> }
}

export function exampleHasForm(text: string, forms: Set<string>): boolean {
  const lower = new Set([...forms].map((f) => f.toLowerCase()))
  const byToken = tokenize(text).some(
    (token) =>
      lower.has(token) ||
      AGLT_SUFFIXES.some(
        (s) => token.length > s.length && token.endsWith(s) && lower.has(token.slice(0, -s.length)),
      ),
  )
  if (byToken) return true
  // A form may be analytic — «miło mi», «dzień dobry», «niech zwiększa» — and then
  // it never equals a single token, so fall back to the adjacent-run match. Most
  // cards also carry single-word forms, which the token pass above already finds;
  // this matters for cards whose whole paradigm is one phrase.
  for (const form of lower) if (form.includes(' ') && formInSentence(text, form)) return true
  return false
}

/**
 * Whether a sentence contains a form. Paradigm cells can be analytic — «będę zwiększać»,
 * «niech zwiększa» are two words composed for display — so a phrase has to match as a run
 * of adjacent tokens rather than as a single one.
 */
export function formInSentence(text: string, form: string): boolean {
  const target = tokenize(form)
  if (target.length === 0) return false
  const tokens = tokenize(text)
  if (target.length === 1) return tokens.includes(target[0]!)
  for (let i = 0; i + target.length <= tokens.length; i += 1) {
    if (target.every((part, k) => tokens[i + k] === part)) return true
  }
  return false
}

const MIN_FORM_EXAMPLES = 3
const MAX_SENSE_EXAMPLES = 6
// A deep card earns its keep through explanation, not through sense count:
// words like on or czas need more notes, not more invented meanings.
// The backlog of under-written deep cards is cleared, so falling short is now an
// error rather than a warning: a card marked deep must be worth the label.
const DEEP_MIN_SENSES = 3
const DEEP_MIN_NOTES = 4
const DEEP_MIN_SENTENCES = 12
const DEEP_MIN_IDIOMS = 3

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
    const senseExamples = card.senses.flatMap((s) => s.examples)
    // At least five sense examples per card, at most four per sense: the cap
    // keeps one meaning from swallowing the card, while a word with many
    // distinct uses (się, za) may carry a sense for each of them.
    if (senseExamples.length < 5)
      errors.push(`${path}: ${senseExamples.length} sense examples (need at least 5)`)
    for (const sense of card.senses) {
      if (sense.examples.length > MAX_SENSE_EXAMPLES)
        errors.push(
          `${path}: sense "${sense.id}" has ${sense.examples.length} examples (max ${MAX_SENSE_EXAMPLES})`,
        )
    }
    const all = [...senseExamples, ...card.formExamples]

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

    if (card.format > CARD_FORMAT) {
      errors.push(
        `${path}: format ${card.format} is newer than the current card format ${CARD_FORMAT}`,
      )
    } else if (card.format === CARD_FORMAT) {
      if (card.formExamples.length === 0)
        errors.push(`${path}: format ${CARD_FORMAT} requires examples for every form`)
      if (!card.etymology) errors.push(`${path}: format ${CARD_FORMAT} requires an etymology`)
      if (!card.memory) errors.push(`${path}: format ${CARD_FORMAT} requires a memory hook`)
      if (card.idioms.length === 0)
        errors.push(`${path}: format ${CARD_FORMAT} requires at least one idiom`)
    } else {
      warnings.push(
        `${path}: card format ${card.format}, current is ${CARD_FORMAT} — needs an upgrade`,
      )
    }

    if (card.depth === 'deep') {
      const short: string[] = []
      if (card.senses.length < DEEP_MIN_SENSES)
        short.push(`${card.senses.length} senses (need ${DEEP_MIN_SENSES})`)
      if (card.notes.length < DEEP_MIN_NOTES)
        short.push(`${card.notes.length} notes (need ${DEEP_MIN_NOTES})`)
      if (all.length < DEEP_MIN_SENTENCES)
        short.push(`${all.length} example sentences (need ${DEEP_MIN_SENTENCES})`)
      if (card.idioms.length < DEEP_MIN_IDIOMS)
        short.push(`${card.idioms.length} idioms (need ${DEEP_MIN_IDIOMS})`)
      if (short.length > 0)
        errors.push(`${path}: deep card is below the depth bar — ${short.join(', ')}`)
    }

    if (formsFile && card.formExamples.length > 0) {
      const expected = affirmativeForms(formsFile.allForms)
      // Analytic cells («będę zwiększać», «niech zwiększa») are composed for display and never
      // appear in allForms. They may carry examples, but are not required to: demanding them
      // would fail every imperfective verb card at once.
      const analytic = formsFile.tables.flatMap((table) =>
        table.rows.flatMap((row) => row.cells.flatMap((cell) => cell.filter((f) => /\s/.test(f)))),
      )
      const allowed = new Set([...expected, ...analytic])
      const rowsByForm = new Map<string, Set<string>>()
      const aliases = new Map<string, string>()
      // Rows a form fills where the table shows only that row's examples: two or more
      // distinct rows of one table. A form alone in its table («Положительная») shows
      // every example there.
      const distinctRows = new Map<string, Set<string>>()
      for (const table of formsFile.tables) {
        const tableAliases = rowAliases(table, card.pos)
        for (const [row, target] of tableAliases) aliases.set(row, target)
        const inTable = new Map<string, Set<string>>()
        for (const row of table.rows) {
          if (tableAliases.has(row.label)) continue
          for (const form of row.cells.flat()) {
            const rows = inTable.get(form) ?? new Set<string>()
            rows.add(row.label)
            inTable.set(form, rows)
          }
        }
        for (const [form, rows] of inTable) {
          if (rows.size < 2) continue
          const all = distinctRows.get(form) ?? new Set<string>()
          for (const row of rows) all.add(row)
          distinctRows.set(form, all)
        }
        for (const row of table.rows) {
          for (const form of row.cells.flat()) {
            const rows = rowsByForm.get(form) ?? new Set<string>()
            rows.add(row.label)
            rowsByForm.set(form, rows)
          }
        }
      }
      const seen = new Map<string, number>()
      const sentences = new Set<string>()
      for (const entry of card.formExamples) {
        seen.set(entry.form, (seen.get(entry.form) ?? 0) + 1)
        const key = `${entry.form}|${entry.pl.toLowerCase()}`
        if (sentences.has(key)) {
          errors.push(`${path}: formExamples repeats "${entry.pl}" for "${entry.form}"`)
        }
        sentences.add(key)
        if (!allowed.has(entry.form)) {
          errors.push(`${path}: formExamples has "${entry.form}", which is not an affirmative form`)
        }
        if (entry.cell && !rowsByForm.get(entry.form)?.has(entry.cell)) {
          errors.push(
            `${path}: form example "${entry.pl}" is tagged "${entry.cell}", a row that does not hold "${entry.form}"`,
          )
        } else if (entry.cell && aliases.has(entry.cell)) {
          const target = aliases.get(entry.cell)
          errors.push(
            `${path}: form example "${entry.pl}" is tagged "${entry.cell}", which repeats "${target}"; tag it "${target}"`,
          )
        }
        if (!formInSentence(entry.pl, entry.form)) {
          errors.push(
            `${path}: form example for "${entry.form}" does not contain that form: "${entry.pl}"`,
          )
        }
      }
      for (const [form, count] of seen) {
        if (count < MIN_FORM_EXAMPLES) {
          errors.push(
            `${path}: formExamples has ${count} example(s) for "${form}", need ${MIN_FORM_EXAMPLES}`,
          )
        }
      }
      const formSkips = card.formExamplesSkip.filter((s) => !s.cell)
      const rowSkips = new Set(
        card.formExamplesSkip.filter((s) => s.cell).map((s) => `${s.cell}|${s.form}`),
      )
      for (const skip of card.formExamplesSkip) {
        if (skip.cell && !rowsByForm.get(skip.form)?.has(skip.cell)) {
          errors.push(
            `${path}: formExamplesSkip puts "${skip.form}" in row "${skip.cell}", which does not hold it`,
          )
        } else if (skip.cell && aliases.has(skip.cell)) {
          errors.push(
            `${path}: formExamplesSkip puts "${skip.form}" in row "${skip.cell}", which repeats "${aliases.get(skip.cell)}"`,
          )
        }
      }
      // A form whose examples carry a row shows each row on its own, so each row needs
      // its own three — or a row skip saying why it has none. An alias row (an
      // adjective's vocative) shows the row it repeats and needs nothing.
      const tagged = new Map<string, Map<string, number>>()
      for (const entry of card.formExamples) {
        if (!entry.cell) continue
        const byRow = tagged.get(entry.form) ?? new Map<string, number>()
        byRow.set(entry.cell, (byRow.get(entry.cell) ?? 0) + 1)
        tagged.set(entry.form, byRow)
      }
      for (const [form, byRow] of tagged) {
        for (const row of distinctRows.get(form) ?? []) {
          const count = byRow.get(row) ?? 0
          const rowSkipped = rowSkips.has(`${row}|${form}`)
          if (rowSkipped && count > 0) {
            errors.push(`${path}: "${form}" in row "${row}" is both skipped and exemplified`)
          } else if (!rowSkipped && count < MIN_FORM_EXAMPLES) {
            warnings.push(
              `${path}: "${form}" in row "${row}" has ${count} example(s), need ${MIN_FORM_EXAMPLES}`,
            )
          }
        }
      }
      const skipped = new Map(formSkips.map((s) => [s.form, s.reason]))
      for (const form of skipped.keys()) {
        if (!allowed.has(form))
          errors.push(`${path}: formExamplesSkip has "${form}", which is not an affirmative form`)
        if (seen.has(form)) errors.push(`${path}: "${form}" is both skipped and exemplified`)
      }
      const missing = expected.filter((form) => !seen.has(form) && !skipped.has(form))
      if (missing.length > 0) {
        errors.push(
          `${path}: formExamples missing ${missing.length} form(s): ${missing.slice(0, 5).join(', ')}`,
        )
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

  // Every exclusion carries a checkable reason: the prose lives in YAML comments, but the
  // registry itself must say why, and a form-of must name the card that owns the paradigm.
  if (bundle.exclusions) {
    const { exclude, notes } = bundle.exclusions
    const excluded = new Set(exclude)
    for (const id of exclude) {
      const note = notes[id]
      if (!note) {
        errors.push(`overrides: excluded "${id}" has no entry in excludeNotes`)
        continue
      }
      if (!EXCLUSION_REASONS.includes(note.why)) {
        errors.push(
          `overrides: excludeNotes "${id}": unknown why "${note.why}" (expected ${EXCLUSION_REASONS.join(', ')})`,
        )
        continue
      }
      const needsSee = REASONS_NEEDING_SEE.includes(note.why)
      if (needsSee && !note.see)
        errors.push(`overrides: excludeNotes "${id}": why "${note.why}" requires a see target`)
      if (!needsSee && note.see)
        errors.push(`overrides: excludeNotes "${id}": why "${note.why}" must not have a see target`)
      if (note.see && !cards.has(note.see))
        errors.push(`overrides: excludeNotes "${id}": see "${note.see}" is not a card`)
    }
    for (const id of Object.keys(notes)) {
      if (!excluded.has(id))
        errors.push(`overrides: excludeNotes has "${id}", which is not excluded`)
    }
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
