import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { CONTENT, DATA, SOURCES } from '../lib/paths'
import { readPolimorf } from '../lib/polimorf'
import {
  AGLT_SUFFIXES,
  buildFormIndex,
  parseFrequencyList,
  parseOverrides,
  rankLemmas,
} from '../lib/rank'

const FORM_LIMIT = 20000
const LEMMA_LIMIT = 2000

const freq = parseFrequencyList(readFileSync(SOURCES.frequency, 'utf8'), FORM_LIMIT)
const overrides = parseOverrides(readFileSync(DATA.overrides, 'utf8'))

const wanted = new Set<string>()
for (const { form } of freq) {
  wanted.add(form)
  for (const suffix of AGLT_SUFFIXES)
    if (form.endsWith(suffix)) wanted.add(form.slice(0, -suffix.length))
}

console.log('… reading PoliMorf (form pass)')
const formRows = await readPolimorf(SOURCES.polimorf, (row) => wanted.has(row.form.toLowerCase()))
const candidateLemmas = new Set(formRows.map((r) => r.lemma))
console.log('… reading PoliMorf (lemma pass)')
const lemmaRows = await readPolimorf(SOURCES.polimorf, (row) => candidateLemmas.has(row.lemma))

const reserved = new Map<string, string>()
for (const file of readdirSync(CONTENT.words)
  .filter((f) => f.endsWith('.yml'))
  .sort()) {
  const data = parseYaml(readFileSync(join(CONTENT.words, file), 'utf8')) as {
    words: { id: string; pl: string }[]
  }
  for (const word of data.words) if (!reserved.has(word.pl)) reserved.set(word.pl, word.id)
}

const index = buildFormIndex([...formRows, ...lemmaRows])
const ranked = rankLemmas(freq, index, overrides, { iterations: 5, limit: LEMMA_LIMIT, reserved })

mkdirSync(dirname(DATA.ranked), { recursive: true })
writeFileSync(DATA.ranked, `${JSON.stringify(ranked, null, 2)}\n`)
console.log(
  `✓ ${DATA.ranked}: ${ranked.length} lemmas; top 10: ${ranked
    .slice(0, 10)
    .map((r) => r.lemma)
    .join(', ')}`,
)
