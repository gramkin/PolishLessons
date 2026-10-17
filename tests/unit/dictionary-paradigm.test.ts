import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  assembleConditional,
  assemblePast,
  buildParadigm,
} from '../../scripts/dictionary/lib/paradigm'
import { parsePolimorfText, type MorphRow } from '../../scripts/dictionary/lib/polimorf'

const all = parsePolimorfText(readFileSync('tests/fixtures/dictionary/polimorf-sample.tab', 'utf8'))
const rowsOf = (lemma: string): MorphRow[] => all.filter((r) => r.lemma === lemma)

function table(result: ReturnType<typeof buildParadigm>, title: string) {
  const found = result.tables.find((t) => t.title === title)
  if (!found)
    throw new Error(`no table ${title}; have ${result.tables.map((t) => t.title).join(' | ')}`)
  return found
}
function row(t: { rows: { label: string; cells: string[][] }[] }, label: string) {
  const found = t.rows.find((r) => r.label === label)
  if (!found) throw new Error(`no row ${label}`)
  return found.cells
}

describe('assemblePast / assembleConditional', () => {
  it('uses the feminine stem for ó→o alternation and the masculine base otherwise', () => {
    const móc = assemblePast({
      masc: 'mógł',
      fem: 'mogła',
      neut: 'mogło',
      virile: 'mogli',
      other: 'mogły',
    })
    expect(móc.sg.m).toEqual({ pri: 'mogłem', sec: 'mogłeś', ter: 'mógł' })
    expect(móc.sg.f).toEqual({ pri: 'mogłam', sec: 'mogłaś', ter: 'mogła' })
    expect(móc.sg.n).toEqual({ pri: null, sec: null, ter: 'mogło' })
    expect(móc.pl.virile).toEqual({ pri: 'mogliśmy', sec: 'mogliście', ter: 'mogli' })
    expect(assemblePast({ masc: 'szedł', fem: 'szła' }).sg.m.pri).toBe('szedłem')
  })

  it('builds the conditional from the masculine base', () => {
    const móc = assembleConditional({
      masc: 'mógł',
      fem: 'mogła',
      neut: 'mogło',
      virile: 'mogli',
      other: 'mogły',
    })
    expect(móc.sg.m).toEqual({ pri: 'mógłbym', sec: 'mógłbyś', ter: 'mógłby' })
    expect(móc.sg.f.pri).toBe('mogłabym')
    expect(móc.pl.other).toEqual({ pri: 'mogłybyśmy', sec: 'mogłybyście', ter: 'mogłyby' })
  })
})

describe('buildParadigm — noun', () => {
  const dom = buildParadigm('noun', 'dom', rowsOf('dom'), [], null)

  it('builds the declension table and grammar label', () => {
    expect(dom.grammarLabel).toBe('мужской род, неодушевлённый')
    const t = table(dom, 'Склонение')
    expect(t.columns).toEqual(['Ед. ч.', 'Мн. ч.'])
    expect(t.rows).toHaveLength(7)
    expect(row(t, 'Родительный')).toEqual([['domu'], ['domów']])
    expect(row(t, 'Звательный')).toEqual([['domu'], ['domy']])
  })

  it('lists all forms sorted', () => {
    expect(dom.allForms).toEqual([
      'dom',
      'domach',
      'domami',
      'domem',
      'domom',
      'domowi',
      'domów',
      'domu',
      'domy',
    ])
  })
})

