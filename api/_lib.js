// Server ke shared helpers (`_` se shuru hone wali file route nahi banti)
import crypto from 'node:crypto'
import { readJson, update, writeJson } from './_store.js'

// ---------- Settings (admin control) — data/settings.json ----------
export const DEFAULT_SETTINGS = {
  whatsappOtp: true, // WhatsApp par OTP bhejna (keys lagne ke baad)
  demoOtpEnabled: true, // demo code chalega?
  demoOtpCode: '1234',
  showDemoCode: true, // kisan ko screen par dikhaye?
}

export async function getSettings() {
  return { ...DEFAULT_SETTINGS, ...readJson('settings.json', {}) }
}

export async function saveSettings(s) {
  writeJson('settings.json', s)
  return true
}

// ---------- Admin password — data/admin.json (hash, kabhi saaf text nahi) ----------
export const DEFAULT_ADMIN_PASSWORD = 'admin123'

function hashPassword(pass, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(pass), salt, 32).toString('hex')
  return { salt, hash }
}

function adminRecord() {
  const rec = readJson('admin.json', null)
  if (rec?.hash) return rec
  // Pehli dafa: env ADMIN_PASSWORD ya default
  const created = { ...hashPassword(process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD), isDefault: !process.env.ADMIN_PASSWORD }
  writeJson('admin.json', created)
  return created
}

export function checkPassword(pass) {
  const rec = adminRecord()
  const { hash } = hashPassword(pass || '', rec.salt)
  const a = Buffer.from(hash, 'hex')
  const b = Buffer.from(rec.hash, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function setPassword(pass) {
  writeJson('admin.json', { ...hashPassword(pass), isDefault: false, changedAt: new Date().toISOString() })
}

export function passwordIsDefault() {
  return !!adminRecord().isDefault
}

export function isAdmin(req) {
  const h = req.headers.authorization || ''
  const given = h.startsWith('Bearer ') ? h.slice(7) : ''
  return !!given && checkPassword(given)
}

// ---------- Signing (OTP token, photo links) ----------
function secret() {
  if (process.env.OTP_SECRET) return process.env.OTP_SECRET
  // Env na ho to ek random secret bana kar file mein rakh lete hain
  const rec = readJson('secret.json', null)
  if (rec?.secret) return rec.secret
  const s = crypto.randomBytes(32).toString('hex')
  writeJson('secret.json', { secret: s })
  return s
}
export const sign = (s) => crypto.createHmac('sha256', secret()).update(s).digest('hex')

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

export function photoSig(file) {
  return sign('photo|' + file).slice(0, 32)
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

export function newId() {
  return Date.now().toString(36) + crypto.randomBytes(4).toString('hex')
}

// ---------- Kisan record — data/farmers.json ----------
export function recordFarmer(phone, via) {
  return update('farmers.json', [], (list) => {
    const now = new Date().toISOString()
    const i = list.findIndex((f) => f.phone === phone)
    if (i >= 0) list[i] = { ...list[i], lastLogin: now, logins: (list[i].logins || 1) + 1, via }
    else list.push({ phone, firstLogin: now, lastLogin: now, logins: 1, via })
    return list
  })
}

// ---------- WhatsApp (keys baad mein env mein) ----------
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
