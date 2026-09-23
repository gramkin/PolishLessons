export interface AudioMeta {
  file: string
  url: string
  license: string
  author: string
}

const FREE_LICENSE = /^(public domain|cc0\b.*|cc by(-sa)? \d(\.\d)?\b.*)$/i

export function isFreeLicense(license: string): boolean {
  return FREE_LICENSE.test(license.trim())
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

type Json = Record<string, unknown>

// Wikimedia rejects generic User-Agents with a 403 and an HTML error page; the
// string has to identify the tool and carry a URL. Override COMMONS_USER_AGENT
// to point at a real contact address for this project.
const USER_AGENT =
  process.env.COMMONS_USER_AGENT ??
  'polski-dictionary-build/1.0 (+https://www.mediawiki.org/wiki/API:Etiquette)'

export function parseCommonsResponse(json: unknown): AudioMeta[] {
  const pages = (((json as Json)?.query as Json)?.pages as Json[] | undefined) ?? []
  const result: AudioMeta[] = []
  for (const page of pages) {
    const info = (page.imageinfo as Json[] | undefined)?.[0]
    const meta = info?.extmetadata as Record<string, { value?: string }> | undefined
    const license = meta?.LicenseShortName?.value
    if (!info || typeof info.url !== 'string' || !license || !isFreeLicense(license)) continue
    result.push({
      file: String(page.title).replace(/^File:/, ''),
      url: info.url.split('?')[0]!,
      license,
      author: stripHtml(meta?.Artist?.value ?? '') || 'unknown',
    })
  }
  return result
}

export async function fetchAudioMeta(
  files: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<Map<string, AudioMeta>> {
  const result = new Map<string, AudioMeta>()
  for (let i = 0; i < files.length; i += 50) {
    const titles = files
      .slice(i, i + 50)
      .map((f) => `File:${f}`)
      .join('|')
    const params = new URLSearchParams({
      action: 'query',
      titles,
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiextmetadatafilter: 'LicenseShortName|Artist',
      format: 'json',
      formatversion: '2',
    })
    const response = await fetchImpl(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    })
    const body = await response.text()
    if (!response.ok) {
      throw new Error(
        `commons: HTTP ${response.status} for ${files.length} file(s): ${body.slice(0, 120)}`,
      )
    }
    let json: unknown
    try {
      json = JSON.parse(body)
    } catch {
      throw new Error(`commons: response was not JSON: ${body.slice(0, 120)}`)
    }
    for (const meta of parseCommonsResponse(json)) result.set(meta.file, meta)
  }
  return result
}
