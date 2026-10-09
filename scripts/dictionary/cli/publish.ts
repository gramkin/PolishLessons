import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import {
  cardSchema,
  formsFileSchema,
  type Audio,
  type Card,
  type IndexEntry,
} from '../../../shared/dictionary'
import { stableJson } from '../lib/build'
import { CONTENT, PUBLIC_DIR } from '../lib/paths'
import {
  buildIndex,
  buildPublishedCard,
  glossOf,
  mergeIndex,
  partialPublishBlocker,
} from '../lib/publish'
import { findRecording, packRecordings, type RecordingsFile } from '../../../app/utils/recordings'

// usage: pnpm dict:publish             — all cards
//        pnpm dict:publish --ids a,b   — only these cards, when no other card can see the change
const args = process.argv.slice(2)
const idsArg = args.includes('--ids') ? args[args.indexOf('--ids') + 1] : undefined

const files = existsSync(CONTENT.cards)
  ? readdirSync(CONTENT.cards)
      .filter((f) => f.endsWith('.yml'))
      .sort()
  : []
const readCard = (id: string): Card =>
  cardSchema.parse(parseYaml(readFileSync(join(CONTENT.cards, `${id}.yml`), 'utf8')))
const readForms = (id: string) =>
  formsFileSchema.parse(JSON.parse(readFileSync(join(CONTENT.forms, `${id}.json`), 'utf8')))

function publishAll() {
  const cards = files.map((file) => readCard(file.replace(/\.yml$/, '')))
  const index = buildIndex(cards)

  rmSync(PUBLIC_DIR, { recursive: true, force: true })
  mkdirSync(join(PUBLIC_DIR, 'cards'), { recursive: true })
  const recordings: { lemma: string; audio: Audio }[] = []
  for (const card of cards) {
    const forms = readForms(card.id)
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
}

/** Returns false, after saying why, when only a full publish would be correct. */
function publishSome(ids: string[]): boolean {
  const indexPath = join(PUBLIC_DIR, 'index.json')
  const audioPath = join(PUBLIC_DIR, 'audio.json')
  if (!existsSync(indexPath) || !existsSync(audioPath)) {
    console.log('… nothing published yet')
    return false
  }
  const missing = ids.filter((id) => !files.includes(`${id}.yml`))
  if (missing.length > 0) throw new Error(`no card for: ${missing.join(', ')}`)

  const current = JSON.parse(readFileSync(indexPath, 'utf8')) as IndexEntry[]
  const audio = JSON.parse(readFileSync(audioPath, 'utf8')) as RecordingsFile
  const updated = ids.map((id) => {
    const card = readCard(id)
    const forms = readForms(id)
    const entry: IndexEntry = {
      id: card.id,
      lemma: card.lemma,
      rank: card.rank,
      pos: card.pos,
      gloss: glossOf(card),
    }
    return {
      card,
      forms,
      entry,
      recordingUrl: forms.audio?.url ?? null,
      publishedRecordingUrl: findRecording(audio, card.lemma)?.url ?? null,
    }
  })

  const blocker = partialPublishBlocker(
    current,
    files.map((f) => f.replace(/\.yml$/, '')),
    updated,
  )
  if (blocker) {
    console.log(`… ${blocker}`)
    return false
  }

  const index = mergeIndex(
    current,
    updated.map((u) => u.entry),
  )
  for (const { card, forms } of updated) {
    writeFileSync(
      join(PUBLIC_DIR, 'cards', `${card.id}.json`),
      JSON.stringify(buildPublishedCard(card, forms, index)),
    )
  }
  writeFileSync(indexPath, stableJson(index))
  console.log(`✓ published ${ids.join(', ')} to ${PUBLIC_DIR}`)
  return true
}

if (idsArg === undefined) publishAll()
else if (!publishSome(idsArg.split(',').filter(Boolean))) {
  console.log('… running a full publish instead')
  publishAll()
}
