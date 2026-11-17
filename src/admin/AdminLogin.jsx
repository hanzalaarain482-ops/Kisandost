import { useState } from 'react'

// DEMO login. Asli app mein Firebase Auth (email/password) use hoga.
const DEMO = { email: 'admin@kisandost.pk', password: 'admin123' }

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  function submit(e) {
    e.preventDefault()
    if (email.trim() === DEMO.email && password === DEMO.password) onLogin()
    else setErr('Email ya password ghalat hai')
  }

  return (
    <div className="admin">
      <form className="admin-login" onSubmit={submit}>
        <h1>Kisan Dost · Admin</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
          Demo: {DEMO.email} / {DEMO.password}
        </p>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {err && <p className="err">{err}</p>}
        <button type="submit">Login</button>
        <a href="#" style={{ fontSize: 14, color: 'var(--green)' }}>← Farmer app par wapas</a>
      </form>
    </div>
  )
}
