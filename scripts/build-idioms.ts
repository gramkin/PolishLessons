import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { curatedIdiomFileSchema, frequencyFileSchema } from '../shared/idioms'
import { buildIdiomList } from './lib/idioms'

// pnpm idioms: data/idiom-frequency.json (counts) + data/idioms.yml (classification)
// → public/dictionary/idioms.json, which /idioms reads. Run by dev and generate.

const FREQUENCY = 'data/idiom-frequency.json'
const CURATED = 'data/idioms.yml'
const OUT = 'public/dictionary/idioms.json'

const frequency = frequencyFileSchema.parse(JSON.parse(readFileSync(FREQUENCY, 'utf8')))
const curated = existsSync(CURATED)
  ? curatedIdiomFileSchema.parse(parseYaml(readFileSync(CURATED, 'utf8')) ?? [])
  : []
const { idioms, errors } = buildIdiomList(frequency, curated)
if (errors.length > 0) {
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(idioms))
console.log(`✓ idioms: ${idioms.length} published of ${curated.length} classified`)
