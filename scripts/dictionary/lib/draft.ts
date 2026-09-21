import type { Aspect, CardPos, FormsTable } from '../../../shared/dictionary'
import { buildParadigm } from './paradigm'
import type { MorphRow } from './polimorf'
import type { RankedLemma } from './rank'
import { candidatesForForm, pickCandidates, type TatoebaSentence } from './tatoeba'
import {
  aspectOf,
  chooseAudio,
  mergeEntries,
  selectEntries,
  type WikiEntry,
  type WikiSense,
} from './wiktionary'

export interface Draft {
  id: string
  lemma: string
  rank: number
  pos: CardPos
  override: boolean
  aspect: Aspect | null
  grammarLabel: string | null
  ipa: string | null
  audioFile: string | null
  allForms: string[]
  tables: FormsTable[]
  mismatches: string[]
  wiktionary: {
    found: boolean
    senses: WikiSense[]
    translationsRu: { word: string; senseIndex: string | null }[]
    related: string[]
  }
  candidates: TatoebaSentence[]
  formCandidates: Record<string, TatoebaSentence[]>
  etymology: string[]
  idioms: string[]
  synonyms: string[]
  antonyms: string[]
}

// Negated forms are mechanical (nie + affirmative), so they get a rule line instead of examples.
export function affirmativeForms(allForms: string[]): string[] {
  const set = new Set(allForms.map((f) => f.toLowerCase()))
  return allForms.filter(
    (form) => !(form.toLowerCase().startsWith('nie') && set.has(form.toLowerCase().slice(3))),
  )
}

export function buildDraft(
  entry: RankedLemma,
  rows: MorphRow[],
  wikiEntries: WikiEntry[],
  sentences: TatoebaSentence[],
  tokenIndex: Map<string, number[]>,
): Draft {
  const selected = wikiEntries.length > 0 ? selectEntries(wikiEntries, entry.pos) : []
  const merged = mergeEntries(selected)
  const aspect = entry.pos === 'verb' ? aspectOf(selected) : null
  const paradigm = buildParadigm(entry.pos, entry.lemma, rows, merged.forms, aspect)
  return {
    id: entry.id,
    lemma: entry.lemma,
    rank: entry.rank,
    pos: entry.pos,
    override: entry.override,
    aspect,
    grammarLabel: paradigm.grammarLabel,
    ipa: merged.ipa,
    audioFile: chooseAudio(selected, entry.lemma),
    allForms: paradigm.allForms,
    tables: paradigm.tables,
    mismatches: paradigm.mismatches,
    wiktionary: {
      found: selected.length > 0,
      senses: merged.senses,
      translationsRu: merged.translationsRu,
      related: merged.related,
    },
    candidates: pickCandidates(sentences, tokenIndex, paradigm.allForms, 30),
    formCandidates: Object.fromEntries(
      affirmativeForms(paradigm.allForms).map((form) => [
        form,
        candidatesForForm(sentences, tokenIndex, form, 3),
      ]),
    ),
    etymology: merged.etymology,
    idioms: merged.idioms,
    synonyms: merged.synonyms,
    antonyms: merged.antonyms,
  }
}

export function draftFlags(draft: Draft): string[] {
  const flags: string[] = []
  if (!draft.wiktionary.found) flags.push('нет Wiktionary')
  if (draft.wiktionary.translationsRu.length === 0) flags.push('нет русского перевода')
  if (draft.candidates.length < 5) flags.push(`мало примеров (${draft.candidates.length})`)
  if (draft.override) flags.push('ручная правка')
  if (draft.mismatches.length > 0) flags.push(`расхождения форм (${draft.mismatches.length})`)
  const withoutExample = Object.values(draft.formCandidates).filter(
    (list) => list.length === 0,
  ).length
  if (withoutExample > 0) flags.push(`формы без примеров (${withoutExample})`)
  return flags
}

export function renderBatchReport(label: string, drafts: Draft[]): string {
  const lines = [
    `# Батч ${label}`,
    '',
    `Слов: ${drafts.length}.`,
    '',
    '| № | Слово | Часть речи | Примеров (с переводом) | Отметки |',
    '|---|---|---|---|---|',
    ...drafts.map((d) => {
      const withRu = d.candidates.filter((c) => c.ru !== null).length
      const flags = draftFlags(d)
      return `| ${d.rank} | ${d.lemma} | ${d.pos} | ${d.candidates.length} (${withRu}) | ${flags.length > 0 ? flags.join('; ') : '—'} |`
    }),
    '',
  ]
  const mismatched = drafts.filter((d) => d.mismatches.length > 0)
  if (mismatched.length > 0) {
    lines.push(
      '## Расхождения форм',
      '',
      ...mismatched.flatMap((d) => d.mismatches.map((m) => `- ${d.lemma}: ${m}`)),
      '',
    )
  }
  lines.push(
    '## Проверка владельцем',
    '',
    '- [ ] Список слов проверен (мусор, дубликаты и неверные части речи вынесены в `data/overrides.yml`)',
    '- [ ] Примеры «на проверке» и заметки просмотрены, метки `# review` сняты',
    '',
  )
  return lines.join('\n')
}
