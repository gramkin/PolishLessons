import { parse as parseYaml } from 'yaml'
import { type CardDepth, AGLT_SUFFIXES, type CardPos } from '../../../shared/dictionary'
import { assignId } from './ids'
import { tagHead, type MorphRow } from './polimorf'
import { posForHeads } from './pos'

export { AGLT_SUFFIXES }

export interface FormIndex {
  forms: Map<string, Set<string>>
  lemmaHeads: Map<string, Map<string, number>>
}

export interface FrequencyEntry {
  form: string
  count: number
}

export interface Overrides {
  forms: Record<string, string>
  add: { lemma: string; pos: CardPos; forms: string[] }[]
  exclude: string[]
  pos: Record<string, CardPos>
}

export interface RankedLemma {
  /** Format of the card for this lemma; null when no card exists yet. */
  format?: number | null
  /** Depth of the card for this lemma; null when no card exists yet. */
  depth?: CardDepth | null
  rank: number
  id: string
  lemma: string
  pos: CardPos
  estimatedCount: number
  override: boolean
}

export function buildFormIndex(rows: Iterable<MorphRow>): FormIndex {
  const forms = new Map<string, Set<string>>()
  const lemmaHeads = new Map<string, Map<string, number>>()
  for (const row of rows) {
    const key = row.form.toLowerCase()
    if (!forms.has(key)) forms.set(key, new Set())
    forms.get(key)!.add(row.lemma)
    if (!lemmaHeads.has(row.lemma)) lemmaHeads.set(row.lemma, new Map())
    const heads = lemmaHeads.get(row.lemma)!
    const head = tagHead(row.tag)
    heads.set(head, (heads.get(head) ?? 0) + 1)
  }
  return { forms, lemmaHeads }
}

export function lemmaCandidates(index: FormIndex, form: string): Set<string> {
  const direct = index.forms.get(form)
  if (direct) return direct
  for (const suffix of AGLT_SUFFIXES) {
    if (form.length > suffix.length && form.endsWith(suffix)) {
      const stem = index.forms.get(form.slice(0, -suffix.length))
      if (stem) return stem
    }
  }
  return new Set()
}

export function parseFrequencyList(text: string, limit: number): FrequencyEntry[] {
  const entries: FrequencyEntry[] = []
  for (const line of text.split('\n')) {
    const [form, count] = line.trim().split(/\s+/)
    if (!form || !count) continue
    entries.push({ form: form.toLowerCase(), count: Number(count) })
    if (entries.length === limit) break
  }
  return entries
}

export function parseOverrides(yamlText: string): Overrides {
  const raw = (parseYaml(yamlText) ?? {}) as Partial<Overrides>
  return {
    forms: raw.forms ?? {},
    add: raw.add ?? [],
    exclude: raw.exclude ?? [],
    pos: raw.pos ?? {},
  }
}

function isLowercase(lemma: string): boolean {
  return lemma === lemma.toLowerCase()
}

export function rankLemmas(
  freq: FrequencyEntry[],
  index: FormIndex,
  overrides: Overrides,
  options: { iterations: number; limit: number; reserved: Map<string, string> },
): RankedLemma[] {
  const excluded = new Set(overrides.exclude)
  const formCount = new Map(freq.map((e) => [e.form, e.count]))
  const overridden = new Set<string>([
    ...Object.values(overrides.forms),
    ...overrides.add.map((a) => a.lemma),
    ...Object.keys(overrides.pos),
  ])
  const addedForms = new Set(overrides.add.flatMap((a) => a.forms))

  const resolved = freq
    .filter((entry) => !addedForms.has(entry.form))
    .map((entry) => {
      const forced = overrides.forms[entry.form]
      if (forced) return { count: entry.count, candidates: [forced] }
      const all = [...lemmaCandidates(index, entry.form)].filter((l) => !excluded.has(l))
      const lower = all.filter(isLowercase)
      return { count: entry.count, candidates: lower.length > 0 ? lower : all }
    })
    .filter((r) => r.candidates.length > 0)

  let totals = new Map<string, number>()
  for (const r of resolved) {
    for (const lemma of r.candidates)
      totals.set(lemma, (formCount.get(lemma.toLowerCase()) ?? 0) + 1)
  }
  for (let i = 0; i < options.iterations; i++) {
    const next = new Map<string, number>()
    for (const r of resolved) {
      const weight = r.candidates.reduce((sum, l) => sum + (totals.get(l) ?? 0), 0)
      for (const lemma of r.candidates) {
        const share =
          weight > 0 ? (r.count * (totals.get(lemma) ?? 0)) / weight : r.count / r.candidates.length
        next.set(lemma, (next.get(lemma) ?? 0) + share)
      }
    }
    totals = next
  }

  for (const added of overrides.add) {
    const count = added.forms.reduce((sum, form) => sum + (formCount.get(form) ?? 0), 0)
    totals.set(added.lemma, (totals.get(added.lemma) ?? 0) + count)
  }

  const addedPos = new Map(overrides.add.map((a) => [a.lemma, a.pos]))
  const sorted = [...totals.entries()]
    .filter(([lemma]) => !excluded.has(lemma))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'))
    .slice(0, options.limit)

  const taken = new Set<string>()
  return sorted.map(([lemma, count], i) => ({
    rank: i + 1,
    id: assignId(lemma, options.reserved, taken),
    lemma,
    pos:
      overrides.pos[lemma] ??
      addedPos.get(lemma) ??
      posForHeads(index.lemmaHeads.get(lemma) ?? new Map()),
    estimatedCount: Math.round(count),
    override: overridden.has(lemma),
  }))
}
