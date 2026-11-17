// GET  /api/settings                → public settings (kisan app ke liye)
// GET  /api/settings  + admin auth  → poori settings (admin panel)
// POST /api/settings  + admin auth  → save
// Admin auth: header  Authorization: Bearer <ADMIN_PASSWORD>
import { getSettings, isAdmin, saveSettings, storeAvailable, whatsappConfigured } from './_lib.js'

export default async function handler(req, res) {
  const s = await getSettings()
  const admin = isAdmin(req)

  if (req.method === 'GET') {
    if (admin) {
      return res.status(200).json({
        admin: true,
        settings: s,
        status: { whatsappConfigured: whatsappConfigured(), storeAvailable: storeAvailable() },
      })
    }
    if (req.headers.authorization) return res.status(401).json({ admin: false })
    return res.status(200).json({
      demoAllowed: s.demoOtpEnabled,
      demoCode: s.demoOtpEnabled && s.showDemoCode ? s.demoOtpCode : null,
    })
  }

  if (req.method === 'POST') {
    if (!admin) return res.status(401).json({ error: 'unauthorized' })
    const b = req.body || {}
    const next = {
      ...s,
      whatsappOtp: !!b.whatsappOtp,
      demoOtpEnabled: !!b.demoOtpEnabled,
      showDemoCode: !!b.showDemoCode,
      demoOtpCode: /^\d{4}$/.test(String(b.demoOtpCode)) ? String(b.demoOtpCode) : s.demoOtpCode,
    }
    const saved = await saveSettings(next)
    if (!saved) return res.status(503).json({ error: 'no_store', settings: next })
    return res.status(200).json({ ok: true, settings: next })
  }

  return res.status(405).json({ error: 'method' })
}
