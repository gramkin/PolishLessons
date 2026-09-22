import { existsSync, readFileSync } from 'node:fs'
import { DATA } from './paths'
import type { RankedLemma } from './rank'

/** Reads one registry file. A missing file reads as empty, so a registry stays optional. */
export function readRegistry(path: string): RankedLemma[] {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as RankedLemma[]) : []
}

/**
 * Every lemma the dictionary knows: the generated frequency list plus the hand-curated
 * words. The two files are deliberately never merged on disk — `data/ranked.json` is
 * rebuilt from the frequency corpus by `dict:rank`, so anything curated by hand lives in
 * `data/words.json` or the next re-rank would silently drop it.
 */
export function readAllRegistries(): RankedLemma[] {
  return [...readRegistry(DATA.ranked), ...readRegistry(DATA.words)]
}
