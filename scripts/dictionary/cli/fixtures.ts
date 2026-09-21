import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { readLines } from '../lib/lines'
import { FIXTURES, SOURCES } from '../lib/paths'

const LEMMAS = new Set([
  'dom',
  'mama',
  'mieć',
  'robić',
  'zrobić',
  'dobry',
  'dobrze',
  'on',
  'dwa',
  'w',
  'nowy',
  'być',
  'się',
])
const WIKI_WORDS = new Set([
  'dom',
  'mama',
  'mieć',
  'robić',
  'zrobić',
  'dobry',
  'dobrze',
  'on',
  'dwa',
  'w',
  'nowy',
])
const SENTENCE_IDS = new Set([
  348629, 348760, 352381, 353931, 355239, 348626, 348716, 348737, 348630, 348636, 349048, 349061,
  348658, 348662, 348732,
])

mkdirSync(FIXTURES, { recursive: true })

const polimorf = new Set<string>()
for await (const line of readLines(SOURCES.polimorf)) {
  const lemma = line.split('\t')[1]
  if (lemma && LEMMAS.has(lemma)) polimorf.add(line)
}
writeFileSync(join(FIXTURES, 'polimorf-sample.tab'), `${[...polimorf].sort().join('\n')}\n`)

const wiki: string[] = []
for await (const line of readLines(SOURCES.wiktionary)) {
  const entry = JSON.parse(line) as Record<string, unknown>
  if (entry.lang_code !== 'pl' || !WIKI_WORDS.has(String(entry.word))) continue
  const senses = ((entry.senses as Record<string, unknown>[] | undefined) ?? []).map((s) => ({
    sense_index: s.sense_index,
    glosses: s.glosses,
    examples: ((s.examples as { text: string }[] | undefined) ?? [])
      .slice(0, 2)
      .map((e) => ({ text: e.text })),
  }))
  const trimmed = {
    word: entry.word,
    etymology_texts: entry.etymology_texts,
    proverbs: entry.proverbs,
    antonyms: entry.antonyms,
    lang_code: entry.lang_code,
    pos: entry.pos,
    tags: entry.tags,
    senses,
    translations: ((entry.translations as { lang_code?: string }[] | undefined) ?? []).filter(
      (t) => t.lang_code === 'ru',
    ),
    sounds: ((entry.sounds as Record<string, unknown>[] | undefined) ?? []).map((s) => ({
      ipa: s.ipa,
      audio: s.audio,
      tags: s.tags,
    })),
    related: ((entry.related as unknown[] | undefined) ?? []).slice(0, 5),
    forms: entry.forms ?? [],
  }
  wiki.push(JSON.stringify(trimmed))
}
writeFileSync(join(FIXTURES, 'wiktionary-sample.jsonl'), `${wiki.join('\n')}\n`)

const freq = readFileSync(SOURCES.frequency, 'utf8').split('\n').slice(0, 300).join('\n')
writeFileSync(join(FIXTURES, 'frequency-sample.txt'), `${freq}\n`)

const pol: string[] = []
for await (const line of readLines(SOURCES.tatoebaPol)) {
  if (SENTENCE_IDS.has(Number(line.split('\t')[0]))) pol.push(line)
}
writeFileSync(join(FIXTURES, 'pol_sentences.tsv'), `${pol.join('\n')}\n`)

const links: string[] = []
const rusIds = new Set<number>()
for await (const line of readLines(SOURCES.tatoebaLinks)) {
  const [plId, ruId] = line.split('\t').map(Number)
  if (plId !== undefined && ruId !== undefined && SENTENCE_IDS.has(plId)) {
    links.push(line)
    rusIds.add(ruId)
  }
}
writeFileSync(join(FIXTURES, 'pol-rus_links.tsv'), `${links.join('\n')}\n`)

const rus: string[] = []
for await (const line of readLines(SOURCES.tatoebaRus)) {
  if (rusIds.has(Number(line.split('\t')[0]))) rus.push(line)
}
writeFileSync(join(FIXTURES, 'rus_sentences.tsv'), `${rus.join('\n')}\n`)

console.log(
  `✓ fixtures: polimorf ${polimorf.size}, wiktionary ${wiki.length}, pol ${pol.length}, links ${links.length}, rus ${rus.length}`,
)
