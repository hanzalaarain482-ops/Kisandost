import { useState } from 'react'
import VoicePage from './VoicePage.jsx'
import LibraryPage from './LibraryPage.jsx'
import { loadScans, REVIEW_BELOW as REVIEW_P } from '../diagnose.js'

// DEMO data — asli data database se aayega
const demoScans = [
  { farmer: 'Rahim Khan', district: 'Sahiwal', crop: 'Wheat', result: 'Yellow Rust', conf: 92 },
  { farmer: 'Ghulam Abbas', district: 'Multan', crop: 'Cotton', result: 'Leaf Curl Virus', conf: 88 },
  { farmer: 'Bashir Ahmed', district: 'Okara', crop: 'Rice', result: 'Unclear', conf: 54 },
  { farmer: 'Nazir Hussain', district: 'Vehari', crop: 'Cotton', result: 'Whitefly damage', conf: 81 },
  { farmer: 'Asif Jutt', district: 'Faisalabad', crop: 'Wheat', result: 'Aphid', conf: 47 },
]
const districts = [
  ['Sahiwal', 184], ['Multan', 147], ['Okara', 109], ['Vehari', 82], ['Faisalabad', 60],
]
const sources = [
  ['Crop disease AI model', 'Model v1 · accuracy: [test karke likhein]', true],
  ['Mandi rates (govt data + local reporters)', 'Updated 08:30 today', true],
  ['Weather API (per district)', 'Every 3 hours', true],
  ['Expert review queue', '14 pending', false],
  ['Treatment library (expert verified)', '3 crops', true],
]

const menu = ['Dashboard', 'Expert Review', 'Disease Library', 'Voice', 'Mandi Rates', 'Farmers', 'Partners & Ads', 'Settings']
const REVIEW_BELOW = Math.round(REVIEW_P * 100) // is % se kam AI confidence → expert check karega
const cropEn = { wheat: 'Wheat', cotton: 'Cotton', rice: 'Rice' }

