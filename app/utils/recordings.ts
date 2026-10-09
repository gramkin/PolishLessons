import type { Audio } from '../../shared/dictionary'

/** Every recording we have is a Wikimedia Commons file; the shared prefix is stored once. */
export const COMMONS_PREFIX = 'https://upload.wikimedia.org/wikipedia/commons/'

export interface Recording {
  url: string
  author: string
  license: string
}

/**
 * `public/dictionary/audio.json`: native-speaker recordings keyed by lemma.
 * Authors and licences repeat thousands of times, so rows point into two lists.
 */
export interface RecordingsFile {
  authors: string[]
  licenses: string[]
  words: Record<string, [path: string, author: number, license: number]>
}

/** Case, Unicode form and surrounding punctuation never decide whether a word has a recording. */
export function recordingKey(text: string): string {
  return text
    .normalize('NFC')
    .trim()
    .replace(/^[\p{P}\s]+|[\p{P}\s]+$/gu, '')
    .toLocaleLowerCase('pl')
}

export function packRecordings(entries: { lemma: string; audio: Audio }[]): RecordingsFile {
  const authors: string[] = []
  const licenses: string[] = []
  const words: RecordingsFile['words'] = {}
  const indexOf = (list: string[], value: string) => {
    const at = list.indexOf(value)
    return at === -1 ? list.push(value) - 1 : at
  }
  for (const { lemma, audio } of [...entries].sort((a, b) =>
    a.lemma.localeCompare(b.lemma, 'pl'),
  )) {
    const key = recordingKey(lemma)
    if (!key || key in words) continue
    const path = audio.url.startsWith(COMMONS_PREFIX)
      ? audio.url.slice(COMMONS_PREFIX.length)
      : audio.url
    words[key] = [path, indexOf(authors, audio.author), indexOf(licenses, audio.license)]
  }
  return { authors, licenses, words }
}

export function findRecording(file: RecordingsFile, text: string): Recording | null {
  const row = file.words[recordingKey(text)]
  if (!row) return null
  const [path, author, license] = row
  return {
    url: /^https?:\/\//.test(path) ? path : COMMONS_PREFIX + path,
    author: file.authors[author] ?? '',
    license: file.licenses[license] ?? '',
  }
}
