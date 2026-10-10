import { createReadStream, existsSync, readdirSync, readFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { createGunzip } from 'node:zlib'
import { join } from 'node:path'
import matter from 'gray-matter'
import { lessonWords, unknownWords, type Finding } from './lib/lexicon'

// usage: pnpm lexicon [lesson-file …]   — every lesson when no files are given
// Needs data/sources/PoliMorf-0.6.7.tab.gz (gitignored); without it the check is skipped.

const POLIMORF = 'data/sources/PoliMorf-0.6.7.tab.gz'
// Names and the few words PoliMorf lacks, one per line; reviewed by hand, never generated.
const ALLOW = 'data/lexicon-allow.txt'

async function loadForms(): Promise<Set<string>> {
  const forms = new Set<string>()
  const lines = createInterface({ input: createReadStream(POLIMORF).pipe(createGunzip()) })
  for await (const line of lines) {
    const tab = line.indexOf('\t')
    if (tab > 0) forms.add(line.slice(0, tab))
  }
  for (const file of readdirSync('content/forms')) {
    const { allForms } = JSON.parse(readFileSync(join('content/forms', file), 'utf8')) as {
      allForms: string[]
    }
    for (const form of allForms) for (const part of form.split(/\s+/)) forms.add(part)
  }
  if (existsSync(ALLOW))
    for (const word of readFileSync(ALLOW, 'utf8').split('\n'))
      if (word.trim() && !word.startsWith('#')) forms.add(word.trim())
  return forms
}

function lessonFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(dir, f))
    .sort()
}

if (!existsSync(POLIMORF)) {
  console.log(`… ${POLIMORF} is missing; lexicon check skipped`)
  process.exit(0)
}
const files = process.argv.length > 2 ? process.argv.slice(2) : lessonFiles('content/lessons')
const forms = await loadForms()
let total = 0
for (const file of files) {
  const unknown: Finding[] = unknownWords(
    lessonWords(matter(readFileSync(file, 'utf8')).content),
    (w) => forms.has(w),
  )
  if (unknown.length === 0) continue
  total += unknown.length
  console.log(`\n${file}`)
  for (const f of unknown) console.log(`  ${f.word}    ← ${f.context}`)
}
console.log(total === 0 ? '\n✓ every Polish word is a known form' : `\n✗ ${total} unknown word(s)`)
process.exit(total === 0 ? 0 : 1)
