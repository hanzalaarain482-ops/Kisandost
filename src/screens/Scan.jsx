import { useEffect, useRef, useState } from 'react'
import Icon from '../icons.jsx'
import { SpeakBtn, TopBar } from '../components.jsx'
import { say, speak, vibrate } from '../speak.js'
import { HELPLINE } from '../data.js'
import { CROPS, typeLabel } from '../diseases.js'
import { preparePhoto } from '../imageTools.js'
import { diagnose, saveScanLocal, uploadScan } from '../diagnose.js'

// Qadam: photo → quality check → apna analyzer (model ya rang) → nateeja → server par save
export default function Scan({ onBack }) {
  const fileRef = useRef(null)
  const [crop, setCrop] = useState(null) // null = khud pehchane
  const [photo, setPhoto] = useState(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState(null)
  const [res, setRes] = useState(null)

  useEffect(() => {
    say('auto_scan')
  }, [])

  useEffect(() => () => photo && URL.revokeObjectURL(photo), [photo])

  const openCamera = () => {
    vibrate()
    fileRef.current?.click()
  }

  async function onFile(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setRes(null)
    setProblem(null)

    let prepared
    try {
      prepared = await preparePhoto(f)
    } catch {
      say('photo_blurry')
      return
    }
    setPhoto(prepared.previewUrl)

    if (prepared.problem) {
      vibrate(200)
      setProblem(prepared.problem)
      say('photo_' + prepared.problem)
      return
    }

    setBusy(true)
    say('checking')
    const [out] = await Promise.all([
      diagnose({ img: prepared.img, crop: crop?.id || null }),
      new Promise((r) => setTimeout(r, 900)), // thoda ruk kar — kisan ko lage ke check hua
    ])
    setBusy(false)
    setRes(out)
    vibrate(out.disease.severity === 'high' ? [100, 60, 100] : 60)
    say(out.disease.id)

    if (out.retake) return
    const scan = {
      crop: out.crop || '',
      disease: out.disease.id,
      confidence: Math.round((out.confidence || 0) * 100),
      review: !!out.review,
      method: out.method,
    }
    let phone = ''
    try {
      phone = JSON.parse(localStorage.getItem('kd_user') || '{}')?.phone || ''
    } catch {
      /* ignore */
    }
    saveScanLocal({ ...scan, at: new Date().toISOString(), name: out.disease.english })
    uploadScan({ ...scan, image: prepared.base64, phone })
  }

  function reset() {
    setPhoto(null)
    setRes(null)
    setProblem(null)
    openCamera()
  }

  const d = res?.disease
  const cropInfo = res?.crop ? CROPS.find((c) => c.id === res.crop) : null
  const tone = !d
    ? ''
    : d.id === 'healthy'
      ? 'good'
      : d.type === 'unknown'
        ? 'wait'
        : d.type === 'symptom'
          ? 'warn'
          : 'bad'

  return (
    <>
      <TopBar title="فصل چیک کریں" onBack={onBack} speakId="auto_scan" />
      <div className="screen">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFile}
          style={{ display: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
        />

        {!photo && (
          <>
            <div className="scan-area">
              <button type="button" className="shutter" aria-label="تصویر لیں" onClick={openCamera}>
                <Icon name="camera" size={70} />
              </button>
              <b style={{ fontSize: 28 }}>تصویر لیں</b>
              <span className="auto-note">
                <Icon name="leaf" size={20} /> بیماری خود پہچانی جائے گی
              </span>
            </div>

            <p className="section-label" style={{ fontSize: 18, textAlign: 'center' }}>فصل بتائیں تو نتیجہ بہتر</p>
            <div className="crop-chips" role="group" aria-label="فصل">
              <button type="button" className={'chip' + (!crop ? ' on' : '')} onClick={() => setCrop(null)}>
                <Icon name="check" size={18} /> خود پہچانے
              </button>
              {CROPS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={'chip' + (crop?.id === c.id ? ' on' : '')}
                  onClick={() => {
                    vibrate()
                    setCrop(c)
                  }}
                >
                  <span aria-hidden="true">{c.emoji}</span> {c.name}
                </button>
              ))}
            </div>

            <div className="scan-steps">
              <div><b>1</b><Icon name="leaf" size={34} color="var(--green)" />بیمار پتا</div>
              <div><b>2</b><Icon name="sun" size={34} color="var(--wheat)" />روشنی میں</div>
              <div><b>3</b><Icon name="camera" size={34} color="var(--green)" />قریب سے</div>
            </div>
          </>
        )}

        {photo && (
          <div className="scan-area" style={{ borderStyle: 'solid', minHeight: 0 }}>
            <img src={photo} alt="آپ کی لی ہوئی تصویر" />
            {busy && (
              <div className="scanning">
                <div className="spinner" />
                چیک ہو رہا ہے…
              </div>
            )}
          </div>
        )}

        {problem && (
          <div className="verdict wait">
            <span className="big-icon"><Icon name="camera" size={40} /></span>
            <div style={{ flex: 1 }}>
              <h2>
                {problem === 'dark' && 'تصویر اندھیری ہے'}
                {problem === 'bright' && 'روشنی بہت زیادہ ہے'}
                {problem === 'blurry' && 'تصویر دھندلی ہے'}
              </h2>
              <small style={{ fontFamily: 'inherit', fontSize: 17 }}>دوبارہ تصویر لیں</small>
            </div>
            <SpeakBtn id={'photo_' + problem} />
          </div>
        )}

        {d && (
          <>
            {cropInfo && (
              <div className="detected">
                <span className="big-emoji small" aria-hidden="true">{cropInfo.emoji}</span>
                <span style={{ flex: 1 }}>
                  <small>{res.autoCrop ? 'پہچانی گئی فصل' : 'فصل'}</small>
                  <b>{cropInfo.name}</b>
                </span>
              </div>
            )}

            <div className={'verdict ' + tone}>
              <span className="big-icon">
                <Icon name={tone === 'good' ? 'check' : tone === 'wait' ? 'camera' : 'alert'} size={42} />
              </span>
              <div style={{ flex: 1 }}>
                <h2>{d.name}</h2>
                <small>
                  {d.english}
                  {res.confidence ? ` · ${Math.round(res.confidence * 100)}%` : ''}
                  {typeLabel[d.type] ? ` · ${typeLabel[d.type]}` : ''}
                </small>
              </div>
              <span className="method-tag">{res.method === 'model' ? 'AI' : 'رنگ'}</span>
            </div>

            {!res.retake && (
              <button type="button" className="big-btn" onClick={() => say(d.id)}>
                <Icon name="speaker" size={32} />
                {tone === 'bad' || tone === 'warn' ? 'علاج سنیں' : 'سنیں'}
              </button>
            )}

            {res.method === 'color' && res.colors && !res.retake && (
              <div className="steps-card">
                <b style={{ fontSize: 20 }}>پتے کی جانچ</b>
                <ColorBar label="ہرا (صحت مند)" value={res.colors.green} color="#2e8b4a" />
                <ColorBar label="پیلا" value={res.colors.yellow} color="#e2b21b" />
                <ColorBar label="بھورے دھبے" value={res.colors.brown} color="#7a4a1e" />
                <ColorBar label="نارنجی دانے" value={res.colors.rust} color="#d9661a" />
              </div>
            )}

            {d.symptoms && (
              <div className="steps-card">
                <b style={{ fontSize: 20 }}>نشانیاں</b>
                <span style={{ fontSize: 20, lineHeight: 1.7 }}>{d.symptoms}</span>
              </div>
            )}

            {res.candidates?.length > 0 && (
              <div className="steps-card">
                <b style={{ fontSize: 20 }}>ممکنہ بیماریاں</b>
                {res.candidates.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className="cand"
                    onClick={() => {
                      vibrate()
                      say(c.id)
                    }}
                  >
                    <span className="cand-emoji" aria-hidden="true">{CROPS.find((x) => x.id === c.crop)?.emoji}</span>
                    <span style={{ flex: 1 }}>
                      <b>{c.name}</b>
                      <small>{c.symptoms}</small>
                    </span>
                    <Icon name="speaker" size={24} />
                  </button>
                ))}
              </div>
            )}

            <div className="steps-card">
              <b style={{ fontSize: 20 }}>{tone === 'bad' || tone === 'warn' ? 'کیا کریں؟' : 'آگے کیا؟'}</b>
              {d.steps.map((s, i) => (
                <div className="step" key={i}>
                  <span className="num">{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            {d.prevention && (
              <div className="steps-card" style={{ background: 'var(--green-soft)' }}>
                <b style={{ fontSize: 20, color: 'var(--green)' }}>آئندہ بچاؤ</b>
                <span style={{ fontSize: 19, lineHeight: 1.7 }}>{d.prevention}</span>
              </div>
            )}

            {(tone === 'bad' || tone === 'warn') && (
              <a className="big-btn orange" href={'tel:' + HELPLINE.replace(/-/g, '')}>
                <Icon name="phone" size={30} />
                ماہر کو فون کریں
              </a>
            )}
          </>
        )}

        {(d || problem) && (
          <button type="button" className={'big-btn ' + (res?.retake || problem ? '' : 'secondary')} onClick={reset}>
            <Icon name="camera" size={30} />
            {res?.retake || problem ? 'دوبارہ تصویر لیں' : 'نئی تصویر'}
          </button>
        )}
      </div>
    </>
  )
}

function ColorBar({ label, value, color }) {
  const pct = Math.round((value || 0) * 100)
  return (
    <button type="button" className="cbar" onClick={() => speak(`${label} ${pct} فیصد`)}>
      <span className="cbar-label">{label}</span>
      <span className="cbar-track"><span style={{ width: Math.max(2, pct) + '%', background: color }} /></span>
      <span className="cbar-val" dir="ltr">{pct}%</span>
    </button>
  )
}