export default function AdminDashboard({ rates, setRates, onLogout }) {
  const [page, setPage] = useState('Dashboard')
  // Is phone/browser par kiye gaye asli scans + demo scans
  const scans = [
    ...loadScans().map((s) => ({
      farmer: 'Ye device · ' + new Date(s.at).toLocaleTimeString(),
      district: '—',
      crop: cropEn[s.crop] || s.crop,
      result: s.review ? (s.aiGuess || 'Unclear') : s.name,
      conf: s.confidence,
      review: s.review,
      mode: s.mode,
    })),
    ...demoScans,
  ].slice(0, 8)
  const [toast, setToast] = useState('')
  const [draft, setDraft] = useState(() => Object.fromEntries(rates.map((r) => [r.id, r.price])))

  function flash(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  function saveRates() {
    setRates(
      rates.map((r) => {
        const p = Number(draft[r.id]) || r.price
        return { ...r, price: p, change: p > r.price ? 'up' : p < r.price ? 'down' : 'same' }
      }),
    )
    flash('Rates save ho gaye — farmer app mein update ho gaye')
  }

  const max = Math.max(...districts.map((d) => d[1]))

  return (
    <div className="admin">
      <div className="admin-wrap">
        <nav className="admin-side" aria-label="Admin menu">
          <b>Kisan Dost · Admin</b>
          {menu.map((m) => (
            <button type="button" key={m} className={page === m ? 'on' : ''} onClick={() => setPage(m)}>
              {m}
            </button>
          ))}
          <button type="button" onClick={onLogout} style={{ marginTop: 'auto' }}>Logout</button>
          <a href="#" style={{ color: '#9fc1aa', fontSize: 13, padding: '10px 12px' }}>Open farmer app →</a>
        </nav>

        <main className="admin-main">
          <div className="admin-top">
            <h2>
              {page} <span className="pill">Demo data</span>
            </h2>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Punjab · Last 7 days</span>
          </div>

          {page === 'Dashboard' && (
            <>
              <div className="kpis">
                <div className="kpi"><small>Registered farmers</small><strong>12,480</strong><em>+640 this week</em></div>
                <div className="kpi"><small>Crop scans today</small><strong>1,932</strong><em>+12% vs yesterday</em></div>
                <div className="kpi"><small>Disease alerts active</small><strong>7</strong><em style={{ color: 'var(--red)' }}>2 new districts</em></div>
                <div className="kpi"><small>Premium subscribers</small><strong>318</strong><em>Rs 300/month</em></div>
              </div>

              <div className="panels">
                <div className="panel">
                  <h3>Recent scans</h3>
                  <div className="table-box">
                    <table>
                      <thead>
                        <tr><th>Farmer</th><th>District</th><th>Crop</th><th>AI result</th><th>Conf.</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {scans.map((s) => (
                          <tr key={s.farmer + s.result}>
                            <td>{s.farmer}</td><td>{s.district}</td><td>{s.crop}</td><td>{s.result}</td><td>{s.conf}%</td>
                            <td>
                              {s.review || s.conf < REVIEW_BELOW
                                ? <span className="tag review">Expert review</span>
                                : <span className="tag ok">Auto-sent</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="panel">
                  <h3>Disease reports by district</h3>
                  {districts.map(([d, n]) => (
                    <div className="bar" key={d}>
                      <span>{d}</span>
                      <div style={{ width: (n / max) * 100 + '%' }} />
                      <span>{n}</span>
                    </div>
                  ))}
                  <div className="notice">
                    <span>⚠ Yellow Rust spike in Sahiwal. Send a voice alert to farmers in this district?</span>
                    <button type="button" className="btn red" onClick={() => flash('Alert bhej diya gaya (demo)')}>Send alert</button>
                  </div>
                </div>

                <div className="panel">
                  <h3>Data sources</h3>
                  {sources.map(([name, info, ok]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, padding: '8px 0', borderBottom: '1px solid #f0eee7' }}>
                      <span>
                        <i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: ok ? '#2e9e5b' : 'var(--wheat)', marginRight: 8 }} />
                        {name}
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{info}</span>
                    </div>
                  ))}
                </div>

                <div className="panel">
                  <h3>Partners & revenue</h3>
                  <div className="table-box">
                    <table>
                      <thead><tr><th>Partner</th><th>Type</th><th>Impressions</th><th>Leads</th></tr></thead>
                      <tbody>
                        <tr><td>[Fertilizer company]</td><td>Sponsored tip</td><td>48,200</td><td>1,120</td></tr>
                        <tr><td>[Seed company]</td><td>Dealer listing</td><td>21,700</td><td>640</td></tr>
                        <tr><td>[Pesticide brand]</td><td>Treatment ad</td><td>33,900</td><td>870</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {page === 'Mandi Rates' && (
            <div className="panel" style={{ maxWidth: 640 }}>
              <h3>Aaj ke rates update karein (per 40 kg, Rs)</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                Save karte hi farmer app mein naye rates nazar aayenge (is demo mein isi browser mein).
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
                            value={draft[r.id]}
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

          {page === 'Expert Review' && (
            <div className="panel">
              <h3>Scans waiting for an expert (AI confidence below {REVIEW_BELOW}%)</h3>
              <div className="table-box">
                <table>
                  <thead><tr><th>Farmer</th><th>District</th><th>Crop</th><th>AI guess</th><th>Conf.</th><th></th></tr></thead>
                  <tbody>
                    {scans.filter((s) => s.review || s.conf < REVIEW_BELOW).map((s) => (
                      <tr key={s.farmer + s.result}>
                        <td>{s.farmer}</td><td>{s.district}</td><td>{s.crop}</td><td>{s.result}</td><td>{s.conf}%</td>
                        <td><button type="button" className="btn" onClick={() => flash('Expert ka jawab kisan ko bhej diya (demo)')}>Answer</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {page === 'Disease Library' && <LibraryPage />}

          {page === 'Voice' && <VoicePage flash={flash} />}

          {['Farmers', 'Partners & Ads', 'Settings'].includes(page) && (
            <div className="panel">
              <h3>{page}</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
                Yeh section backend (database) lagne ke baad banega.
              </p>
            </div>
          )}
        </main>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
