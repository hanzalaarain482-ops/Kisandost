// =====================================================================
// FILE STORAGE — saara data `data/` folder ki JSON files mein
// ---------------------------------------------------------------------
//   data/settings.json   OTP / demo code settings
//   data/admin.json      admin password (hash)
//   data/rates.json      mandi rates
//   data/farmers.json    login karne wale kisan
//   data/scans.json      har photo check ka record
//   data/labels.json     expert ne photo ko jo sahi bimari batayi (training ke liye)
//   data/uploads/*.jpg   kisanon ki photos (training ke liye)
//
// DATA_DIR env se folder badal sakte hain (default: ./data).
// NOTE: Vercel jaisi "serverless" hosting par files save nahi rehti.
// Is ke liye `npm start` wala Node server kisi VPS / Render / Railway / apne PC par chalayein.
// =====================================================================
import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const DATA_DIR = resolve(process.env.DATA_DIR || join(process.cwd(), 'data'))
export const UPLOAD_DIR = join(DATA_DIR, 'uploads')

function ensure() {
  mkdirSync(UPLOAD_DIR, { recursive: true })
}

export function readJson(name, fallback) {
  try {
    const p = join(DATA_DIR, name)
    if (!existsSync(p)) return fallback
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return fallback
  }
}

// Pehle temp file mein likh kar phir rename — beech mein crash ho to file kharab nahi hoti
export function writeJson(name, value) {
  ensure()
  const p = join(DATA_DIR, name)
  const tmp = p + '.' + process.pid + '.tmp'
  writeFileSync(tmp, JSON.stringify(value, null, 2))
  renameSync(tmp, p)
}

// Ek hi waqt mein do request ek file na bigaarein (ek process ke andar)
let chain = Promise.resolve()
export function update(name, fallback, fn) {
  const run = chain.then(() => {
    const next = fn(readJson(name, fallback))
    writeJson(name, next)
    return next
  })
  chain = run.catch(() => {})
  return run
}

export function savePhoto(id, base64) {
  ensure()
  const data = String(base64).replace(/^data:image\/\w+;base64,/, '')
  const file = id.replace(/[^a-zA-Z0-9_-]/g, '') + '.jpg'
  writeFileSync(join(UPLOAD_DIR, file), Buffer.from(data, 'base64'))
  return file
}

export function readPhoto(file) {
  const safe = String(file).replace(/[^a-zA-Z0-9_.-]/g, '')
  if (!safe.endsWith('.jpg')) return null
  const p = join(UPLOAD_DIR, safe)
  return existsSync(p) ? readFileSync(p) : null
}
