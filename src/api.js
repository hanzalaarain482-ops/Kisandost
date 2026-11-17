// Server se baat. Agar server na mile (jaise `npm run dev` mein), to
// app "offline demo" mode mein chalti hai aur settings isi browser mein rehti hain.

const LOCAL_KEY = 'kd_settings_local'
const LOCAL_DEFAULT = { whatsappOtp: true, demoOtpEnabled: true, demoOtpCode: '1234', showDemoCode: true }

function localSettings() {
  try {
    return { ...LOCAL_DEFAULT, ...JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') }
  } catch {
    return { ...LOCAL_DEFAULT }
  }
}

async function call(path, { method = 'GET', body, auth } = {}) {
  const r = await fetch(path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(auth ? { Authorization: 'Bearer ' + auth } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const isJson = (r.headers.get('content-type') || '').includes('json')
  if (!isJson) throw new Error('no-server')
  return { status: r.status, data: await r.json() }
}

// ---------- OTP ----------
export async function otpSend(phone) {
  try {
    const { status, data } = await call('/api/otp-send', { method: 'POST', body: { phone } })
    if (status === 200) return { ...data, server: true }
    return { sent: false, error: true, server: true }
  } catch {
    const s = localSettings()
    return {
      sent: false,
      reason: 'offline',
      server: false,
      demoAllowed: s.demoOtpEnabled,
      demoCode: s.demoOtpEnabled && s.showDemoCode ? s.demoOtpCode : null,
    }
  }
}

export async function otpVerify(phone, code, token) {
  try {
    const { data } = await call('/api/otp-verify', { method: 'POST', body: { phone, code, token } })
    return data
  } catch {
    const s = localSettings()
    const ok = s.demoOtpEnabled && code === s.demoOtpCode
    return { ok, via: ok ? 'demo' : null, session: ok ? 'local-demo' : null }
  }
}

// ---------- Admin ----------
export async function adminLogin(password) {
  try {
    const { status, data } = await call('/api/settings', { auth: password })
    if (status === 200 && data.admin) return { ok: true, server: true, ...data }
    return { ok: false, server: true }
  } catch {
    // Server nahi (local/dev): demo password
    if (password === 'admin123') {
      return {
        ok: true,
        server: false,
        settings: localSettings(),
        status: { whatsappConfigured: false, storeAvailable: false },
      }
    }
    return { ok: false, server: false }
  }
}

export async function adminSaveSettings(password, settings, server) {
  if (!server) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(settings))
    } catch {
      /* ignore */
    }
    return { ok: true, local: true }
  }
  try {
    const { status, data } = await call('/api/settings', { method: 'POST', body: settings, auth: password })
    if (status === 200) return { ok: true }
    return { ok: false, reason: data.error }
  } catch {
    return { ok: false, reason: 'network' }
  }
}
