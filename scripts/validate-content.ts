import { resolve } from 'node:path'
import { loadContent } from './lib/load-content'
import { validateContent } from './lib/validate'

const root = resolve(process.cwd(), 'content')
const errors = validateContent(loadContent(root))

if (errors.length > 0) {
  console.error(`✗ ${errors.length} content error(s):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log('✓ content is valid')
