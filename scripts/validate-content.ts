import { resolve } from 'node:path'
import { DATA } from './dictionary/lib/paths'
import { readRegistry } from './dictionary/lib/registry'
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

const errors = validateContent(bundle)
const dictionary = validateDictionary(
  { cards: bundle.cards, forms: bundle.forms, ranked, lessonWordIds },
  { requireLessonCards: REQUIRE_LESSON_CARDS },
)
errors.push(...dictionary.errors)

if (dictionary.warnings.length > 0) {
  console.warn(`! ${dictionary.warnings.length} dictionary warning(s) (first 5 shown):`)
  for (const warning of dictionary.warnings.slice(0, 5)) console.warn(`  - ${warning}`)
}

if (errors.length > 0) {
  console.error(`✗ ${errors.length} content error(s):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log('✓ content is valid')
