// POST /api/scans  { image, crop, disease, confidence, review, method, phone? }
//      → photo data/uploads mein + record data/scans.json mein (training ke liye)
// GET  /api/scans  + admin auth → saare scans (photo links ke saath) + kisanon ki ginti
import { isAdmin, newId, normalizePhone, photoSig } from './_lib.js'
import { readJson, savePhoto, update } from './_store.js'

const MAX_SCANS = 5000

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const b = req.body || {}
    if (typeof b.image !== 'string' || b.image.length > 4_500_000) {
      return res.status(400).json({ error: 'image required (max ~3MB)' })
    }
    const id = newId()
    let file = null
    try {
      file = savePhoto(id, b.image)
    } catch {
      return res.status(500).json({ error: 'photo save failed' })
    }
    const scan = {
      id,
      at: new Date().toISOString(),
      phone: normalizePhone(b.phone) || null,
      crop: String(b.crop || '').slice(0, 20),
      disease: String(b.disease || '').slice(0, 40),
      confidence: Math.max(0, Math.min(100, Math.round(Number(b.confidence) || 0))),
      review: !!b.review,
      method: String(b.method || '').slice(0, 20), // 'model' | 'color'
      file,
      expertLabel: null,
    }
    await update('scans.json', [], (list) => [scan, ...list].slice(0, MAX_SCANS))
    return res.status(200).json({ ok: true, id })
  }

  if (req.method === 'GET') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })
    const scans = readJson('scans.json', []).slice(0, 300).map((s) => ({
      ...s,
      photo: s.file ? `/api/photo?f=${encodeURIComponent(s.file)}&s=${photoSig(s.file)}` : null,
    }))
    const farmers = readJson('farmers.json', [])
    const labels = readJson('labels.json', {})
    return res.status(200).json({ scans, farmersCount: farmers.length, labeledCount: Object.keys(labels).length })
  }

  return res.status(405).json({ error: 'method' })
}
