import { useState } from 'react'
import { adminLogin } from '../api.js'

// Server par: Vercel env var ADMIN_PASSWORD wala password.
// Local (npm run dev, server nahi): demo password `admin123`.
export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const r = await adminLogin(password)
    setBusy(false)
    if (r.ok) onLogin({ password, server: r.server, settings: r.settings, status: r.status })
    else setErr('Password ghalat hai')
  }

  return (
    <div className="admin">
      <form className="admin-login" onSubmit={submit}>
        <div className="admin-logo">KD</div>
        <h1>Kisan Dost · Admin</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
          Live site: Vercel mein rakha <code>ADMIN_PASSWORD</code>. Local demo: <code>admin123</code>
        </p>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {err && <p className="err">{err}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Checking…' : 'Login'}</button>
        <a href="#" style={{ fontSize: 14, color: 'var(--green)' }}>← Farmer app par wapas</a>
      </form>
    </div>
  )
}
