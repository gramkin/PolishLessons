import { parse as parseYaml } from 'yaml'

/**
 * The lexicon check: every Polish word a lesson shows must exist somewhere — in PoliMorf
 * (≈ 6.5 M forms) or in a dictionary card's paradigm. It cannot tell a wrong case from a
 * right one (both exist), but it catches non-words: typos, invented forms («możę»,
 * «skomplikowańsze»), a dropped or misplaced diacritic that yields no word.
 */

const LETTERS = 'A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż'
const WORD = new RegExp(`(?<![${LETTERS}\\-])[${LETTERS}]+(?![${LETTERS}\\-])`, 'g')

// Markdown component names, YAML keys and question types: Latin, but not Polish.
const MARKUP = new Set([
  'type',
  'input',
  'choice',
  'match',
  'pattern',
  'translate',
  'listen',
  'answer',
  'explain',
  'options',
  'pairs',
  'questions',
  'final',
  'true',
  'false',
  'headers',
  'rows',
  'plcolumns',
  'id',
  'pl',
  'ru',
  'q',
  'text',
  'review',
  'quiz',
  'drill',
  'pron',
  'word',
  'friend',
  'cognate',
  'list',
  'compare',
  'table',
])

export interface Finding {
  word: string
  context: string
}

/**
 * Words a lesson means to show as wrong: the distractors of its choice questions, and any
 * listed in a `<!-- lexicon-ok: wysoky studentu -->` comment (for «не studentu, а studentowi»).
 */
export function intendedNonWords(body: string): Set<string> {
  const excused = new Set<string>()
  for (const m of body.matchAll(/<!--\s*lexicon-ok:([^>]*)-->/g))
    for (const w of m[1]!.split(/\s+/)) if (w) excused.add(w.toLowerCase())
  for (const block of body.matchAll(/^::quiz[ \t]*\n---\n([\s\S]*?)\n---\n::/gm)) {
    let data: { questions?: { type?: string; options?: string[]; answer?: unknown }[] }
    try {
      data = parseYaml(block[1]!) as typeof data
    } catch {
      continue
    }
    for (const q of data.questions ?? []) {
      if (q.type !== 'choice' || !Array.isArray(q.options)) continue
      q.options.forEach((option, i) => {
        if (i === q.answer) return
        for (const w of String(option).matchAll(WORD)) excused.add(w[0].toLowerCase())
      })
    }
  }
  return excused
}

/** Polish-looking words in a lesson body, with the line they sit on. */
export function lessonWords(body: string): Finding[] {
  const findings: Finding[] = []
  const excused = intendedNonWords(body)
  // Comments never render; blank them but keep the line count for context.
  const visible = body.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '))
  for (const rawLine of visible.split('\n')) {
    // Component calls: keep only the Polish a reader sees (pl="…"); drop names, ids and keys.
    const line = rawLine
      .replace(/:{1,2}[a-z][\w-]*\{([^}]*)\}/g, (_m, attrs: string) => {
        const pl = /\bpl="([^"]*)"/.exec(attrs)?.[1]
        return ` ${pl ?? ''} `
      })
      .replace(/^\s*[a-zA-Z]+:/, ' ')
      .replace(/^\s*-\s+type:\s*\w+/, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    for (const match of line.matchAll(WORD)) {
      const word = match[0]
      if (MARKUP.has(word.toLowerCase()) || excused.has(word.toLowerCase())) continue
      // Up to three letters is spelling talk in this course (ó, rz, dzi, -ło), not a word to check.
      if (word.length <= 3) continue
      findings.push({ word, context: rawLine.trim().slice(0, 140) })
    }
  }
  return findings
}

// PoliMorf stores agglutinated forms in pieces: zrobiłbym = zrobił + by + m, gdzieś = gdzie + ś,
// gdybym = gdyby + m. A word made of a known form plus the conditional by and/or a movable person
// ending is real; the 1st/2nd-person endings attach as -em/-eś after a consonant (przyszedłem).
const PERSON = /(?:śmy|ście|m|ś)$/
const BY = /by$/

function stems(word: string): string[] {
  const out: string[] = []
  const add = (s: string) => {
    if (s.length >= 2 && s !== word) out.push(s, s.replace(/e$/, ''))
  }
  const noPerson = word.replace(PERSON, '')
  add(noPerson)
  add(noPerson.replace(BY, ''))
  add(word.replace(BY, ''))
  return out
}

/** Is `word` known, directly or as a known form + by and/or a person ending? */
export function isKnownForm(word: string, known: (word: string) => boolean): boolean {
  for (const w of new Set([word, word.toLowerCase()])) {
    if (known(w) || stems(w).some((s) => known(s))) return true
  }
  return false
}

/** Words of `findings` that no lexicon knows. Case is folded: sentence-initial capitals are fine. */
export function unknownWords(findings: Finding[], known: (word: string) => boolean): Finding[] {
  return findings.filter((f) => !isKnownForm(f.word, known))
}
