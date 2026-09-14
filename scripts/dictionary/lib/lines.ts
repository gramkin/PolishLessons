import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import type { Readable } from 'node:stream'
import { createGunzip } from 'node:zlib'

function openStream(path: string): Readable {
  if (path.endsWith('.bz2')) {
    const child = spawn('bzcat', [path], { stdio: ['ignore', 'pipe', 'inherit'] })
    return child.stdout
  }
  const file = createReadStream(path)
  return path.endsWith('.gz') ? file.pipe(createGunzip()) : file
}

export async function* readLines(path: string): AsyncGenerator<string> {
  const lines = createInterface({ input: openStream(path), crlfDelay: Infinity })
  for await (const line of lines) {
    if (line.length > 0) yield line
  }
}
