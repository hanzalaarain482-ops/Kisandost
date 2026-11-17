import { useState } from 'react'
import { adminLabel } from '../api.js'
import { CROPS, DISEASES } from '../diseases.js'
import { labelName } from './labels.js'

// Expert photo dekh kar sahi bimari chunta hai → data/labels.json
// Yahi labeled photos apna AI model train karne mein kaam aati hain (training/ folder).

const OPTIONS = [
  ...CROPS.map((c) => ({ id: 'healthy_' + c.id, label: `${c.name} — Healthy` })),
  ...DISEASES.map((d) => ({ id: d.id, label: `${CROPS.find((c) => c.id === d.crop)?.name} — ${d.english}` })),
]

export default function ReviewPage({ session, scans, onChanged, flash }) {
  const [filter, setFilter] = useState('pending')
  const [picked, setPicked] = useState({})

  if (!session.server) {
    return (
      <div className="panel">
        <h3>Expert Review</h3>
        <p className="muted" style={{ margin: 0 }}>
          Photos sirf server par save hoti hain. <code>npm start</code> wala server chala kar admin kholein.
        </p>
      </div>
    )
  }

  const list = scans.filter((s) =>
    filter === 'pending' ? s.review && !s.expertLabel : filter === 'done' ? s.expertLabel : true,
  )

  async function save(s) {
    const label = picked[s.id]
    if (!label) return flash('Pehle sahi bimari chunein')
    const ok = await adminLabel(session.password, s.id, label)
    if (ok) {
      flash('Label save — training data mein shamil')
      onChanged()
    } else flash('Save nahi hua')
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <h3 style={{ flex: 1 }}>Photo dekh kar sahi bimari chunein</h3>
        {['pending', 'done', 'all'].map((f) => (
          <button
            type="button"
            key={f}
            className="btn"
            style={filter === f ? undefined : { background: '#8a948d' }}
            onClick={() => setFilter(f)}
          >
            {f === 'pending' ? 'Pending' : f === 'done' ? 'Labeled' : 'All'}
          </button>
        ))}
      </div>
      {list.length === 0 && <p className="muted" style={{ margin: 0 }}>Koi photo nahi.</p>}
      {list.slice(0, 60).map((s) => (
        <div className="review-card" key={s.id}>
          {s.photo ? <img src={s.photo} alt="Kisan ki photo" /> : <div />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <span className="muted">
              {new Date(s.at).toLocaleString()} · {s.phone ? '0' + s.phone.slice(2) : 'no phone'} ·{' '}
              {s.method === 'model' ? 'AI model' : 'Color check'} · {s.confidence}%
            </span>
            <span>
              App ka jawab: <b>{labelName(s.disease)}</b>
              {s.expertLabel && <> · Expert: <b>{labelName(s.expertLabel)}</b></>}
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                value={picked[s.id] || s.expertLabel || ''}
                onChange={(e) => setPicked({ ...picked, [s.id]: e.target.value })}
                aria-label="Sahi bimari"
              >
                <option value="">— Sahi bimari chunein —</option>
                {OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              <button type="button" className="btn" onClick={() => save(s)}>Save label</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
