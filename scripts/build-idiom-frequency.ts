import { createReadStream, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { createGunzip } from 'node:zlib'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { compile, IdiomCounter, idiomTokens, type Lexicon } from './lib/idiom-frequency'

// usage: pnpm idioms:count [--limit N]
// Counts every dictionary idiom in the Polish OpenSubtitles corpus (OPUS, v2018, the source of
// the word frequency list) and writes data/idiom-frequency.json. The corpus is ~1.9 GB and
// gitignored: curl -o data/sources/opensubtitles-2018-pl.txt.gz
//   https://object.pouta.csc.fi/OPUS-OpenSubtitles/v2018/mono/pl.txt.gz

const CORPUS = 'data/sources/opensubtitles-2018-pl.txt.gz'
const POLIMORF = 'data/sources/PoliMorf-0.6.7.tab.gz'
const OUT = 'data/idiom-frequency.json'
const limitArg = process.argv.indexOf('--limit')
const limit = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity

for (const path of [CORPUS, POLIMORF])
  if (!existsSync(path)) throw new Error(`${path} is missing (see the header of this script)`)

interface Entry {
  pl: string
  ru: string
  cards: string[]
}

// One entry per idiom: the same phrase on several cards (adwokat diabła on adwokat and diabeł).
const entries = new Map<string, Entry>()
for (const file of readdirSync('content/dictionary').sort()) {
  const card = parseYaml(readFileSync(join('content/dictionary', file), 'utf8')) as {
    id: string
    idioms?: { pl: string; ru: string }[]
  }
  for (const idiom of card.idioms ?? []) {
    const key = idiomTokens(idiom.pl).join(' ')
    if (!key) continue
    const entry = entries.get(key)
    if (entry) entry.cards.push(card.id)
    else entries.set(key, { pl: idiom.pl, ru: idiom.ru, cards: [card.id] })
  }
}

async function* gzLines(path: string): AsyncGenerator<string> {
  const file = createReadStream(path)
  const gunzip = file.pipe(createGunzip())
  try {
    yield* createInterface({ input: gunzip, crlfDelay: Infinity })
  } finally {
    // Stopping early (--limit) must not leave gunzip reading ahead to the end of the file.
    gunzip.destroy()
    file.destroy()
  }
}

// Two passes over PoliMorf: the lemmas of every idiom token, then every form of those lemmas.
const wanted = new Set([...entries.keys()].flatMap((k) => k.split(' ')))
const readings = new Map<string, { lemma: string; head: string }[]>()
for await (const line of gzLines(POLIMORF)) {
  const [form, lemma, tag] = line.split('\t')
  if (!form || !lemma || !tag || !wanted.has(form.toLowerCase())) continue
  const key = form.toLowerCase()
  readings.set(key, [...(readings.get(key) ?? []), { lemma, head: tag.split(':')[0]! }])
}
const lemmas = new Set([...readings.values()].flat().map((r) => r.lemma))
const forms = new Map<string, string[]>()
for await (const line of gzLines(POLIMORF)) {
  const [form, lemma] = line.split('\t')
  if (form && lemma && lemmas.has(lemma)) forms.set(lemma, [...(forms.get(lemma) ?? []), form])
}
const lexicon: Lexicon = {
  readings: (form) => readings.get(form) ?? [],
  forms: (lemma) => forms.get(lemma) ?? [],
}

const list = [...entries.values()]
const counter = new IdiomCounter(list.map((e) => compile(e.pl, lexicon) ?? []))
const started = Date.now()
for await (const line of gzLines(CORPUS)) {
  counter.add(line)
  if (counter.lines % 10_000_000 === 0)
    console.log(`… ${counter.lines / 1e6}M lines, ${Math.round((Date.now() - started) / 1000)} s`)
  if (counter.lines >= limit) break
}

const perMillion = (n: number) => Math.round((n / counter.tokens) * 1e6 * 1000) / 1000
const idioms = list
  .map((e, i) => ({ ...e, count: counter.counts[i]!, perMillion: perMillion(counter.counts[i]!) }))
  .sort((a, b) => b.count - a.count || a.pl.localeCompare(b.pl, 'pl'))
writeFileSync(
  OUT,
  `${JSON.stringify({ source: 'OpenSubtitles v2018 (OPUS), pl', lines: counter.lines, tokens: counter.tokens, idioms }, null, 1)}\n`,
)
console.log(
  `✓ ${idioms.length} idioms over ${counter.lines} lines / ${counter.tokens} tokens → ${OUT}; ${idioms.filter((i) => i.count > 0).length} found`,
)
