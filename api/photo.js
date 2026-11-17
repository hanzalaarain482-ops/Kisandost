// GET /api/photo?f=<file>&s=<signature> → kisan ki photo (sirf signed link se, admin ke liye)
import { photoSig } from './_lib.js'
import { readPhoto } from './_store.js'

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://x')
  const f = url.searchParams.get('f') || ''
  const s = url.searchParams.get('s') || ''
  if (!f || s !== photoSig(f)) return res.status(403).json({ error: 'forbidden' })
  const buf = readPhoto(f)
  if (!buf) return res.status(404).json({ error: 'not found' })
  res.statusCode = 200
  res.setHeader('Content-Type', 'image/jpeg')
  res.setHeader('Cache-Control', 'private, max-age=3600')
  res.end(buf)
}
