import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadContent } from './lib/load-content'
import { buildSearchDocs } from './lib/search-docs'

const docs = buildSearchDocs(loadContent(resolve(process.cwd(), 'content')))
mkdirSync(resolve(process.cwd(), 'public'), { recursive: true })
writeFileSync(resolve(process.cwd(), 'public/search-index.json'), JSON.stringify({ docs }))
console.log(`✓ search index: ${docs.length} documents`)
