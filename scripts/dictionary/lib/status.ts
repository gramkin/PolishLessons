import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { CARD_FORMAT } from '../../../shared/dictionary'
import type { RankedLemma } from './rank'

/** Card format per word id, read straight from the authored cards. */
export function cardFormats(dir: string): Map<string, number> {
  const formats = new Map<string, number>()
  if (!existsSync(dir)) return formats
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith('.yml'))
    .sort()) {
    const data = parseYaml(readFileSync(join(dir, file), 'utf8')) as { id: string; format: number }
    formats.set(data.id, data.format)
  }
  return formats
}

/** Stamps every ranked lemma with the format of its card, or null when there is none. */
export function applyFormats(ranked: RankedLemma[], formats: Map<string, number>): RankedLemma[] {
  return ranked.map((entry) => ({ ...entry, format: formats.get(entry.id) ?? null }))
}

export interface StatusSummary {
  total: number
  withCards: number
  current: number
  stale: { id: string; format: number }[]
  missing: string[]
  orphans: string[]
}

export function summarize(ranked: RankedLemma[], formats: Map<string, number>): StatusSummary {
  const stale: { id: string; format: number }[] = []
  const missing: string[] = []
  let withCards = 0
  let current = 0
  for (const entry of ranked) {
    const format = formats.get(entry.id)
    if (format === undefined) {
      missing.push(entry.id)
      continue
    }
    withCards += 1
    if (format === CARD_FORMAT) current += 1
    else stale.push({ id: entry.id, format })
  }
  const ranks = new Set(ranked.map((e) => e.id))
  const orphans = [...formats.keys()].filter((id) => !ranks.has(id)).sort()
  return { total: ranked.length, withCards, current, stale, missing, orphans }
}
