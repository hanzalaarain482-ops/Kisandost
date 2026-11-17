// POST /api/admin-password  { newPassword }  + admin auth → password badlein (data/admin.json)
import { isAdmin, setPassword } from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })
  const p = String(req.body?.newPassword || '')
  if (p.length < 8) return res.status(400).json({ error: 'min 8 characters' })
  setPassword(p)
  return res.status(200).json({ ok: true })
}
