// POST /api/otp-send  { phone: "03001234567" }
// → WhatsApp par 4 digit code bhejta hai, aur ek signed token wapas deta hai.
import {
  getSettings,
  makeOtpToken,
  normalizePhone,
  randomCode,
  sendWhatsAppOtp,
  whatsappConfigured,
} from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const phone = normalizePhone(req.body?.phone)
  if (!phone) return res.status(400).json({ error: 'invalid phone' })

  const s = await getSettings()
  const demo = {
    demoAllowed: s.demoOtpEnabled,
    demoCode: s.demoOtpEnabled && s.showDemoCode ? s.demoOtpCode : null,
  }

  if (!s.whatsappOtp || !whatsappConfigured()) {
    return res.status(200).json({ sent: false, reason: 'whatsapp_off', token: null, ...demo })
  }

  const code = randomCode(4)
  try {
    await sendWhatsAppOtp(phone, code)
    return res.status(200).json({ sent: true, channel: 'whatsapp', token: makeOtpToken(phone, code), ...demo })
  } catch (e) {
    console.error(e.message)
    return res.status(200).json({ sent: false, reason: 'whatsapp_error', token: null, ...demo })
  }
}
