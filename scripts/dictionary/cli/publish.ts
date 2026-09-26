import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { cardSchema, formsFileSchema } from '../../../shared/dictionary'
import { stableJson } from '../lib/build'
import { CONTENT, PUBLIC_DIR } from '../lib/paths'
import { buildIndex, buildPublishedCard } from '../lib/publish'

const files = existsSync(CONTENT.cards)
  ? readdirSync(CONTENT.cards)
      .filter((f) => f.endsWith('.yml'))
      .sort()
  : []
const cards = files.map((file) =>
  cardSchema.parse(parseYaml(readFileSync(join(CONTENT.cards, file), 'utf8'))),
)

const index = buildIndex(cards)

rmSync(PUBLIC_DIR, { recursive: true, force: true })
mkdirSync(join(PUBLIC_DIR, 'cards'), { recursive: true })
for (const card of cards) {
  const forms = formsFileSchema.parse(
    JSON.parse(readFileSync(join(CONTENT.forms, `${card.id}.json`), 'utf8')),
  )
  writeFileSync(
    join(PUBLIC_DIR, 'cards', `${card.id}.json`),
    JSON.stringify(buildPublishedCard(card, forms, index)),
  )
}
writeFileSync(join(PUBLIC_DIR, 'index.json'), stableJson(index))
console.log(`✓ published ${cards.length} cards to ${PUBLIC_DIR}`)
