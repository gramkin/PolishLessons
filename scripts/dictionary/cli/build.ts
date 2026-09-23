import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { cardSchema } from '../../../shared/dictionary'
import { buildFormsFile, referencedTatoebaIds, stableJson } from '../lib/build'
import { fetchAudioMeta, type AudioMeta } from '../lib/commons'
import type { Draft } from '../lib/draft'
import { CONTENT, DATA, SOURCES } from '../lib/paths'
import { readTatoeba } from '../lib/tatoeba'

const cardFiles = existsSync(CONTENT.cards)
  ? readdirSync(CONTENT.cards)
      .filter((f) => f.endsWith('.yml'))
      .sort()
  : []
const cards = cardFiles.map((file) =>
  cardSchema.parse(parseYaml(readFileSync(join(CONTENT.cards, file), 'utf8'))),
)
const drafts = new Map<string, Draft>()
for (const card of cards) {
  const path = join(DATA.drafts, `${card.id}.json`)
  if (!existsSync(path)) throw new Error(`missing draft for ${card.id}: run pnpm dict:draft first`)
  drafts.set(card.id, JSON.parse(readFileSync(path, 'utf8')) as Draft)
}

const cache: Record<string, AudioMeta | null> = existsSync(DATA.audioCache)
  ? JSON.parse(readFileSync(DATA.audioCache, 'utf8'))
  : {}
const wantedAudio = [...drafts.values()]
  .map((d) => d.audioFile)
  .filter((f): f is string => f !== null && !(f in cache))
if (wantedAudio.length > 0) {
  // A Commons outage must not brick the build, and it must not be recorded as
  // "this word has no audio" either: on failure leave the cache untouched so a
  // later run retries these files.
  try {
    const fetched = await fetchAudioMeta(wantedAudio)
    for (const file of wantedAudio) cache[file] = fetched.get(file) ?? null
    mkdirSync(dirname(DATA.audioCache), { recursive: true })
    writeFileSync(DATA.audioCache, stableJson(cache))
  } catch (error) {
    console.warn(
      `! audio metadata unavailable for ${wantedAudio.length} file(s), continuing without it`,
    )
    console.warn(`  ${error instanceof Error ? error.message : String(error)}`)
  }
}

const lock = JSON.parse(readFileSync(DATA.lock, 'utf8')) as Record<string, { sha256: string }>
const versions = {
  polimorf: '0.6.7',
  wiktionary: `sha256:${lock.wiktionary!.sha256.slice(0, 12)}`,
  tatoeba: `sha256:${lock.tatoebaPol!.sha256.slice(0, 12)}`,
}

const wantedIds = new Set(cards.flatMap(referencedTatoebaIds))
const sentences = new Map(
  (
    await readTatoeba({
      pol: SOURCES.tatoebaPol,
      links: SOURCES.tatoebaLinks,
      rus: SOURCES.tatoebaRus,
    })
  )
    .filter((s) => wantedIds.has(s.id))
    .map((s) => [s.id, s]),
)

mkdirSync(CONTENT.forms, { recursive: true })
for (const card of cards) {
  const draft = drafts.get(card.id)!
  const audio = draft.audioFile ? (cache[draft.audioFile] ?? null) : null
  writeFileSync(
    join(CONTENT.forms, `${card.id}.json`),
    stableJson(buildFormsFile(card, draft, audio, sentences, versions)),
  )
}
console.log(`✓ ${cards.length} forms files in ${CONTENT.forms}`)
