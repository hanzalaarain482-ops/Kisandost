import { useCallback, useEffect, useState } from 'react'
import VoicePage from './VoicePage.jsx'
import LibraryPage from './LibraryPage.jsx'
import SettingsPage from './SettingsPage.jsx'
import ReviewPage from './ReviewPage.jsx'
import { labelName } from './labels.js'
import { loadScans, REVIEW_BELOW as REVIEW_P } from '../diagnose.js'
import { adminSaveRates, adminScans } from '../api.js'

const menu = ['Dashboard', 'Expert Review', 'Disease Library', 'Voice', 'Mandi Rates', 'Settings']
const REVIEW_BELOW = Math.round(REVIEW_P * 100)
const cropEn = { wheat: 'Wheat', cotton: 'Cotton', rice: 'Rice' }

export default function AdminDashboard({ rates, setRates, onLogout, session, setSession }) {
  const [page, setPage] = useState('Dashboard')
  const [toast, setToast] = useState('')
  const [draft, setDraft] = useState(() => Object.fromEntries(rates.map((r) => [r.id, r.price])))
  const [server, setServer] = useState(null) // { scans, farmersCount, labeledCount }

  const flash = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }, [])

  const refresh = useCallback(async () => {
    if (!session.server) return
    const data = await adminScans(session.password)
    if (data) setServer(data)
  }, [session])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Server ho to wahan ke scans, warna isi browser ke
  const scans = server
    ? server.scans
    : loadScans().map((s, i) => ({ ...s, id: 'local' + i, phone: null, photo: null }))

  async function saveRates() {
    const next = rates.map((r) => {
      const p = Number(draft[r.id]) || r.price
      return { ...r, price: p, change: p > r.price ? 'up' : p < r.price ? 'down' : 'same' }
    })
    if (session.server) {
      const ok = await adminSaveRates(session.password, next)
      if (!ok) return flash('Save nahi hua, dobara try karein')
    }
    setRates(next)
    flash(session.server ? 'Rates save — data/rates.json, sab kisanon ko nazar aayenge' : 'Rates save (sirf is browser mein)')
  }

  const pending = scans.filter((s) => s.review && !s.expertLabel)
  const byDisease = {}
  for (const s of scans) {
    const k = s.expertLabel || s.disease
    if (k && !k.startsWith('healthy')) byDisease[k] = (byDisease[k] || 0) + 1
  }
  const top = Object.entries(byDisease).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = Math.max(1, ...top.map((t) => t[1]))

  return (
    <div className="admin">
      <div className="admin-wrap">
        <nav className="admin-side" aria-label="Admin menu">
          <b>Kisan Dost · Admin</b>
          {menu.map((m) => (
            <button type="button" key={m} className={page === m ? 'on' : ''} onClick={() => setPage(m)}>
              {m}
              {m === 'Expert Review' && pending.length > 0 && (
                <span className="pill" style={{ marginLeft: 8 }}>{pending.length}</span>
              )}
            </button>
          ))}
          <button type="button" onClick={onLogout} style={{ marginTop: 'auto' }}>Logout</button>
          <a href="#" style={{ color: '#9fc1aa', fontSize: 13, padding: '10px 12px' }}>Open farmer app →</a>
        </nav>

        <main className="admin-main">
          <div className="admin-top">
            <h2>
              {page}{' '}
              <span className="pill">{session.server ? 'Server · data/ files' : 'Local demo · is browser mein'}</span>
            </h2>
            {session.server && <button type="button" className="btn" onClick={refresh}>↻ Refresh</button>}
          </div>

          {session.status?.passwordIsDefault && (
            <div className="warn-box">
              ⚠ Admin password abhi default (admin123) hai. <b>Settings</b> mein ja kar foran badlein.
            </div>
          )}

          {page === 'Dashboard' && (
            <>
              <div className="kpis">
                <div className="kpi"><small>Registered farmers</small><strong>{server ? server.farmersCount : '—'}</strong><em>login karne wale</em></div>
                <div className="kpi"><small>Total scans</small><strong>{scans.length}</strong><em>photos save</em></div>
                <div className="kpi"><small>Expert review pending</small><strong>{pending.length}</strong><em style={{ color: pending.length ? 'var(--red)' : undefined }}>photo dekh kar label lagayein</em></div>
                <div className="kpi"><small>Labeled photos (training)</small><strong>{server ? server.labeledCount : '—'}</strong><em>model training ke liye</em></div>
              </div>

              <div className="panels">
                <div className="panel">
                  <h3>Recent scans</h3>
                  {scans.length === 0 ? (
                    <p className="muted" style={{ margin: 0 }}>Abhi koi scan nahi. Farmer app mein photo check karein.</p>
                  ) : (
                    <div className="table-box">
                      <table>
                        <thead>
                          <tr><th></th><th>Time</th><th>Phone</th><th>Crop</th><th>Result</th><th>Conf.</th><th>Method</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {scans.slice(0, 12).map((s) => (
                            <tr key={s.id}>
                              <td>{s.photo ? <img className="scan-thumb" src={s.photo} alt="" /> : null}</td>
                              <td>{new Date(s.at).toLocaleString()}</td>
                              <td>{s.phone ? '0' + s.phone.slice(2) : '—'}</td>
                              <td>{cropEn[s.crop] || '—'}</td>
                              <td>{labelName(s.expertLabel || s.disease)}</td>
                              <td>{s.confidence}%</td>
                              <td>{s.method === 'model' ? 'AI model' : 'Color'}</td>
                              <td>
                                {s.expertLabel ? (
                                  <span className="tag ok">Expert ✓</span>
                                ) : s.review || s.confidence < REVIEW_BELOW ? (
                                  <span className="tag review">Review</span>
                                ) : (
                                  <span className="tag ok">Auto</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="panel">
                  <h3>Sab se zyada mili bimariyan</h3>
                  {top.length === 0 && <p className="muted" style={{ margin: 0 }}>Abhi data nahi.</p>}
                  {top.map(([d, n]) => (
                    <div className="bar" key={d} style={{ gridTemplateColumns: '150px 1fr 40px' }}>
                      <span>{labelName(d)}</span>
                      <div style={{ width: (n / max) * 100 + '%' }} />
                      <span>{n}</span>
                    </div>
                  ))}
                </div>

                <div className="panel">
                  <h3>Data kahan save ho raha hai</h3>
                  <div className="src-row"><span>Storage</span><span className="tag ok">{session.server ? 'Files' : 'Browser (demo)'}</span></div>
                  {session.status?.dataDir && <div className="src-row"><span>Folder</span><code style={{ fontSize: 12 }}>{session.status.dataDir}</code></div>}
                  <div className="src-row"><span>Photo analyzer</span><span className="tag ok">Apna (phone par)</span></div>
                  <div className="src-row"><span>WhatsApp OTP</span>{session.status?.whatsappConfigured ? <span className="tag ok">On</span> : <span className="tag review">Keys baad mein</span>}</div>
                  <p className="muted" style={{ margin: 0 }}>
                    Files: settings.json, admin.json, rates.json, farmers.json, scans.json, labels.json, uploads/
                  </p>
                </div>
              </div>
            </>
          )}

          {page === 'Expert Review' && (
            <ReviewPage session={session} scans={scans} onChanged={refresh} flash={flash} />
          )}

          {page === 'Mandi Rates' && (
            <div className="panel" style={{ maxWidth: 640 }}>
              <h3>Aaj ke rates update karein (per 40 kg, Rs)</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                {session.server ? 'data/rates.json mein save hote hain — sab kisanon ko nazar aate hain.' : 'Local demo: sirf is browser mein.'}
              </p>
              <div className="table-box">
                <table>
                  <thead><tr><th>Crop</th><th>Current</th><th>New rate</th></tr></thead>
                  <tbody>
                    {rates.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontFamily: "'Noto Naskh Arabic'", fontSize: 16 }}>{r.emoji} {r.name}</td>
                        <td>{r.price.toLocaleString()}</td>
                        <td>
                          <input
                            className="rate"
                            type="number"
                            aria-label={'New rate for ' + r.id}
                            value={draft[r.id] ?? ''}
                            onChange={(e) => setDraft({ ...draft, [r.id]: e.target.value })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div><button type="button" className="btn" onClick={saveRates}>Save rates</button></div>
            </div>
          )}

          {page === 'Disease Library' && <LibraryPage />}
          {page === 'Voice' && <VoicePage flash={flash} />}
          {page === 'Settings' && (
            <SettingsPage
              session={session}
              flash={flash}
              onSaved={(patch) => setSession({ ...session, ...patch })}
            />
          )}
        </main>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
