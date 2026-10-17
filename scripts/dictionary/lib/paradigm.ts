import type { Aspect, CardPos, FormsTable } from '../../../shared/dictionary'
import { expandTag, type MorphRow } from './polimorf'
import { posOfHead } from './pos'

export interface WikiForm {
  form: string
  tags: string[]
}

export type Person = 'pri' | 'sec' | 'ter'

export interface ParadigmResult {
  tables: FormsTable[]
  allForms: string[]
  grammarLabel: string | null
  mismatches: string[]
}

interface Slot {
  form: string
  head: string
  parts: string[]
}

const CASES = [
  ['nom', 'Именительный'],
  ['gen', 'Родительный'],
  ['dat', 'Дательный'],
  ['acc', 'Винительный'],
  ['inst', 'Творительный'],
  ['loc', 'Предложный'],
  ['voc', 'Звательный'],
] as const

const PERSONS = [
  ['pri', '1-е лицо'],
  ['sec', '2-е лицо'],
  ['ter', '3-е лицо'],
] as const

const TABLE_HEADS: Record<CardPos, string[]> = {
  noun: ['subst'],
  verb: [
    'fin',
    'bedzie',
    'praet',
    'impt',
    'imps',
    'inf',
    'pcon',
    'pant',
    'pact',
    'ppas',
    'ger',
    'winien',
  ],
  adj: ['adj', 'adjc'],
  adv: ['adv'],
  pron: ['ppron12', 'ppron3', 'siebie'],
  num: ['num', 'numcol'],
  prep: ['prep'],
  conj: ['conj', 'comp'],
  part: ['qub', 'brev', 'burk'],
  interj: ['interj'],
}

const GENDER_LABELS: Record<string, string> = {
  m1: 'мужской род, личный',
  m2: 'мужской род, одушевлённый',
  m3: 'мужской род, неодушевлённый',
  f: 'женский род',
  n1: 'средний род',
  n2: 'средний род',
  p1: 'только множественное число',
  p2: 'только множественное число',
  p3: 'только множественное число',
}

function plSort(forms: Iterable<string>): string[] {
  return [...new Set(forms)].sort((a, b) => a.localeCompare(b, 'pl'))
}

function toSlots(rows: MorphRow[], heads: string[]): Slot[] {
  const allowed = new Set(heads)
  return rows.flatMap((row) =>
    expandTag(row.tag)
      .filter((parts) => allowed.has(parts[0]!))
      .map((parts) => ({ form: row.form, head: parts[0]!, parts })),
  )
}

function pick(slots: Slot[], predicate: (s: Slot) => boolean): string[] {
  return plSort(slots.filter(predicate).map((s) => s.form))
}

function one(slots: Slot[], predicate: (s: Slot) => boolean): string | undefined {
  return pick(slots, predicate)[0]
}

function cleanTable(table: FormsTable): FormsTable | null {
  const rows = table.rows.filter((r) => r.cells.some((c) => c.length > 0))
  return rows.length > 0 ? { ...table, rows } : null
}

function tables(...list: (FormsTable | null)[]): FormsTable[] {
  return list.map((t) => (t ? cleanTable(t) : null)).filter((t): t is FormsTable => t !== null)
}

type PersonForms = Record<Person, string | null>

export interface TenseForms {
  sg: Record<'m' | 'f' | 'n', PersonForms>
  pl: Record<'virile' | 'other', PersonForms>
}

interface PastParts {
  masc?: string
  fem?: string
  neut?: string
  virile?: string
  other?: string
}

function withEndings(base: string | undefined, endings: [string, string, string]): PersonForms {
  if (!base) return { pri: null, sec: null, ter: null }
  return { pri: base + endings[0], sec: base + endings[1], ter: base + endings[2] }
}

export function assemblePast(parts: PastParts): TenseForms {
  const femStem = parts.fem?.endsWith('a') ? parts.fem.slice(0, -1) : undefined
  const mascStem =
    femStem && parts.masc && femStem === parts.masc.replace('ó', 'o') ? femStem : parts.masc
  return {
    sg: {
      m:
        parts.masc && mascStem
          ? { pri: `${mascStem}em`, sec: `${mascStem}eś`, ter: parts.masc }
          : { pri: null, sec: null, ter: null },
      f: withEndings(parts.fem, ['m', 'ś', '']),
      n: { pri: null, sec: null, ter: parts.neut ?? null },
    },
    pl: {
      virile: withEndings(parts.virile, ['śmy', 'ście', '']),
      other: withEndings(parts.other, ['śmy', 'ście', '']),
    },
  }
}

