// GET  /api/settings                → public settings (kisan app ke liye)
// GET  /api/settings  + admin auth  → poori settings + status (admin panel)
// POST /api/settings  + admin auth  → data/settings.json mein save
// Admin auth: header  Authorization: Bearer <admin password>
import { getSettings, isAdmin, passwordIsDefault, saveSettings, whatsappConfigured } from './_lib.js'
import { DATA_DIR } from './_store.js'

export default async function handler(req, res) {
  const s = await getSettings()
  const admin = isAdmin(req)

  if (req.method === 'GET') {
    if (admin) {
      return res.status(200).json({
        admin: true,
        settings: s,
        status: {
          whatsappConfigured: whatsappConfigured(),
          storage: 'files',
          dataDir: DATA_DIR,
          passwordIsDefault: passwordIsDefault(),
        },
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
    await saveSettings(next)
    return res.status(200).json({ ok: true, settings: next })
  }

  return res.status(405).json({ error: 'method' })
}
