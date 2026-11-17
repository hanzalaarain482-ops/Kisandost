import { useState } from 'react'
import { adminChangePassword, adminSaveSettings } from '../api.js'

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span style={{ flex: 1 }}>
        <b>{label}</b>
        {hint && <span className="muted" style={{ display: 'block' }}>{hint}</span>}
      </span>
      <input type="checkbox" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export default function SettingsPage({ session, onSaved, flash }) {
  const [s, setS] = useState(session.settings)
  const [busy, setBusy] = useState(false)
  const [pw, setPw] = useState({ a: '', b: '' })
  const st = session.status || {}
  const set = (k) => (v) => setS({ ...s, [k]: v })

  async function save() {
    if (!/^\d{4}$/.test(String(s.demoOtpCode))) return flash('Demo code 4 digit ka hona chahiye')
    setBusy(true)
    const r = await adminSaveSettings(session.password, s, session.server)
    setBusy(false)
    if (r.ok) {
      onSaved({ settings: s })
      flash(r.local ? 'Save (sirf is browser mein — local demo)' : 'Save — data/settings.json, sab kisanon par lagu')
    } else flash('Save nahi hua, dobara try karein')
  }

  async function changePassword(e) {
    e.preventDefault()
    if (pw.a.length < 8) return flash('Password kam az kam 8 characters')
    if (pw.a !== pw.b) return flash('Dono password ek jaise nahi')
    const r = await adminChangePassword(session.password, pw.a)
    if (r.ok) {
      onSaved({ password: pw.a, status: { ...st, passwordIsDefault: false } })
      setPw({ a: '', b: '' })
      flash('Password badal gaya (data/admin.json)')
    } else flash('Password nahi badla: ' + (r.error || ''))
  }

  return (
    <div className="panels" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <div className="panel">
        <h3>Login / OTP</h3>
        <Toggle
          label="WhatsApp par OTP bhejein"
          hint="WhatsApp keys (env) lagne ke baad kaam karega"
          checked={s.whatsappOtp}
          onChange={set('whatsappOtp')}
        />
        <Toggle
          label="Demo code allow karein"
          hint="WhatsApp code na aaye to kisan demo code se login kar sake"
          checked={s.demoOtpEnabled}
          onChange={set('demoOtpEnabled')}
        />
        <label className="toggle-row">
          <span style={{ flex: 1 }}>
            <b>Demo code</b>
            <span className="muted" style={{ display: 'block' }}>4 digit</span>
          </span>
          <input
            className="rate"
            inputMode="numeric"
            maxLength={4}
            value={s.demoOtpCode}
            disabled={!s.demoOtpEnabled}
            onChange={(e) => set('demoOtpCode')(e.target.value.replace(/\D/g, '').slice(0, 4))}
            aria-label="Demo code"
          />
        </label>
        <Toggle
          label="Demo code kisan ko screen par dikhayein"
          hint="Off ho to 'code admin se lein' aata hai — aap khud logon ko code batayein"
          checked={s.showDemoCode}
          onChange={set('showDemoCode')}
        />
        <div><button type="button" className="btn" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save settings'}</button></div>
      </div>

      <div className="panel">
        <h3>Admin password</h3>
        {!session.server ? (
          <p className="muted" style={{ margin: 0 }}>Local demo mein password `admin123` hai. Server (`npm start`) par yahan se badal sakte hain.</p>
        ) : (
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {st.passwordIsDefault && <div className="warn-box">Abhi default password chal raha hai — badlein.</div>}
            <label className="muted">Naya password
              <input className="rate" style={{ width: '100%' }} type="password" autoComplete="new-password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} />
            </label>
            <label className="muted">Dobara likhein
              <input className="rate" style={{ width: '100%' }} type="password" autoComplete="new-password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} />
            </label>
            <div><button type="submit" className="btn">Password badlein</button></div>
          </form>
        )}
      </div>

      <div className="panel">
        <h3>Status</h3>
        <div className="src-row"><span>Server</span>{session.server ? <span className="tag ok">Connected</span> : <span className="tag review">Local demo</span>}</div>
        <div className="src-row"><span>Storage</span><span className="tag ok">{session.server ? 'Files (data/)' : 'Browser'}</span></div>
        {st.dataDir && <div className="src-row"><span>Folder</span><code style={{ fontSize: 12 }}>{st.dataDir}</code></div>}
        <div className="src-row"><span>WhatsApp Cloud API</span>{st.whatsappConfigured ? <span className="tag ok">Configured</span> : <span className="tag review">Keys baad mein</span>}</div>
        <p className="muted" style={{ margin: 0 }}>
          WhatsApp ke liye baad mein env: <code>WHATSAPP_TOKEN</code>, <code>WHATSAPP_PHONE_ID</code>, <code>WHATSAPP_TEMPLATE</code>.
        </p>
      </div>
    </div>
  )
}