export function assembleConditional(parts: PastParts): TenseForms {
  return {
    sg: {
      m: withEndings(parts.masc, ['bym', 'byś', 'by']),
      f: withEndings(parts.fem, ['bym', 'byś', 'by']),
      n: { pri: null, sec: null, ter: parts.neut ? `${parts.neut}by` : null },
    },
    pl: {
      virile: withEndings(parts.virile, ['byśmy', 'byście', 'by']),
      other: withEndings(parts.other, ['byśmy', 'byście', 'by']),
    },
  }
}

const cell = (form: string | null | undefined): string[] => (form ? [form] : [])

function tenseTables(title: string, forms: TenseForms): FormsTable[] {
  return tables(
    {
      title: `${title} (ед. ч.)`,
      columns: ['м. р.', 'ж. р.', 'ср. р.'],
      rows: PERSONS.map(([p, label]) => ({
        label,
        cells: [cell(forms.sg.m[p]), cell(forms.sg.f[p]), cell(forms.sg.n[p])],
      })),
      extra: false,
    },
    {
      title: `${title} (мн. ч.)`,
      columns: ['мужско-личный', 'прочие'],
      rows: PERSONS.map(([p, label]) => ({
        label,
        cells: [cell(forms.pl.virile[p]), cell(forms.pl.other[p])],
      })),
      extra: false,
    },
  )
}

function tenseFormsList(forms: TenseForms): string[] {
  return [
    ...Object.values(forms.sg).flatMap((p) => Object.values(p)),
    ...Object.values(forms.pl).flatMap((p) => Object.values(p)),
  ].filter((f): f is string => f !== null)
}

const BEDZIE: Record<'sg' | 'pl', Record<Person, string>> = {
  sg: { pri: 'będę', sec: 'będziesz', ter: 'będzie' },
  pl: { pri: 'będziemy', sec: 'będziecie', ter: 'będą' },
}

