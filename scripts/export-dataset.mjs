// Expert ki label ki hui photos ko training ke liye folders mein rakhta hai:
//   dataset/<label>/<photo>.jpg      (label = bimari ki ID, jaise wheat_yellow_rust)
// Chalayein: npm run dataset   → phir `dataset` folder zip karke Colab notebook mein upload karein
import { mkdirSync, copyFileSync, existsSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'

const DATA = resolve(process.env.DATA_DIR || 'data')
const OUT = resolve('dataset')
const labelsFile = join(DATA, 'labels.json')
if (!existsSync(labelsFile)) {
  console.error('data/labels.json nahi mili — pehle admin panel ke Expert Review mein photos label karein')
  process.exit(1)
}
const labels = JSON.parse(readFileSync(labelsFile, 'utf8'))
rmSync(OUT, { recursive: true, force: true })
const count = {}
for (const [file, label] of Object.entries(labels)) {
  const src = join(DATA, 'uploads', file)
  if (!existsSync(src)) continue
  mkdirSync(join(OUT, label), { recursive: true })
  copyFileSync(src, join(OUT, label, file))
  count[label] = (count[label] || 0) + 1
}
console.table(count)
console.log('dataset/ tayyar. Har bimari ki kam az kam 50-100 photos ho to model acha banta hai.')
