// public/audio/<lang>/ ki saari recordings dhoond kar manifest.json banata hai.
// Chalayein: npm run audio:manifest
import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { join, extname, basename } from 'node:path'

const root = join(process.cwd(), 'public', 'audio')
const exts = new Set(['.mp3', '.webm', '.m4a', '.ogg', '.wav'])
const manifest = {}

if (existsSync(root)) {
  for (const lang of readdirSync(root)) {
    const dir = join(root, lang)
    if (!statSync(dir).isDirectory()) continue
    for (const file of readdirSync(dir)) {
      const ext = extname(file).toLowerCase()
      if (!exts.has(ext)) continue
      const id = basename(file, ext)
      manifest[lang] ??= {}
      // mp3 ko tarjeeh (sab phones par chalta hai)
      if (!manifest[lang][id] || ext === '.mp3') manifest[lang][id] = file
    }
  }
}

writeFileSync(join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
const count = Object.values(manifest).reduce((n, m) => n + Object.keys(m).length, 0)
console.log(`manifest.json: ${count} recordings`)
