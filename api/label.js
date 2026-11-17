// POST /api/label  { scanId, label }  + admin auth
// Expert photo dekh kar sahi bimari (ID) lagata hai → data/labels.json (model training isi se hoti hai)
import { isAdmin } from './_lib.js'
import { update } from './_store.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })
  const { scanId, label } = req.body || {}
  if (!scanId || !/^[a-z_]{2,40}$/.test(String(label))) return res.status(400).json({ error: 'scanId + label' })

  let file = null
  await update('scans.json', [], (list) =>
    list.map((s) => {
      if (s.id !== scanId) return s
      file = s.file
      return { ...s, expertLabel: label, review: false, labeledAt: new Date().toISOString() }
    }),
  )
  if (!file) return res.status(404).json({ error: 'scan not found' })
  await update('labels.json', {}, (m) => ({ ...m, [file]: label }))
  return res.status(200).json({ ok: true })
}
