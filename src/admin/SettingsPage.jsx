import { useState } from 'react'
import { adminSaveSettings } from '../api.js'

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
  const st = session.status || {}
  const set = (k) => (v) => setS({ ...s, [k]: v })

  async function save() {
    if (!/^\d{4}$/.test(String(s.demoOtpCode))) {
      flash('Demo code 4 digit ka hona chahiye')
      return
    }
    setBusy(true)
    const r = await adminSaveSettings(session.password, s, session.server)
    setBusy(false)
    if (r.ok) {
      onSaved(s)
      flash(r.local ? 'Save ho gaya (sirf is browser mein — local demo)' : 'Save ho gaya — sab kisanon par lagu')
    } else if (r.reason === 'no_store') {
      flash('Save nahi hua: Upstash Redis set nahi (README dekhein)')
    } else {
      flash('Save nahi hua, dobara try karein')
    }
  }

  return (
    <div className="panels" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <div className="panel">
        <h3>Login / OTP</h3>
        <Toggle
          label="WhatsApp par OTP bhejein"
          hint="Kisan ka number daalte hi WhatsApp par 4 digit code jaata hai"
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
          hint="Off ho to button dabane par 'code admin se lein' aata hai — aap khud logon ko code batayein"
          checked={s.showDemoCode}
          onChange={set('showDemoCode')}
        />
        <div><button type="button" className="btn" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save settings'}</button></div>
      </div>

      <div className="panel">
        <h3>Connection status</h3>
        <div className="src-row"><span>Server</span>{session.server ? <span className="tag ok">Connected</span> : <span className="tag review">Local demo</span>}</div>
        <div className="src-row"><span>WhatsApp Cloud API</span>{st.whatsappConfigured ? <span className="tag ok">Configured</span> : <span className="tag review">Not set</span>}</div>
        <div className="src-row"><span>Settings store (Upstash)</span>{st.storeAvailable ? <span className="tag ok">Connected</span> : <span className="tag review">Not set</span>}</div>
        <p className="muted" style={{ margin: 0 }}>
          WhatsApp ke liye Vercel env vars: <code>WHATSAPP_TOKEN</code>, <code>WHATSAPP_PHONE_ID</code>,{' '}
          <code>WHATSAPP_TEMPLATE</code>. Admin control save karne ke liye: <code>UPSTASH_REDIS_REST_URL</code>,{' '}
          <code>UPSTASH_REDIS_REST_TOKEN</code>. Tafseel README mein.
        </p>
      </div>
    </div>
  )
}
