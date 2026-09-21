import { readFileSync, writeFileSync } from 'node:fs'
import { CONTENT, DATA } from '../lib/paths'
import type { RankedLemma } from '../lib/rank'
import { applyStatuses, cardStatuses, summarize } from '../lib/status'
import { CARD_FORMAT } from '../../../shared/dictionary'

const ranked = JSON.parse(readFileSync(DATA.ranked, 'utf8')) as RankedLemma[]
const statuses = cardStatuses(CONTENT.cards)
const stamped = applyStatuses(ranked, statuses)
writeFileSync(DATA.ranked, `${JSON.stringify(stamped, null, 2)}\n`)

const s = summarize(stamped, statuses)
console.log(`✓ ${DATA.ranked}: ${s.withCards} of ${s.total} lemmas have cards`)
console.log(`  формат ${CARD_FORMAT} (актуальный): ${s.current}`)
if (s.stale.length > 0) {
  console.log(
    `  требуют обновления: ${s.stale.length} — ${s.stale.map((c) => `${c.id} (v${c.format})`).join(', ')}`,
  )
}
console.log(`  требуют разбора (depth: deep): ${s.deep.length} — ${s.deep.join(', ')}`)
console.log(`  следующие без карточек: ${s.missing.slice(0, 10).join(', ')}`)
if (s.orphans.length > 0) console.log(`  карточки вне ranked.json: ${s.orphans.join(', ')}`)
