// Server ke shared helpers (Vercel: `_` se shuru hone wali file route nahi banti)
import crypto from 'node:crypto'

// ---------- Settings (admin control) ----------
// Admin panel se badalne wali settings. Upstash Redis (free) mein save hoti hain:
//   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
// Upstash na ho to env vars se default milte hain (tab admin se save nahi hota).
export const DEFAULT_SETTINGS = {
  whatsappOtp: true, // WhatsApp par OTP bhejna
  demoOtpEnabled: (process.env.DEMO_OTP_ENABLED ?? 'true') === 'true', // demo code chalega?
  demoOtpCode: process.env.DEMO_OTP_CODE || '1234',
  showDemoCode: (process.env.SHOW_DEMO_CODE ?? 'true') === 'true', // kisan ko screen par dikhaye?
}

const KEY = 'kd_settings'
const hasStore = () => !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

async function redis(cmd) {
  const r = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
  })
  if (!r.ok) throw new Error('store error ' + r.status)
  return (await r.json()).result
}

export async function getSettings() {
  if (!hasStore()) return { ...DEFAULT_SETTINGS }
  try {
    const raw = await redis(['GET', KEY])
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export async function saveSettings(s) {
  if (!hasStore()) return false
  await redis(['SET', KEY, JSON.stringify(s)])
  return true
}

export function storeAvailable() {
  return hasStore()
}

// ---------- Admin auth ----------
export function isAdmin(req) {
  const pass = process.env.ADMIN_PASSWORD
  if (!pass) return false
  const h = req.headers.authorization || ''
  const given = h.startsWith('Bearer ') ? h.slice(7) : ''
  const a = Buffer.from(given)
  const b = Buffer.from(pass)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// ---------- OTP (database ke baghair, signed token se) ----------
const secret = () => process.env.OTP_SECRET || 'change-me-in-vercel-env'
const sign = (s) => crypto.createHmac('sha256', secret()).update(s).digest('hex')

export function makeOtpToken(phone, code, minutes = 5) {
  const exp = Date.now() + minutes * 60 * 1000
  return Buffer.from(`${phone}|${exp}|${sign(`${phone}|${code}|${exp}`)}`).toString('base64url')
}

export function checkOtpToken(token, phone, code) {
  try {
    const [p, exp, mac] = Buffer.from(token, 'base64url').toString().split('|')
    if (p !== phone || Date.now() > Number(exp)) return false
    const good = sign(`${phone}|${code}|${exp}`)
    return mac.length === good.length && crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(good))
  } catch {
    return false
  }
}

export function makeSession(phone, days = 90) {
  const exp = Date.now() + days * 864e5
  return Buffer.from(`${phone}|${exp}|${sign(`session|${phone}|${exp}`)}`).toString('base64url')
}

// 03001234567 → 923001234567
export function normalizePhone(p = '') {
  const d = String(p).replace(/\D/g, '')
  if (/^03\d{9}$/.test(d)) return '92' + d.slice(1)
  if (/^923\d{9}$/.test(d)) return d
  return null
}

export function randomCode(len = 4) {
  return String(crypto.randomInt(0, 10 ** len)).padStart(len, '0')
}

export function whatsappConfigured() {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_TEMPLATE)
}

// WhatsApp Cloud API: "authentication" template (copy-code button)
export async function sendWhatsAppOtp(to, code) {
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0'
  const r = await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: process.env.WHATSAPP_TEMPLATE,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: code }] },
          { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
        ],
      },
    }),
  })
  if (!r.ok) throw new Error('whatsapp ' + r.status + ' ' + (await r.text()).slice(0, 200))
  return true
}
