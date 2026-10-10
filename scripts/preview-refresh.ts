import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { cardSchema, formsFileSchema, type IndexEntry } from '../shared/dictionary'
import type { SearchDoc } from '../shared/search'
import { findRecording, type RecordingsFile } from '../app/utils/recordings'
import { stableJson } from './dictionary/lib/build'
import {
  buildPublishedCard,
  indexEntryOf,
  mergeIndex,
  partialPublishBlocker,
} from './dictionary/lib/publish'
import { writeDrills } from './lib/drills'
import { loadContent } from './lib/load-content'
import {
  diffFingerprints,
  fingerprintFile,
  planRefresh,
  patchSearchDocs,
  routeFiles,
  type Fingerprints,
} from './lib/refresh'
import { buildSearchDocs } from './lib/search-docs'

// usage: pnpm preview:refresh   — rebuild in .output/public only the pages changed since the last build
//        --snapshot / --commit  — used by `pnpm generate` to record what that build was made from

const OUTPUT = '.output'
const BUILT = join(OUTPUT, 'public')
const RECORD = join(OUTPUT, 'preview-fingerprints.json')
const CACHE = 'node_modules/.cache/preview-refresh'
const PENDING = join(CACHE, 'pending.json')

// Everything the static build is made from. Generated files are left out: they follow their sources.
const INPUTS = [
  'app',
  'shared',
  'content',
  'public',
  'nuxt.config.ts',
  'content.config.ts',
  'package.json',
  'pnpm-lock.yaml',
  'tsconfig.json',
  'scripts/build-search-index.ts',
  'scripts/build-drills.ts',
  'scripts/lib/drills.ts',
  'scripts/lib/search-docs.ts',
  'scripts/lib/load-content.ts',
  'scripts/dictionary/lib/publish.ts',
  'scripts/dictionary/cli/publish.ts',
]
const isGenerated = (path: string) =>
  path.startsWith('public/dictionary/') ||
  path.startsWith('public/drills/') ||
  path === 'public/search-index.json' ||
  path.endsWith('.DS_Store')

function listInputs(): string[] {
  return INPUTS.filter((input) => existsSync(input)).flatMap((input) =>
    statSync(input).isDirectory()
      ? readdirSync(input, { recursive: true, encoding: 'utf8' })
          .map((name) => join(input, name).split('\\').join('/'))
          .filter((path) => statSync(path).isFile())
      : [input],
  )
}

