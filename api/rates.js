// GET  /api/rates                → mandi rates (data/rates.json); file na ho to { rates: null }
// POST /api/rates  + admin auth  → rates save
import { isAdmin } from './_lib.js'
import { readJson, writeJson } from './_store.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(readJson('rates.json', { rates: null, updatedAt: null }))
  }
  if (req.method === 'POST') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })
    const list = Array.isArray(req.body?.rates) ? req.body.rates : null
    if (!list) return res.status(400).json({ error: 'rates[] required' })
    const clean = list.slice(0, 50).map((r) => ({
      id: String(r.id).slice(0, 30),
      name: String(r.name).slice(0, 40),
      emoji: String(r.emoji || '').slice(0, 8),
      unit: String(r.unit || '40 کلو').slice(0, 20),
      price: Math.max(0, Math.round(Number(r.price) || 0)),
      change: ['up', 'down', 'same'].includes(r.change) ? r.change : 'same',
    }))
    const data = { rates: clean, updatedAt: new Date().toISOString() }
    writeJson('rates.json', data)
    return res.status(200).json({ ok: true, ...data })
  }
  return res.status(405).json({ error: 'method' })
}