function verbParadigm(lemma: string, s: Slot[], aspect: Aspect | null, wikiForms: WikiForm[]) {
  const fin = (num: string, person: string) =>
    pick(s, (x) => x.head === 'fin' && x.parts[1] === num && x.parts[2] === person)
  const bedzie = (num: string, person: string) =>
    pick(s, (x) => x.head === 'bedzie' && x.parts[1] === num && x.parts[2] === person)
  // PoliMorf tags the bound stem of ó-verbs `agl` (wyniosł-, only in wyniosłem); the free
  // form is `nagl` (wyniósł), and the conditional is built on it (wyniósłby)
  const praet = (num: string, genders: string[]) =>
    one(
      s,
      (x) =>
        x.head === 'praet' &&
        x.parts[1] === num &&
        genders.includes(x.parts[2]!) &&
        !x.parts.includes('agl'),
    )
  const parts: PastParts = {
    masc: praet('sg', ['m1', 'm2', 'm3']),
    fem: praet('sg', ['f']),
    neut: praet('sg', ['n1', 'n2']),
    virile: praet('pl', ['m1', 'p1']),
    other: praet('pl', ['m2', 'm3', 'f', 'n1', 'n2', 'p2', 'p3']),
  }
  const past = assemblePast(parts)
  const conditional = assembleConditional(parts)
  const infinitive = one(s, (x) => x.head === 'inf') ?? lemma
  const presentTitle =
    aspect === 'perf'
      ? 'Простое будущее время'
      : aspect === 'biaspectual'
        ? 'Настоящее и будущее время'
        : 'Настоящее время'
  const hasBedzie = s.some((x) => x.head === 'bedzie')

  const futureTable: FormsTable | null = hasBedzie
    ? {
        title: 'Будущее время',
        columns: ['Ед. ч.', 'Мн. ч.'],
        rows: PERSONS.map(([p, label]) => ({ label, cells: [bedzie('sg', p), bedzie('pl', p)] })),
        extra: false,
      }
    : aspect === 'imperf'
      ? {
          title: 'Будущее время',
          columns: ['Ед. ч.', 'Мн. ч.'],
          rows: PERSONS.map(([p, label]) => ({
            label,
            cells: [
              [
                `${BEDZIE.sg[p]} ${infinitive}`,
                ...cell(parts.masc && `${BEDZIE.sg[p]} ${parts.masc}`),
                ...cell(parts.fem && `${BEDZIE.sg[p]} ${parts.fem}`),
              ],
              [
                `${BEDZIE.pl[p]} ${infinitive}`,
                ...cell(parts.virile && `${BEDZIE.pl[p]} ${parts.virile}`),
                ...cell(parts.other && `${BEDZIE.pl[p]} ${parts.other}`),
              ],
            ],
          })),
          extra: false,
        }
      : null

  const impt = (num: string, person: string) =>
    pick(s, (x) => x.head === 'impt' && x.parts[1] === num && x.parts[2] === person)
  const niech = [...fin('sg', 'ter'), ...fin('pl', 'ter')].map((f) => `niech ${f}`)
  const participle = (head: string, genders: string[]) =>
    pick(
      s,
      (x) =>
        x.head === head &&
        x.parts[1] === 'sg' &&
        x.parts[2] === 'nom' &&
        genders.includes(x.parts[3]!) &&
        x.parts[5] === 'aff',
    )

  const built = tables(
    {
      title: presentTitle,
      columns: ['Ед. ч.', 'Мн. ч.'],
      rows: PERSONS.map(([p, label]) => ({ label, cells: [fin('sg', p), fin('pl', p)] })),
      extra: false,
    },
    ...tenseTables('Прошедшее время', past),
    futureTable,
    ...tenseTables('Условное наклонение', conditional),
    {
      title: 'Повелительное наклонение',
      columns: ['Форма'],
      rows: [
        { label: '2-е л. ед. ч.', cells: [impt('sg', 'sec')] },
        { label: '1-е л. мн. ч.', cells: [impt('pl', 'pri')] },
        { label: '2-е л. мн. ч.', cells: [impt('pl', 'sec')] },
        { label: '3-е лицо', cells: [niech] },
      ],
      extra: false,
    },
    {
      title: 'Безличная форма',
      columns: ['Форма'],
      rows: [{ label: 'Прошедшее время', cells: [pick(s, (x) => x.head === 'imps')] }],
      extra: true,
    },
    {
      title: 'Деепричастия',
      columns: ['Форма'],
      rows: [
        { label: 'Одновременное', cells: [pick(s, (x) => x.head === 'pcon')] },
        { label: 'Предшествующее', cells: [pick(s, (x) => x.head === 'pant')] },
      ],
      extra: true,
    },
    {
      title: 'Причастия',
      columns: ['м. р.', 'ж. р.', 'ср. р.'],
      rows: [
        {
          label: 'Действительное',
          cells: [
            participle('pact', ['m1', 'm2', 'm3']),
            participle('pact', ['f']),
            participle('pact', ['n1', 'n2']),
          ],
        },
        {
          label: 'Страдательное',
          cells: [
            participle('ppas', ['m1', 'm2', 'm3']),
            participle('ppas', ['f']),
            participle('ppas', ['n1', 'n2']),
          ],
        },
      ],
      extra: true,
    },
    {
      title: 'Отглагольное существительное',
      columns: ['Форма'],
      rows: [
        {
          label: 'Именительный',
          cells: [
            pick(
              s,
              (x) =>
                x.head === 'ger' &&
                x.parts[1] === 'sg' &&
                x.parts[2] === 'nom' &&
                x.parts[5] === 'aff',
            ),
          ],
        },
      ],
      extra: true,
    },
  )

  const generated = new Set([...tenseFormsList(past), ...tenseFormsList(conditional)])
  const known = new Set([...s.map((x) => x.form), ...generated])
  const mismatches = wikiForms
    .filter((w) => !w.form.includes(' '))
    .filter(
      (w) =>
        (w.tags.includes('past') || w.tags.includes('conditional')) &&
        !w.tags.some((t) => ['rare', 'pluperfect', 'potential'].includes(t)),
    )
    .filter((w) => !known.has(w.form))
    .map((w) => `Wiktionary: ${w.form} (${w.tags.join(' ')}) нет среди сгенерированных форм`)

  return { tables: built, extraForms: [...generated], mismatches }
}

// n1/n2 and p1/p2/p3 split PoliMorf's genders finer than a learner's table does. m2 and m3
// differ only in the accusative singular, and a thing used as animate (zjeść banana, wysłać
// maila) is real usage, so they stay together; m1 (persons) is a different paradigm.
const genderGroup = (g: string) =>
  g.startsWith('n') ? 'n' : g.startsWith('p') ? 'p' : g === 'm2' || g === 'm3' ? 'm23' : g