function currentFingerprints(): Fingerprints {
  const result: Fingerprints = {}
  for (const path of listInputs()
    .filter((p) => !isGenerated(p))
    .sort())
    Object.assign(result, fingerprintFile(path, readFileSync(path, 'utf8')))
  return result
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function fullGenerate(reason: string): never {
  console.log(`… ${reason} — running a full pnpm generate`)
  const { status } = spawnSync('pnpm', ['generate'], { stdio: 'inherit' })
  process.exit(status ?? 1)
}

/** Copy files that exist in `from` but not in `to`: chunk names are content hashes, so nothing is overwritten. */
function copyMissing(from: string, to: string): number {
  let copied = 0
  for (const name of readdirSync(from, { recursive: true, encoding: 'utf8' })) {
    const source = join(from, name)
    const target = join(to, name)
    if (statSync(source).isFile() && !existsSync(target)) {
      mkdirSync(dirname(target), { recursive: true })
      copyFileSync(source, target)
      copied++
    }
  }
  return copied
}

/** Publish the edited cards into both the source public dir (read while prerendering) and the build. */
function refreshCards(cardIds: string[]): string | null {
  const builtIndex = readJson<IndexEntry[]>(join(BUILT, 'dictionary', 'index.json'))
  const builtAudio = readJson<RecordingsFile>(join(BUILT, 'dictionary', 'audio.json'))
  const updated = cardIds.map((id) => {
    const card = cardSchema.parse(
      parseYaml(readFileSync(join('content', 'dictionary', `${id}.yml`), 'utf8')),
    )
    const forms = formsFileSchema.parse(readJson(join('content', 'forms', `${id}.json`)))
    return {
      card,
      forms,
      entry: indexEntryOf(card),
      recordingUrl: forms.audio?.url ?? null,
      publishedRecordingUrl: findRecording(builtAudio, card.lemma)?.url ?? null,
    }
  })
  const onDisk = readdirSync(join('content', 'dictionary'))
    .filter((f) => f.endsWith('.yml'))
    .map((f) => f.replace(/\.yml$/, ''))
  const blocker = partialPublishBlocker(builtIndex, onDisk, updated)
  if (blocker) return blocker

  const index = mergeIndex(
    builtIndex,
    updated.map((u) => u.entry),
  )
  for (const dir of [join('public', 'dictionary'), join(BUILT, 'dictionary')]) {
    for (const { card, forms } of updated)
      writeFileSync(
        join(dir, 'cards', `${card.id}.json`),
        JSON.stringify(buildPublishedCard(card, forms, index)),
      )
    writeFileSync(join(dir, 'index.json'), stableJson(index))
  }
  return null
}

function refreshSearch(cardIds: string[], owners: string[]) {
  if (owners.length === 0) return
  const fresh = buildSearchDocs(loadContent('content', { cardIds }))
  for (const path of [join('public', 'search-index.json'), join(BUILT, 'search-index.json')]) {
    if (!existsSync(path)) continue
    const { docs } = readJson<{ docs: SearchDoc[] }>(path)
    writeFileSync(path, JSON.stringify({ docs: patchSearchDocs(docs, fresh, owners) }))
  }
}

async function prerender(routes: string[]): Promise<string> {
  const { loadNuxt, buildNuxt } = await import('nuxt/kit')
  const output = join(CACHE, 'output')
  const nuxt = await loadNuxt({
    cwd: process.cwd(),
    ready: false,
    // `_generate` is internal (not in NuxtConfig); `nuxt generate` passes it the same way.
    overrides: {
      logLevel: 'silent',
      _generate: true,
      // Same id as the full build, so the new pages and the old ones agree on the app manifest.
      buildId: readJson<{ id: string }>(join(BUILT, '_nuxt', 'builds', 'latest.json')).id,
      // Its own build dir, so a running `pnpm dev` keeps its .nuxt.
      buildDir: join(CACHE, 'build'),
      nitro: {
        static: true,
        output: { dir: output },
        prerender: { crawlLinks: false, routes, failOnError: true },
      },
    } as NonNullable<Parameters<typeof loadNuxt>[0]>['overrides'],
  })
  await nuxt.ready()
  await buildNuxt(nuxt)
  await nuxt.close()
  return join(output, 'public')
}

async function refresh() {
  const started = Date.now()
  if (!existsSync(RECORD) || !existsSync(join(BUILT, '_nuxt', 'builds', 'latest.json')))
    fullGenerate('no full build to refresh yet')

  const now = currentFingerprints()
  const plan = planRefresh(
    diffFingerprints(readJson<Fingerprints>(RECORD), now),
    readdirSync(join('content', 'books'))
      .filter((f) => f.endsWith('.yml'))
      .map((f) => f.replace(/\.yml$/, '')),
  )
  if (plan.kind === 'none') {
    console.log('✓ nothing changed since the last build')
    return
  }
  if (plan.kind === 'full') fullGenerate(plan.reason)

  if (plan.cardIds.length > 0) {
    const blocker = refreshCards(plan.cardIds)
    if (blocker) fullGenerate(blocker)
    // Drills are sentences from cards: rebuild them from the freshly published cards (about a second).
    writeDrills('public')
    writeDrills(BUILT)
  }
  refreshSearch(plan.cardIds, plan.searchOwners)

  console.log(`… rebuilding ${plan.routes.join(', ')}`)
  const fresh = await prerender(plan.routes)
  for (const route of plan.routes)
    for (const file of routeFiles(route)) {
      mkdirSync(dirname(join(BUILT, file)), { recursive: true })
      copyFileSync(join(fresh, file), join(BUILT, file))
    }
  const chunks = copyMissing(join(fresh, '_nuxt'), join(BUILT, '_nuxt'))
  // Client-side content queries read these dumps; they are rebuilt whole from the current content.
  cpSync(join(fresh, '__nuxt_content'), join(BUILT, '__nuxt_content'), { recursive: true })

  writeFileSync(RECORD, JSON.stringify(now))
  const seconds = ((Date.now() - started) / 1000).toFixed(1)
  console.log(
    `✓ refreshed ${plan.routes.length} page(s) and ${chunks} new script file(s) in ${seconds} s — reload the preview`,
  )
}

const mode = process.argv[2]
if (mode === '--snapshot') {
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(PENDING, JSON.stringify(currentFingerprints()))
} else if (mode === '--commit') {
  renameSync(PENDING, RECORD)
} else {
  await refresh()
}