describe('buildParadigm — nouns with homonyms of another gender', () => {
  // pies the dog (m2) and pies «policeman» (m1) share a lemma; only m1 has psów as accusative.
  const cases = ['nom', 'gen', 'dat', 'acc', 'inst', 'loc', 'voc']
  const dog = ['pies', 'psa', 'psu', 'psa', 'psem', 'psie', 'psie']
  const dogs = ['psy', 'psów', 'psom', 'psy', 'psami', 'psach', 'psy']
  const cops = ['psowie', 'psów', 'psom', 'psów', 'psami', 'psach', 'psowie']
  const lines = cases.flatMap((c, i) => [
    `${dog[i]}\tpies\tsubst:sg:${c}:m2\tpospolita`,
    `${dogs[i]}\tpies\tsubst:pl:${c}:m2\tpospolita`,
    `${dog[i]}\tpies\tsubst:sg:${c}:m1\tpospolita`,
    `${cops[i]}\tpies\tsubst:pl:${c}:m1\tpospolita`,
  ])
  const rows = parsePolimorfText(lines.join('\n'))
  const tag = {
    nom: 'nominative',
    gen: 'genitive',
    dat: 'dative',
    acc: 'accusative',
    inst: 'instrumental',
    loc: 'locative',
    voc: 'vocative',
  } as Record<string, string>
  const wikiDog = cases.flatMap((c, i) => [
    { form: dog[i]!, tags: [tag[c]!, 'singular'] },
    { form: dogs[i]!, tags: [tag[c]!, 'plural'] },
  ])

  it("keeps the gender of Wiktionary's first entry", () => {
    const pies = buildParadigm('noun', 'pies', rows, wikiDog, null)
    const t = table(pies, 'Склонение')
    expect(row(t, 'Винительный')).toEqual([['psa'], ['psy']])
    expect(row(t, 'Именительный')).toEqual([['pies'], ['psy']])
    expect(pies.grammarLabel).toBe('мужской род, одушевлённый')
    expect(pies.allForms).not.toContain('psowie')
  })

  it('shows a homonym the card teaches as a second table', () => {
    const typ = parsePolimorfText(
      [
        'typ\ttyp\tsubst:sg:nom:m3\tpospolita',
        'typy\ttyp\tsubst:pl:nom:m3\tpospolita',
        'typ\ttyp\tsubst:sg:acc:m3\tpospolita',
        'typ\ttyp\tsubst:sg:nom:m1\tpospolita',
        'typa\ttyp\tsubst:sg:acc:m1\tpospolita',
      ].join('\n'),
    )
    const result = buildParadigm('noun', 'typ', typ, [], null)
    expect(result.tables.map((t) => t.title)).toEqual([
      'Склонение',
      'Склонение — мужской род, личный',
    ])
    expect(row(table(result, 'Склонение'), 'Винительный')).toEqual([['typ'], []])
    expect(result.allForms).toContain('typa')
  })

  it('falls back to the gender with the most forms without Wiktionary', () => {
    const extra = parsePolimorfText(`psiska\tpies\tsubst:pl:nom:m2\tpospolita`)
    const pies = buildParadigm('noun', 'pies', [...rows, ...extra], [], null)
    expect(pies.grammarLabel).toBe('мужской род, одушевлённый')
  })
})

describe('buildParadigm — verbs', () => {
  const mieć = buildParadigm('verb', 'mieć', rowsOf('mieć'), [], 'imperf')

  it('builds present, past, compound future, conditional and imperative', () => {
    expect(row(table(mieć, 'Настоящее время'), '1-е лицо')).toEqual([['mam'], ['mamy']])
    expect(row(table(mieć, 'Прошедшее время (ед. ч.)'), '1-е лицо')).toEqual([
      ['miałem'],
      ['miałam'],
      [],
    ])
    expect(row(table(mieć, 'Прошедшее время (мн. ч.)'), '1-е лицо')).toEqual([
      ['mieliśmy'],
      ['miałyśmy'],
    ])
    expect(row(table(mieć, 'Будущее время'), '1-е лицо')).toEqual([
      ['będę mieć', 'będę miał', 'będę miała'],
      ['będziemy mieć', 'będziemy mieli', 'będziemy miały'],
    ])
    expect(row(table(mieć, 'Условное наклонение (ед. ч.)'), '1-е лицо')).toEqual([
      ['miałbym'],
      ['miałabym'],
      [],
    ])
    const impt = table(mieć, 'Повелительное наклонение')
    expect(row(impt, '2-е л. ед. ч.')).toEqual([['miej']])
    expect(row(impt, '3-е лицо')).toEqual([['niech ma', 'niech mają']])
  })

  it('marks rare forms as extra and includes assembled single-word forms', () => {
    expect(table(mieć, 'Безличная форма').extra).toBe(true)
    expect(row(table(mieć, 'Деепричастия'), 'Одновременное')).toEqual([['mając']])
    expect(mieć.allForms).toContain('miałem')
    expect(mieć.allForms).toContain('miałbym')
    expect(mieć.allForms).not.toContain('będę mieć')
  })

  it('uses the simple future title for perfective verbs and skips the compound future', () => {
    const zrobić = buildParadigm('verb', 'zrobić', rowsOf('zrobić'), [], 'perf')
    expect(row(table(zrobić, 'Простое будущее время'), '1-е лицо')).toEqual([
      ['zrobię'],
      ['zrobimy'],
    ])
    expect(zrobić.tables.some((t) => t.title === 'Будущее время')).toBe(false)
    expect(row(table(zrobić, 'Деепричастия'), 'Предшествующее')).toEqual([['zrobiwszy']])
  })

  it('uses być forms for present and future', () => {
    const być = buildParadigm('verb', 'być', rowsOf('być'), [], 'imperf')
    expect(row(table(być, 'Настоящее время'), '1-е лицо')).toEqual([['jestem'], ['jesteśmy']])
    expect(row(table(być, 'Будущее время'), '1-е лицо')).toEqual([['będę'], ['będziemy']])
    expect(row(table(być, 'Прошедшее время (ед. ч.)'), '1-е лицо')).toEqual([
      ['byłem'],
      ['byłam'],
      [],
    ])
  })

  it('takes the free masculine past, not the agglutinative stem', () => {
    const rows: MorphRow[] = [
      { form: 'wyniosł', lemma: 'wynieść', tag: 'praet:sg:m1.m2.m3:perf:agl' },
      { form: 'wyniósł', lemma: 'wynieść', tag: 'praet:sg:m1.m2.m3:perf:nagl' },
      { form: 'wyniosła', lemma: 'wynieść', tag: 'praet:sg:f:perf' },
    ]
    const wynieść = buildParadigm('verb', 'wynieść', rows, [], 'perf')
    const past = table(wynieść, 'Прошедшее время (ед. ч.)')
    expect(row(past, '1-е лицо')[0]).toEqual(['wyniosłem'])
    expect(row(past, '3-е лицо')[0]).toEqual(['wyniósł'])
    const cond = table(wynieść, 'Условное наклонение (ед. ч.)')
    expect(row(cond, '1-е лицо')[0]).toEqual(['wyniósłbym'])
    expect(row(cond, '3-е лицо')[0]).toEqual(['wyniósłby'])
    expect(wynieść.allForms).not.toContain('wyniosł')
    expect(wynieść.allForms).toContain('wyniosłem')
  })

  it('reports Wiktionary forms that were not generated', () => {
    const rows: MorphRow[] = [
      { form: 'mógł', lemma: 'móc', tag: 'praet:sg:m1.m2.m3:imperf' },
      { form: 'mogła', lemma: 'móc', tag: 'praet:sg:f:imperf' },
    ]
    const ok = buildParadigm(
      'verb',
      'móc',
      rows,
      [{ form: 'mogłem', tags: ['first-person', 'past', 'singular'] }],
      'imperf',
    )
    expect(ok.mismatches).toEqual([])
    const bad = buildParadigm(
      'verb',
      'móc',
      rows,
      [{ form: 'mógłem', tags: ['first-person', 'past', 'singular'] }],
      'imperf',
    )
    expect(bad.mismatches).toEqual([
      'Wiktionary: mógłem (first-person past singular) нет среди сгенерированных форм',
    ])
  })
})

