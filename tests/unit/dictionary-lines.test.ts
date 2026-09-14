import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { readLines } from '../../scripts/dictionary/lib/lines'

const dir = mkdtempSync(join(tmpdir(), 'dict-lines-'))
const text = 'dom\tdom\tsubst:sg:nom:m3\nmama\tmama\tsubst:sg:nom:f\n'

async function collect(path: string): Promise<string[]> {
  const out: string[] = []
  for await (const line of readLines(path)) out.push(line)
  return out
}

const hasBzip2 = spawnSync('bzip2', ['--help']).status === 0

describe('readLines', () => {
  it('reads plain text files', async () => {
    const path = join(dir, 'plain.tab')
    writeFileSync(path, text)
    expect(await collect(path)).toEqual(['dom\tdom\tsubst:sg:nom:m3', 'mama\tmama\tsubst:sg:nom:f'])
  })

  it('reads gzip files', async () => {
    const path = join(dir, 'file.tab.gz')
    writeFileSync(path, gzipSync(text))
    expect(await collect(path)).toHaveLength(2)
  })

  it.skipIf(!hasBzip2)('reads bzip2 files', async () => {
    const path = join(dir, 'file.tsv')
    writeFileSync(path, text)
    spawnSync('bzip2', ['-f', path])
    expect(await collect(`${path}.bz2`)).toHaveLength(2)
  })
})