const WIKI_CASE: Record<string, string> = {
  nominative: 'nom',
  genitive: 'gen',
  dative: 'dat',
  accusative: 'acc',
  instrumental: 'inst',
  locative: 'loc',
  vocative: 'voc',
}

/**
 * The slots of one gender. PoliMorf files homonyms of another gender under the same lemma:
 * pies the dog (m2, accusative plural psy) and pies «policeman» (m1, psów); dziadek the
 * grandfather (m1) and the nutcracker (m2). Merged, they put psów among the accusatives. The
 * gender kept is the one whose forms best match Wiktionary's first entry, which is the main
 * sense; without Wiktionary forms, the gender with the most forms. Animate and inanimate
 * masculine count as one gender here.
 */
// Lemmas whose card means a different homonym from Wiktionary's first entry: głąb is
// «глубина» (f, w głębi), not «кочерыжка» (m); palant is «придурок» (m1), not the bat game.
const CARD_GENDER: Record<string, string> = { głąb: 'f', palant: 'm1' }

// Lemmas whose card also teaches a homonym of another gender, so its paradigm is shown as a
// second table: zbieg «беглец» (m1) and «стечение» (zbiegi), pilot «лётчик» and «пульт»
// (piloty), narzeczony and narzeczona. Every other homonym is left out of the card.
export const SECOND_GENDER: Record<string, string> = {
  anioł: 'm23',
  bałwan: 'm1',
  bękart: 'm1',
  bliźniak: 'm23',
  diabeł: 'm23',
  informator: 'm23',
  król: 'm23',
  mięczak: 'm1',
  model: 'm1',
  narzeczony: 'f',
  olbrzym: 'm23',
  palant: 'm23',
  pastuch: 'm23',
  pilot: 'm23',
  przewodnik: 'm23',
  rekin: 'm1',
  satelita: 'm1',
  szach: 'm1',
  szatan: 'm1',
  szczeniak: 'm1',
  świr: 'm1',
  tchórz: 'm23',
  twardziel: 'f',
  typ: 'm1',
  wampir: 'm23',
  zbieg: 'm23',
  zwiastun: 'm23',
}

// Forms PoliMorf files under a homonym although the main word uses them: the genitive plural
// of nuda is nudów (z nudów, umierać z nudów); the regular nud is rare.
const CARD_EXTRA_FORMS: Record<string, { num: string; case: string; form: string }[]> = {
  nuda: [{ num: 'pl', case: 'gen', form: 'nudów' }],
}

const GROUP_LABELS: Record<string, string> = {
  m1: 'мужской род, личный',
  m23: 'мужской род',
  f: 'женский род',
  n: 'средний род',
  p: 'только множественное число',
}

/** The slots of `lemma`'s gender group `group`, for a second declension table. */
export function genderGroupSlots(s: Slot[], group: string): Slot[] {
  return s.filter((x) => genderGroup(x.parts[3] ?? '') === group)
}

export function mainGenderSlots(s: Slot[], wikiForms: WikiForm[], lemma = ''): Slot[] {
  const groups = new Map<string, Slot[]>()
  for (const x of s) {
    const g = genderGroup(x.parts[3] ?? '')
    groups.set(g, [...(groups.get(g) ?? []), x])
  }
  if (groups.size <= 1) return s
  const chosen = CARD_GENDER[lemma] ? groups.get(CARD_GENDER[lemma]!) : undefined
  if (chosen) return chosen
  const wiki = new Map<string, Set<string>>()
  for (const f of wikiForms) {
    const c = f.tags.map((t) => WIKI_CASE[t]).find(Boolean)
    const n = f.tags.includes('plural') ? 'pl' : f.tags.includes('singular') ? 'sg' : null
    if (!c || !n) continue
    const key = `${n}:${c}`
    wiki.set(key, new Set([...(wiki.get(key) ?? []), f.form]))
  }
  const score = (slots: Slot[]) => {
    if (wiki.size === 0) return 0
    let points = 0
    for (const x of slots) {
      const expected = wiki.get(`${x.parts[1]}:${x.parts[2]}`)
      if (expected) points += expected.has(x.form) ? 1 : -1
    }
    return points
  }
  return [...groups.values()].sort((a, b) => score(b) - score(a) || b.length - a.length)[0]!
}

