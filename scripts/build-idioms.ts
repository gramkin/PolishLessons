import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { parse as parseYaml } from 'yaml'
import {
  curatedIdiomFileSchema,
  frequencyFileSchema,
  idiomExamplesFileSchema,
} from '../shared/idioms'
import { buildIdiomExamples, buildIdiomList } from './lib/idioms'

// pnpm idioms: data/idiom-frequency.json (counts) + data/idioms.yml (classification)
// → public/dictionary/idioms.json, which /idioms reads; data/idiom-examples.yml →
// public/dictionary/idiom-examples.json, which /idioms and the cards read. Run by dev and generate.

const FREQUENCY = 'data/idiom-frequency.json'
const CURATED = 'data/idioms.yml'
const EXAMPLES = 'data/idiom-examples.yml'
const OUT = 'public/dictionary/idioms.json'
const OUT_EXAMPLES = 'public/dictionary/idiom-examples.json'

const frequency = frequencyFileSchema.parse(JSON.parse(readFileSync(FREQUENCY, 'utf8')))
const curated = existsSync(CURATED)
  ? curatedIdiomFileSchema.parse(parseYaml(readFileSync(CURATED, 'utf8')) ?? [])
  : []
const { idioms, errors } = buildIdiomList(frequency, curated)
const exampleEntries = existsSync(EXAMPLES)
  ? idiomExamplesFileSchema.parse(parseYaml(readFileSync(EXAMPLES, 'utf8')) ?? [])
  : []
const built = buildIdiomExamples(idioms, frequency, exampleEntries)
errors.push(...built.errors)
if (errors.length > 0) {
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(idioms))
writeFileSync(OUT_EXAMPLES, JSON.stringify(built.examples))
console.log(
  `✓ idioms: ${idioms.length} published of ${curated.length} classified, ${Object.keys(built.examples).length} with examples`,
)
