import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DATA } from './dictionary/lib/paths'
import { parseOverrides } from './dictionary/lib/rank'
import { readRegistry } from './dictionary/lib/registry'
import { lessonDepthWarnings } from './lib/lesson-depth'
import { loadContent } from './lib/load-content'
import { validateContent } from './lib/validate'
import { validateDictionary } from './lib/validate-dictionary'

// Becomes true after the final batch, when every lesson word must have a card.
const REQUIRE_LESSON_CARDS = false

const bundle = loadContent(resolve(process.cwd(), 'content'))
// The card registry is the frequency list plus the hand-curated words; a missing
// frequency file disables the cross-check entirely, as before.
const rankedEntries = readRegistry(DATA.ranked)
const ranked = rankedEntries.length > 0 ? [...rankedEntries, ...readRegistry(DATA.words)] : null
const lessonWordIds = bundle.words.flatMap((file) =>
  ((file.data as { words?: { id: string }[] })?.words ?? []).map((w) => w.id),
)
// Every exclusion must say why it is one, so the registry can be checked rather than
// read: the prose stays in YAML comments, the machine-readable reason lives beside it.
const overrides = parseOverrides(readFileSync(DATA.overrides, 'utf8'))
const exclusions = { exclude: overrides.exclude, notes: overrides.excludeNotes }

const errors = validateContent(bundle)
const dictionary = validateDictionary(
  { cards: bundle.cards, forms: bundle.forms, ranked, lessonWordIds, exclusions },
  { requireLessonCards: REQUIRE_LESSON_CARDS },
)
errors.push(...dictionary.errors)

// `--all-warnings` prints every dictionary warning, for batch work on a backlog.
const ALL_WARNINGS = process.argv.includes('--all-warnings')
if (dictionary.warnings.length > 0) {
  const shown = ALL_WARNINGS ? dictionary.warnings : dictionary.warnings.slice(0, 5)
  console.warn(
    `! ${dictionary.warnings.length} dictionary warning(s)${ALL_WARNINGS ? '' : ' (first 5 shown)'}:`,
  )
  for (const warning of shown) console.warn(`  - ${warning}`)
}

const thin = lessonDepthWarnings(bundle.lessons)
if (thin.length > 0) {
  console.warn(`! ${thin.length} thin lesson(s):`)
  for (const warning of thin) console.warn(`  - ${warning}`)
}

if (errors.length > 0) {
  console.error(`✗ ${errors.length} content error(s):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log('✓ content is valid')
