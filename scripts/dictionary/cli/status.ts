import { readFileSync, writeFileSync } from 'node:fs'
import { CONTENT, DATA } from '../lib/paths'
import { parseOverrides } from '../lib/rank'
import { readRegistry } from '../lib/registry'
import { applyExclusions, applyStatuses, cardStatuses, summarize } from '../lib/status'
import { CARD_FORMAT } from '../../../shared/dictionary'

// Two registries, one convention: data/ranked.json is generated from the frequency
// corpus, data/words.json is hand-curated. Each is stamped and written back to its
// own file — they are never merged on disk, or dict:rank would drop the curated words.
const ranked = readRegistry(DATA.ranked)
const words = readRegistry(DATA.words)
const statuses = cardStatuses(CONTENT.cards)

// Exclusion notes are stamped alongside the card status: overrides.yml is the source of
// truth, the registry only carries a copy, so dict:rank can never leave a stale reason.
const notes = parseOverrides(readFileSync(DATA.overrides, 'utf8')).excludeNotes
const stampedRanked = applyExclusions(applyStatuses(ranked, statuses), notes)
writeFileSync(DATA.ranked, `${JSON.stringify(stampedRanked, null, 2)}\n`)
const stampedWords = applyExclusions(applyStatuses(words, statuses), notes)
if (words.length > 0) writeFileSync(DATA.words, `${JSON.stringify(stampedWords, null, 2)}\n`)

const s = summarize([...stampedRanked, ...stampedWords], statuses)
console.log(
  `✓ ${DATA.ranked}: ${ranked.filter((e) => statuses.has(e.id)).length} of ${ranked.length} lemmas have cards`,
)
if (words.length > 0)
  console.log(
    `✓ ${DATA.words}: ${words.filter((e) => statuses.has(e.id)).length} of ${words.length} lemmas have cards`,
  )
console.log(`  формат ${CARD_FORMAT} (актуальный): ${s.current}`)
if (s.stale.length > 0) {
  console.log(
    `  требуют обновления: ${s.stale.length} — ${s.stale.map((c) => `${c.id} (v${c.format})`).join(', ')}`,
  )
}
console.log(`  требуют разбора (depth: deep): ${s.deep.length} — ${s.deep.join(', ')}`)
console.log(`  следующие без карточек: ${s.missing.slice(0, 10).join(', ')}`)
if (s.orphans.length > 0) console.log(`  карточки вне реестров: ${s.orphans.join(', ')}`)