function nounParadigm(s: Slot[], title = 'Склонение') {
  return tables({
    title,
    columns: ['Ед. ч.', 'Мн. ч.'],
    rows: CASES.map(([c, label]) => ({
      label,
      cells: [
        pick(s, (x) => x.parts[1] === 'sg' && x.parts[2] === c),
        pick(s, (x) => x.parts[1] === 'pl' && x.parts[2] === c),
      ],
    })),
    extra: false,
  })
}

function adjParadigm(s: Slot[], lemma: string, wikiForms: WikiForm[]) {
  const pos = s.filter((x) => x.head === 'adj' && x.parts[4] === 'pos')
  const col = (num: string, genders: string[]) => (c: string) =>
    pick(pos, (x) => x.parts[1] === num && x.parts[2] === c && genders.includes(x.parts[3]!))
  const columns = [
    col('sg', ['m1', 'm2']),
    col('sg', ['m3']),
    col('sg', ['f']),
    col('sg', ['n1', 'n2']),
    col('pl', ['m1', 'p1']),
    col('pl', ['m2', 'm3', 'f', 'n1', 'n2', 'p2', 'p3']),
  ]
  const degree = (d: string, wikiTag: string) => {
    const fromPolimorf = pick(
      s,
      (x) =>
        x.head === 'adj' &&
        x.parts[1] === 'sg' &&
        x.parts[2] === 'nom' &&
        x.parts[3] === 'm1' &&
        x.parts[4] === d,
    )
    return fromPolimorf.length > 0
      ? fromPolimorf
      : plSort(wikiForms.filter((w) => w.tags.includes(wikiTag)).map((w) => w.form))
  }
  const comparative = degree('com', 'comparative')
  const superlative = degree('sup', 'superlative')
  return tables(
    {
      title: 'Склонение',
      columns: [
        'м. р. (личн./одуш.)',
        'м. р. (неодуш.)',
        'ж. р.',
        'ср. р.',
        'мн. ч. (мужско-личн.)',
        'мн. ч. (прочие)',
      ],
      rows: CASES.map(([c, label]) => ({ label, cells: columns.map((f) => f(c)) })),
      extra: false,
    },
    comparative.length > 0 || superlative.length > 0
      ? {
          title: 'Степени сравнения',
          columns: ['Форма'],
          rows: [
            { label: 'Положительная', cells: [[lemma]] },
            { label: 'Сравнительная', cells: [comparative] },
            { label: 'Превосходная', cells: [superlative] },
          ],
          extra: false,
        }
      : null,
  )
}

function advParadigm(s: Slot[]) {
  const degree = (d: string) => pick(s, (x) => x.parts[1] === d)
  const rows = [
    { label: 'Положительная', cells: [degree('pos')] },
    { label: 'Сравнительная', cells: [degree('com')] },
    { label: 'Превосходная', cells: [degree('sup')] },
  ]
  return rows.filter((r) => r.cells[0]!.length > 0).length > 1
    ? tables({ title: 'Степени сравнения', columns: ['Форма'], rows, extra: false })
    : []
}

const ACCENT_ORDER: Record<string, number> = { akc: 0, _: 1, nakc: 2 }
const PRAEP_ORDER: Record<string, number> = { npraep: 0, _: 1, praep: 2 }

function pronParadigm(s: Slot[]) {
  const ordered = (predicate: (x: Slot) => boolean, accentIndex: number, praepIndex: number) => {
    const matching = s.filter(predicate)
    const key = (x: Slot) =>
      [
        PRAEP_ORDER[x.parts[praepIndex] ?? '_'] ?? 1,
        ACCENT_ORDER[x.parts[accentIndex] ?? '_'] ?? 1,
      ] as const
    return [...matching]
      .sort(
        (a, b) =>
          key(a)[0] - key(b)[0] || key(a)[1] - key(b)[1] || a.form.localeCompare(b.form, 'pl'),
      )
      .map((x) => x.form)
      .filter((form, i, arr) => arr.indexOf(form) === i)
  }
  const third = s.filter((x) => x.head === 'ppron3')
  if (third.length > 0) {
    const gender = (num: string, genders: string[]) => (c: string) =>
      ordered(
        (x) =>
          x.head === 'ppron3' &&
          x.parts[1] === num &&
          x.parts[2] === c &&
          (x.parts[3] === '_' || genders.includes(x.parts[3]!)),
        5,
        6,
      )
    const columns = [
      gender('sg', ['m1', 'm2', 'm3']),
      gender('sg', ['f']),
      gender('sg', ['n1', 'n2']),
      gender('pl', ['m1', 'p1']),
      gender('pl', ['m2', 'm3', 'f', 'n1', 'n2', 'p2', 'p3']),
    ]
    return tables({
      title: 'Склонение',
      columns: ['м. р.', 'ж. р.', 'ср. р.', 'мн. ч. (мужско-личн.)', 'мн. ч. (прочие)'],
      rows: CASES.map(([c, label]) => ({ label, cells: columns.map((f) => f(c)) })),
      extra: false,
    })
  }
  const caseIndex = (x: Slot) => (x.head === 'siebie' ? 1 : 2)
  return tables({
    title: 'Склонение',
    columns: ['Форма'],
    rows: CASES.map(([c, label]) => ({
      label,
      cells: [ordered((x) => x.parts[caseIndex(x)] === c, 5, 6)],
    })),
    extra: false,
  })
}

