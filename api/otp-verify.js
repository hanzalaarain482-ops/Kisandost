// POST /api/otp-verify  { phone, code, token }
// Sahi WhatsApp code YA (admin ne allow kiya ho to) demo code → login
import { checkOtpToken, getSettings, makeSession, normalizePhone } from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const phone = normalizePhone(req.body?.phone)
  const code = String(req.body?.code || '')
  const token = String(req.body?.token || '')
  if (!phone || !/^\d{4}$/.test(code)) return res.status(400).json({ ok: false })

  if (token && checkOtpToken(token, phone, code)) {
    return res.status(200).json({ ok: true, via: 'whatsapp', session: makeSession(phone) })
  }

  const s = await getSettings()
  if (s.demoOtpEnabled && code === String(s.demoOtpCode)) {
    return res.status(200).json({ ok: true, via: 'demo', session: makeSession(phone) })
  }

  return res.status(200).json({ ok: false })
}
