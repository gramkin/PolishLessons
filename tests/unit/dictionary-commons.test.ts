import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import {
  fetchAudioMeta,
  isFreeLicense,
  parseCommonsResponse,
  stripHtml,
} from '../../scripts/dictionary/lib/commons'

const response = JSON.parse(readFileSync('tests/fixtures/dictionary/commons-response.json', 'utf8'))

describe('commons', () => {
  it('recognizes free licenses', () => {
    expect(isFreeLicense('Public domain')).toBe(true)
    expect(isFreeLicense('CC0')).toBe(true)
    expect(isFreeLicense('CC BY 2.5')).toBe(true)
    expect(isFreeLicense('CC BY-SA 4.0')).toBe(true)
    expect(isFreeLicense('All rights reserved')).toBe(false)
  })

  it('strips HTML and entities from author fields', () => {
    expect(stripHtml('<a href="x">Derbeth</a> &amp; friends')).toBe('Derbeth & friends')
  })

  it('parses free files only and cleans URLs', () => {
    expect(parseCommonsResponse(response)).toEqual([
      {
        file: 'Pl-dom.ogg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Pl-dom.ogg',
        license: 'Public domain',
        author: 'tsca',
      },
      {
        file: 'Pl-mieć.ogg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Pl-mie%C4%87.ogg',
        license: 'CC BY 2.5',
        author: 'Derbeth & friends',
      },
    ])
  })

  it('fetches in batches and maps by file name', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(response)))
    const meta = await fetchAudioMeta(
      ['Pl-dom.ogg', 'Pl-mieć.ogg'],
      fetchImpl as unknown as typeof fetch,
    )
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(String(fetchImpl.mock.calls[0]![0])).toContain(
      'titles=File%3APl-dom.ogg%7CFile%3APl-mie%C4%87.ogg',
    )
    expect(meta.get('Pl-mieć.ogg')?.license).toBe('CC BY 2.5')
  })
})
