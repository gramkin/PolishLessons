import type { Aspect, CardPos } from '../../../shared/dictionary'
import { readLines } from './lines'
import type { WikiForm } from './paradigm'

export interface WikiSense {
  index: string
  glosses: string[]
  examples: string[]
}

export interface WikiEntry {
  word: string
  pos: string
  tags: string[]
  senses: WikiSense[]
  translationsRu: { word: string; senseIndex: string | null }[]
  ipa: string[]
  audioFiles: string[]
  related: string[]
  forms: WikiForm[]
  etymology: string[]
  idioms: string[]
  synonyms: string[]
  antonyms: string[]
}

export const WIKI_POS: Record<CardPos, string[]> = {
  noun: ['noun', 'name'],
  verb: ['verb'],
  adj: ['adj'],
  adv: ['adv'],
  pron: ['pron'],
  num: ['num', 'adj', 'noun'],
  prep: ['prep'],
  conj: ['conj'],
  part: ['particle', 'intj'],
  interj: ['intj'],
}

type Json = Record<string, unknown>
const asArray = (v: unknown): Json[] => (Array.isArray(v) ? (v as Json[]) : [])
const asStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

export function parseWikiEntry(value: unknown): WikiEntry | null {
  const e = value as Json
  if (!e || e.lang_code !== 'pl' || typeof e.word !== 'string' || typeof e.pos !== 'string')
    return null
  return {
    word: e.word,
    pos: e.pos,
    tags: asStrings(e.tags),
    senses: asArray(e.senses).map((s) => ({
      index: typeof s.sense_index === 'string' ? s.sense_index : '',
      glosses: asStrings(s.glosses),
      examples: asArray(s.examples)
        .map((x) => x.text)
        .filter((t): t is string => typeof t === 'string'),
    })),
    translationsRu: asArray(e.translations)
      .filter((t) => t.lang_code === 'ru' && typeof t.word === 'string')
      .map((t) => ({
        word: t.word as string,
        senseIndex: typeof t.sense_index === 'string' ? t.sense_index : null,
      })),
    ipa: asArray(e.sounds)
      .map((s) => s.ipa)
      .filter((x): x is string => typeof x === 'string'),
    audioFiles: asArray(e.sounds)
      .map((s) => s.audio)
      .filter((x): x is string => typeof x === 'string'),
    related: asArray(e.related)
      .map((r) => r.word)
      .filter((x): x is string => typeof x === 'string'),
    etymology: asStrings(e.etymology_texts),
    idioms: asArray(e.proverbs)
      .map((x) => x.word)
      .filter((x): x is string => typeof x === 'string'),
    synonyms: asArray(e.synonyms)
      .map((x) => x.word)
      .filter((x): x is string => typeof x === 'string'),
    antonyms: asArray(e.antonyms)
      .map((x) => x.word)
      .filter((x): x is string => typeof x === 'string'),
    forms: asArray(e.forms)
      .filter((f) => typeof f.form === 'string')
      .map((f) => ({ form: f.form as string, tags: asStrings(f.tags) })),
  }
}

export async function readWiktionary(
  path: string,
  words: Set<string>,
): Promise<Map<string, WikiEntry[]>> {
  const result = new Map<string, WikiEntry[]>()
  for await (const line of readLines(path)) {
    // Cheap pre-filter before JSON parsing: the word must appear in the line.
    const match = /"word":\s*"([^"]*)"/.exec(line)
    if (!match || !words.has(match[1]!)) continue
    const entry = parseWikiEntry(JSON.parse(line))
    if (!entry || !words.has(entry.word)) continue
    if (!result.has(entry.word)) result.set(entry.word, [])
    result.get(entry.word)!.push(entry)
  }
  return result
}

export function selectEntries(entries: WikiEntry[], pos: CardPos): WikiEntry[] {
  const wanted = WIKI_POS[pos]
  for (const candidate of wanted) {
    const found = entries.filter((e) => e.pos === candidate)
    if (found.length > 0) return found
  }
  return entries
}

export function aspectOf(entries: WikiEntry[]): Aspect | null {
  const tags = new Set(entries.flatMap((e) => e.tags))
  const imperf = tags.has('imperfective')
  const perf = tags.has('perfective')
  if (imperf && perf) return 'biaspectual'
  if (imperf) return 'imperf'
  if (perf) return 'perf'
  return null
}

export function chooseAudio(entries: WikiEntry[], lemma: string): string | null {
  const expected = `Pl-${lemma}.ogg`
  return entries.flatMap((e) => e.audioFiles).find((f) => f === expected) ?? null
}

export function mergeEntries(entries: WikiEntry[]) {
  const prefix = (i: number, index: string) => (entries.length > 1 ? `${i + 1}:${index}` : index)
  const related = [...new Set(entries.flatMap((e) => e.related))]
  const unique = (key: 'etymology' | 'idioms' | 'synonyms' | 'antonyms') => [
    ...new Set(entries.flatMap((e) => e[key])),
  ]
  return {
    etymology: unique('etymology'),
    idioms: unique('idioms'),
    synonyms: unique('synonyms'),
    antonyms: unique('antonyms'),
    senses: entries.flatMap((e, i) => e.senses.map((s) => ({ ...s, index: prefix(i, s.index) }))),
    translationsRu: entries.flatMap((e, i) =>
      e.translationsRu.map((t) => ({
        word: t.word,
        senseIndex: t.senseIndex === null ? null : prefix(i, t.senseIndex),
      })),
    ),
    ipa: entries.flatMap((e) => e.ipa)[0] ?? null,
    forms: entries[0]?.forms ?? [],
    related,
  }
}
