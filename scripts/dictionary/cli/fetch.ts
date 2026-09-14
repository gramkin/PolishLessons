import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { spawnSync } from 'node:child_process'
import { DATA, SOURCE_URLS, SOURCES, type SourceName } from '../lib/paths'

const force = process.argv.includes('--force')

function sha256(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    createReadStream(path)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject)
  })
}

const lock: Record<string, { url: string; file: string; bytes: number; sha256: string }> = {}

for (const name of Object.keys(SOURCES) as SourceName[]) {
  const file = SOURCES[name]
  mkdirSync(dirname(file), { recursive: true })
  if (force || !existsSync(file)) {
    console.log(`↓ ${name}`)
    const result = spawnSync(
      'curl',
      ['-sSL', '--retry', '3', '--max-time', '3000', '-o', file, SOURCE_URLS[name]],
      {
        stdio: 'inherit',
      },
    )
    if (result.status !== 0) throw new Error(`download failed: ${name}`)
  }
  lock[name] = {
    url: SOURCE_URLS[name],
    file,
    bytes: statSync(file).size,
    sha256: await sha256(file),
  }
  console.log(`✓ ${name} ${lock[name].bytes} bytes`)
}

writeFileSync(DATA.lock, `${JSON.stringify(lock, null, 2)}\n`)
console.log(`✓ ${DATA.lock}`)
