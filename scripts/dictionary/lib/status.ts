import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { CARD_FORMAT, type CardDepth } from '../../../shared/dictionary'
import type { ExclusionNote, RankedLemma } from './rank'

export interface CardStatus {
  format: number
  depth: CardDepth
}

/** Card format and depth per word id, read straight from the authored cards. */
export function cardStatuses(dir: string): Map<string, CardStatus> {
  const statuses = new Map<string, CardStatus>()
  if (!existsSync(dir)) return statuses
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith('.yml'))
    .sort()) {
    const data = parseYaml(readFileSync(join(dir, file), 'utf8')) as {
      id: string
      format: number
      depth?: CardDepth
    }
    statuses.set(data.id, { format: data.format, depth: data.depth ?? 'standard' })
  }
  return statuses
}

/** Stamps every ranked lemma with the format and depth of its card, or null when there is none. */
export function applyStatuses(
  ranked: RankedLemma[],
  statuses: Map<string, CardStatus>,
): RankedLemma[] {
  return ranked.map((entry) => {
    const status = statuses.get(entry.id)
    return { ...entry, format: status?.format ?? null, depth: status?.depth ?? null }
  })
}

/**
 * Stamps the exclusion note onto every lemma listed in data/overrides.yml, null otherwise.
 * Spreads the entry like applyStatuses does, so the two compose in either order and neither
 * drops a field the other owns.
 */
export function applyExclusions(
  ranked: RankedLemma[],
  notes: Record<string, ExclusionNote>,
): RankedLemma[] {
  return ranked.map((entry) => ({ ...entry, excluded: notes[entry.id] ?? null }))
}

export interface StatusSummary {
  total: number
  withCards: number
  current: number
  deep: string[]
  stale: { id: string; format: number }[]
  missing: string[]
  orphans: string[]
}

export function summarize(ranked: RankedLemma[], statuses: Map<string, CardStatus>): StatusSummary {
  const stale: { id: string; format: number }[] = []
  const missing: string[] = []
  let withCards = 0
  let current = 0
  for (const entry of ranked) {
    const status = statuses.get(entry.id)
    if (status === undefined) {
      missing.push(entry.id)
      continue
    }
    withCards += 1
    if (status.format === CARD_FORMAT) current += 1
    else stale.push({ id: entry.id, format: status.format })
  }
  const ranks = new Set(ranked.map((e) => e.id))
  const orphans = [...statuses.keys()].filter((id) => !ranks.has(id)).sort()
  const deep = [...statuses]
    .filter(([, s]) => s.depth === 'deep')
    .map(([id]) => id)
    .sort()
  return { total: ranked.length, withCards, current, deep, stale, missing, orphans }
}
