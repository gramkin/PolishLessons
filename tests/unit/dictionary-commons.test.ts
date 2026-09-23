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

  it('sends a User-Agent carrying a URL, which Wikimedia requires', async () => {
    const fetchImpl = vi.fn(
      async (_url: string, _init?: RequestInit) => new Response(JSON.stringify(response)),
    )
    await fetchAudioMeta(['Pl-dom.ogg'], fetchImpl as unknown as typeof fetch)
    const init = fetchImpl.mock.calls[0]![1]!
    const headers = init.headers as Record<string, string>
    expect(headers['User-Agent']).toMatch(/https?:\/\//)
  })

  it('reports a failed request instead of choking on the error page', async () => {
    const fetchImpl = vi.fn(async () => new Response('<!DOCTYPE html>', { status: 403 }))
    await expect(
      fetchAudioMeta(['Pl-dom.ogg'], fetchImpl as unknown as typeof fetch),
    ).rejects.toThrow(/403/)
  })
})
