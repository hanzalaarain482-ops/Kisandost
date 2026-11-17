// =====================================================================
// KISAN DOST SERVER — app + API + file storage, ek hi Node process mein
// ---------------------------------------------------------------------
//   npm run build   (pehli dafa / har update ke baad)
//   npm start       → http://localhost:3000
// Data `data/` folder mein save hota hai (DATA_DIR se badal sakte hain).
// Kisi bhi Node hosting par chalta hai: VPS, Render, Railway, Hostinger Node, apna PC.
// Koi extra package nahi chahiye.
// =====================================================================
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname, normalize, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = fileURLToPath(new URL('.', import.meta.url))
const DIST = resolve(ROOT, 'dist')
const API = resolve(ROOT, 'api')
const PORT = Number(process.env.PORT || 3000)
const MAX_BODY = 6 * 1024 * 1024

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp3': 'audio/mpeg',
  '.webm': 'audio/webm',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.bin': 'application/octet-stream',
  '.webmanifest': 'application/manifest+json',
}

function addHelpers(res) {
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (obj) => {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(obj))
    return res
  }
}

async function readBody(req) {
  let size = 0
  const chunks = []
  for await (const c of req) {
    size += c.length
    if (size > MAX_BODY) throw new Error('too large')
    chunks.push(c)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return (req.headers['content-type'] || '').includes('json') ? JSON.parse(raw) : {}
}

async function handleApi(req, res, name) {
  // Sirf api/ folder ki seedhi files, `_` wali helper files nahi
  if (!/^[a-z][a-z0-9-]*$/.test(name)) return res.status(404).json({ error: 'not found' })
  const file = join(API, name + '.js')
  if (!existsSync(file)) return res.status(404).json({ error: 'not found' })
  try {
    req.body = req.method === 'POST' ? await readBody(req) : {}
  } catch {
    return res.status(413).json({ error: 'body too large or invalid' })
  }
  const mod = await import(pathToFileURL(file).href)
  return mod.default(req, res)
}

async function serveStatic(req, res, pathname) {
  let p = resolve(DIST, '.' + normalize(decodeURIComponent(pathname)))
  if (p !== DIST && !p.startsWith(DIST + sep)) return res.status(403).end()
  try {
    const s = await stat(p)
    if (s.isDirectory()) p = join(p, 'index.html')
  } catch {
    p = join(DIST, 'index.html') // SPA fallback
  }
  try {
    const data = await readFile(p)
    res.setHeader('Content-Type', TYPES[extname(p)] || 'application/octet-stream')
    if (p.includes(`${sep}assets${sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.end(data)
  } catch {
    res.status(404).end('Not found — pehle `npm run build` chalayein')
  }
}

http
  .createServer(async (req, res) => {
    addHelpers(res)
    try {
      const { pathname } = new URL(req.url, 'http://localhost')
      if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname.slice(5).replace(/\/$/, ''))
      return await serveStatic(req, res, pathname)
    } catch (e) {
      console.error(e)
      if (!res.headersSent) res.status(500).json({ error: 'server error' })
    }
  })
  .listen(PORT, () => {
    console.log(`Kisan Dost: http://localhost:${PORT}   (admin: /#admin)`)
  })
