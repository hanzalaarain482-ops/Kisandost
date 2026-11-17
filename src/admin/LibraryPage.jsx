import { CROPS, DISEASES, typeLabel } from '../diseases.js'
import { say } from '../speak.js'

const sevTag = { high: ['red', 'High'], medium: ['review', 'Medium'] }

export default function LibraryPage() {
  const verified = DISEASES.filter((d) => d.verified).length
  return (
    <>
      <div className="panel">
        <h3>Bimariyon ki library — {DISEASES.length} entries, {verified} expert-verified</h3>
        <p className="muted" style={{ margin: 0 }}>
          File: <code>src/diseases.js</code>. Launch se pehle zarai expert har entry check kare, dawai ke local
          naam shamil kare, aur <code>verified: true</code> kare. AI ka English/scientific naam <code>keywords</code> se
          match hota hai.
        </p>
      </div>
      {CROPS.map((c) => (
        <div className="panel" key={c.id}>
          <h3>{c.emoji} <span className="urdu">{c.name}</span></h3>
          <div className="panels" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {DISEASES.filter((d) => d.crop === c.id).map((d) => (
              <div className="lib-card" key={d.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <b>{d.english}</b>
                  <span>
                    <span className={'tag ' + (sevTag[d.severity]?.[0] === 'red' ? 'review' : 'ok')}>
                      {sevTag[d.severity]?.[1] || d.severity}
                    </span>{' '}
                    {d.verified
                      ? <span className="tag ok">Verified</span>
                      : <span className="tag review">Not verified</span>}
                  </span>
                </div>
                <span className="muted"><i>{d.scientific}</i> · {d.type}</span>
                <div className="urdu"><b>{d.name}</b> ({typeLabel[d.type]}) — {d.symptoms}</div>
                <ol className="urdu" style={{ margin: 0, paddingRight: 20 }}>
                  {d.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                <div><button type="button" className="btn" onClick={() => say(d.id)}>▶ Awaaz sunein</button></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
