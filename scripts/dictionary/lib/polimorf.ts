import { readLines } from './lines'

export interface MorphRow {
  form: string
  lemma: string
  tag: string
}

export function parsePolimorfLine(line: string): MorphRow | null {
  const [form, lemma, tag] = line.split('\t')
  if (!form || !lemma || !tag) return null
  return { form, lemma, tag }
}

export function expandTag(tag: string): string[][] {
  return tag
    .split(':')
    .reduce<string[][]>(
      (acc, part) => acc.flatMap((prefix) => part.split('.').map((option) => [...prefix, option])),
      [[]],
    )
}

export function tagHead(tag: string): string {
  return tag.split(':')[0] ?? tag
}

function dedupe(rows: Iterable<MorphRow>): MorphRow[] {
  const seen = new Set<string>()
  const out: MorphRow[] = []
  for (const row of rows) {
    const key = `${row.form}\t${row.lemma}\t${row.tag}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
  }
  return out
}

export function parsePolimorfText(text: string): MorphRow[] {
  return dedupe(
    text
      .split('\n')
      .map(parsePolimorfLine)
      .filter((r): r is MorphRow => r !== null),
  )
}

export async function readPolimorf(
  path: string,
  keep: (row: MorphRow) => boolean,
): Promise<MorphRow[]> {
  const rows: MorphRow[] = []
  for await (const line of readLines(path)) {
    const row = parsePolimorfLine(line)
    if (row && keep(row)) rows.push(row)
  }
  return dedupe(rows)
}