function numParadigm(s: Slot[]) {
  const col = (genders: string[]) => (c: string) =>
    pick(s, (x) => x.head === 'num' && x.parts[2] === c && genders.includes(x.parts[3]!))
  const columns = [col(['m1']), col(['m2', 'm3', 'n2']), col(['f']), col(['n1', 'p1', 'p2'])]
  return tables({
    title: 'Склонение',
    columns: ['мужско-личный', 'м. и ср. р.', 'ж. р.', 'собирательное'],
    rows: CASES.map(([c, label]) => ({ label, cells: columns.map((f) => f(c)) })),
    extra: false,
  })
}

function nounGender(s: Slot[]): string | null {
  const counts = new Map<string, number>()
  for (const x of s) {
    const g = x.parts[3]
    if (g) counts.set(g, (counts.get(g) ?? 0) + 1)
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  return best ? (GENDER_LABELS[best] ?? null) : null
}

export function buildParadigm(
  pos: CardPos,
  lemma: string,
  rows: MorphRow[],
  wikiForms: WikiForm[],
  aspect: Aspect | null,
): ParadigmResult {
  const own = rows.filter((r) => r.lemma === lemma && posOfHead(r.tag.split(':')[0]!) === pos)
  const s = toSlots(own, TABLE_HEADS[pos])
  const baseForms = [...s.map((x) => x.form), lemma]

  switch (pos) {
    case 'noun': {
      const chosen = mainGenderSlots(s, wikiForms, lemma)
      const gender = chosen[0]?.parts[3] ?? ''
      const main = [
        ...chosen,
        ...(CARD_EXTRA_FORMS[lemma] ?? []).map((x) => ({
          form: x.form,
          head: 'subst',
          parts: ['subst', x.num, x.case, gender],
        })),
      ]
      const group = SECOND_GENDER[lemma]
      const second = group ? genderGroupSlots(s, group).filter((x) => !main.includes(x)) : []
      const kept = [...main, ...second]
      return {
        tables: [
          ...nounParadigm(main),
          ...(second.length > 0 ? nounParadigm(second, `Склонение — ${GROUP_LABELS[group!]}`) : []),
        ],
        allForms: plSort([...kept.map((x) => x.form), lemma]),
        grammarLabel: nounGender(main),
        mismatches: [],
      }
    }
    case 'verb': {
      const verb = verbParadigm(lemma, s, aspect, wikiForms)
      // a bound stem (wyniosł-) is not a word; its forms (wyniosłem) are assembled
      const free = s.filter((x) => !x.parts.includes('agl')).map((x) => x.form)
      return {
        tables: verb.tables,
        allForms: plSort([...free, lemma, ...verb.extraForms]),
        grammarLabel: null,
        mismatches: verb.mismatches,
      }
    }
    case 'adj':
      return {
        tables: adjParadigm(s, lemma, wikiForms),
        allForms: plSort(baseForms),
        grammarLabel: null,
        mismatches: [],
      }
    case 'adv':
      return {
        tables: advParadigm(s),
        allForms: plSort(baseForms),
        grammarLabel: null,
        mismatches: [],
      }
    case 'pron':
      return {
        tables: pronParadigm(s),
        allForms: plSort(baseForms),
        grammarLabel: null,
        mismatches: [],
      }
    case 'num':
      return {
        tables: numParadigm(s),
        allForms: plSort(baseForms),
        grammarLabel: null,
        mismatches: [],
      }
    default:
      return { tables: [], allForms: plSort(baseForms), grammarLabel: null, mismatches: [] }
  }
}
