import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { cardSchema, formsFileSchema } from '../../../shared/dictionary'
import { stableJson } from '../lib/build'
import { CONTENT, PUBLIC_DIR } from '../lib/paths'
import { buildIndex, buildPublishedCard } from '../lib/publish'
import { packRecordings } from '../../../app/utils/recordings'
import type { Audio } from '../../../shared/dictionary'

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
const recordings: { lemma: string; audio: Audio }[] = []
for (const card of cards) {
  const forms = formsFileSchema.parse(
    JSON.parse(readFileSync(join(CONTENT.forms, `${card.id}.json`), 'utf8')),
  )
  writeFileSync(
    join(PUBLIC_DIR, 'cards', `${card.id}.json`),
    JSON.stringify(buildPublishedCard(card, forms, index)),
  )
  if (forms.audio) recordings.push({ lemma: card.lemma, audio: forms.audio })
}
writeFileSync(join(PUBLIC_DIR, 'index.json'), stableJson(index))
// Speak buttons play these instead of the system voice when the text is a recorded lemma.
writeFileSync(join(PUBLIC_DIR, 'audio.json'), JSON.stringify(packRecordings(recordings)))
console.log(
  `✓ published ${cards.length} cards and ${recordings.length} recordings to ${PUBLIC_DIR}`,
)