describe('buildParadigm — adjectives, adverbs, pronouns, numerals, prepositions', () => {
  it('builds adjective declension and degrees', () => {
    const dobry = buildParadigm('adj', 'dobry', rowsOf('dobry'), [], null)
    expect(row(table(dobry, 'Склонение'), 'Винительный')).toEqual([
      ['dobrego'],
      ['dobry'],
      ['dobrą'],
      ['dobre'],
      ['dobrych'],
      ['dobre'],
    ])
    const degrees = table(dobry, 'Степени сравнения')
    expect(row(degrees, 'Сравнительная')).toEqual([['lepszy']])
    expect(row(degrees, 'Превосходная')).toEqual([['najlepszy']])
    expect(dobry.allForms).not.toContain('dobro')
  })

  it('builds adverb degrees', () => {
    const dobrze = buildParadigm('adv', 'dobrze', rowsOf('dobrze'), [], null)
    const t = table(dobrze, 'Степени сравнения')
    expect(t.rows.map((r) => r.cells)).toEqual([[['dobrze']], [['lepiej']], [['najlepiej']]])
  })

  it('orders third-person pronoun variants: long, short, after preposition', () => {
    const on = buildParadigm('pron', 'on', rowsOf('on'), [], null)
    const t = table(on, 'Склонение')
    expect(row(t, 'Родительный')[0]).toEqual(['jego', 'go', 'niego', 'ń'])
    expect(row(t, 'Винительный')[1]).toEqual(['ją', 'nią'])
  })

  it('builds numeral gender columns', () => {
    const dwa = buildParadigm('num', 'dwa', rowsOf('dwa'), [], null)
    expect(row(table(dwa, 'Склонение'), 'Именительный')).toEqual([
      ['dwaj', 'dwóch', 'dwu'],
      ['dwa'],
      ['dwie'],
      ['dwoje'],
    ])
  })

  it('gives prepositions forms but no tables', () => {
    const w = buildParadigm('prep', 'w', rowsOf('w'), [], null)
    expect(w.tables).toEqual([])
    expect(w.allForms).toEqual(['w', 'we'])
  })
})
