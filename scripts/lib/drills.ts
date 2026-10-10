import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import type { PublishedCard } from '../../shared/dictionary'
import { drillFileSchema } from '../../shared/schemas'
import { drillItems, type DrillFile } from '../../app/utils/drill'

export const DRILLS_SOURCE = 'content/drills.yml'
export const DRILLS_DIR = 'drills'

/**
 * Write one `drills/<id>.json` per drill into `publicDir`, built from the
 * published cards in `<publicDir>/dictionary/cards` (reading those takes about
 * a second, so a preview refresh can rebuild every drill after a card edit).
 */
export function writeDrills(publicDir: string): { id: string; items: number }[] {
  const { drills } = drillFileSchema.parse(parseYaml(readFileSync(DRILLS_SOURCE, 'utf8')))
  const cardsDir = join(publicDir, 'dictionary', 'cards')
  if (!existsSync(cardsDir)) throw new Error(`${cardsDir} is missing: run pnpm dict:publish first`)
  const cards = readdirSync(cardsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(cardsDir, f), 'utf8')) as PublishedCard)
  const out = join(publicDir, DRILLS_DIR)
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  return drills.map((drill) => {
    const file: DrillFile = {
      id: drill.id,
      title: drill.title,
      instruction: drill.instruction,
      items: drillItems(drill, cards),
    }
    writeFileSync(join(out, `${drill.id}.json`), JSON.stringify(file))
    return { id: drill.id, items: file.items.length }
  })
}
