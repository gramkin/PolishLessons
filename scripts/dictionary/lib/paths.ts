export const SOURCES = {
  frequency: 'data/sources/pl_50k.txt',
  polimorf: 'data/sources/PoliMorf-0.6.7.tab.gz',
  wiktionary: 'data/sources/pl-extract.jsonl.gz',
  tatoebaPol: 'data/sources/pol_sentences.tsv.bz2',
  tatoebaLinks: 'data/sources/pol-rus_links.tsv.bz2',
  tatoebaRus: 'data/sources/rus_sentences.tsv.bz2',
} as const

export type SourceName = keyof typeof SOURCES

export const SOURCE_URLS: Record<SourceName, string> = {
  frequency:
    'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pl/pl_50k.txt',
  polimorf:
    'http://zil.ipipan.waw.pl/PoliMorf?action=AttachFile&do=get&target=PoliMorf-0.6.7.tab.gz',
  wiktionary: 'https://kaikki.org/dictionary/downloads/pl/pl-extract.jsonl.gz',
  tatoebaPol: 'https://downloads.tatoeba.org/exports/per_language/pol/pol_sentences.tsv.bz2',
  tatoebaLinks: 'https://downloads.tatoeba.org/exports/per_language/pol/pol-rus_links.tsv.bz2',
  tatoebaRus: 'https://downloads.tatoeba.org/exports/per_language/rus/rus_sentences.tsv.bz2',
}

export const DATA = {
  lock: 'data/sources.lock.json',
  ranked: 'data/ranked.json',
  overrides: 'data/overrides.yml',
  drafts: 'data/drafts',
  batches: 'data/batches',
  audioCache: 'data/cache/audio.json',
} as const

export const CONTENT = {
  cards: 'content/dictionary',
  forms: 'content/forms',
  words: 'content/words',
} as const

export const PUBLIC_DIR = 'public/dictionary'

export const FIXTURES = 'tests/fixtures/dictionary'
