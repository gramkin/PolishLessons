import { writeDrills } from './lib/drills'

const written = writeDrills('public')
const empty = written.filter((d) => d.items === 0)
console.log(`✓ drills: ${written.map((d) => `${d.id} ${d.items}`).join(', ')}`)
if (empty.length > 0) {
  console.error(`✗ drills with no sentences: ${empty.map((d) => d.id).join(', ')}`)
  process.exit(1)
}
