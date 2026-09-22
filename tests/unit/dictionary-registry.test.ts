import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readRegistry } from '../../scripts/dictionary/lib/registry'

describe('readRegistry', () => {
  it('reads a registry file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'registry-'))
    const path = join(dir, 'words.json')
    writeFileSync(path, JSON.stringify([{ rank: 2001, id: 'lecz', lemma: 'lecz', pos: 'conj' }]))
    expect(readRegistry(path).map((e) => e.id)).toEqual(['lecz'])
  })

  it('treats a missing file as empty, so the second registry stays optional', () => {
    expect(readRegistry(join(tmpdir(), 'registry-does-not-exist.json'))).toEqual([])
  })
})
