import { useEffect, useRef, useState } from 'react'
import Icon from '../icons.jsx'
import { SpeakBtn, TopBar } from '../components.jsx'
import { say, vibrate } from '../speak.js'
import { HELPLINE } from '../data.js'
import { CROPS, typeLabel } from '../diseases.js'
import { preparePhoto } from '../imageTools.js'
import { diagnose, saveScan } from '../diagnose.js'

// Qadam: 1) fasal chunein  2) photo  3) quality check  4) AI  5) nateeja
export default function Scan({ onBack }) {
  const fileRef = useRef(null)
  const [crop, setCrop] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState(null)
  const [res, setRes] = useState(null)

  useEffect(() => {
    say('pick_crop')
  }, [])

  useEffect(() => () => photo && URL.revokeObjectURL(photo), [photo])

  function chooseCrop(c) {
    vibrate()
    setCrop(c)
    say('take_photo')
  }

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
    const out = await diagnose({ base64: prepared.base64, crop: crop.id })
    setBusy(false)
    setRes(out)
    vibrate(out.disease.severity === 'high' ? [100, 60, 100] : 60)
    say(out.review ? 'sent_to_expert' : out.disease.id)

    saveScan({
      at: new Date().toISOString(),
      crop: crop.id,
      disease: out.disease.id,
      name: out.disease.english,
      confidence: Math.round((out.confidence || 0) * 100),
      review: !!out.review,
      aiGuess: out.aiGuess || '',
      mode: out.mode,
    })
  }

  const d = res?.disease
  const tone = !d ? '' : d.id === 'healthy' ? 'good' : d.id === 'unknown' ? 'wait' : 'bad'

  return (
    <>
      <TopBar
        title={crop ? `${crop.name} چیک کریں` : 'فصل چیک کریں'}
        onBack={crop && !photo ? () => setCrop(null) : onBack}
        speakId={crop ? 'take_photo' : 'pick_crop'}
      />
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

        {/* 1. Fasal chunein */}
        {!crop && (
          <>
            <div className="prompt">
              <span>کون سی فصل ہے؟</span>
              <SpeakBtn id="pick_crop" />
            </div>
            <div className="crop-pick">
              {CROPS.map((c) => (
                <button type="button" key={c.id} className="crop-pick-btn" onClick={() => chooseCrop(c)}>
                  <span className="big-emoji" aria-hidden="true">{c.emoji}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 2. Photo lein */}
        {crop && !photo && (
          <>
            <div className="scan-area">
              <button type="button" className="shutter" aria-label="تصویر لیں" onClick={openCamera}>
                <Icon name="camera" size={70} />
              </button>
              <b style={{ fontSize: 28 }}>تصویر لیں</b>
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

        {/* 3. Photo kharab */}
        {problem && (
          <>
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
            <button type="button" className="big-btn" onClick={openCamera}>
              <Icon name="camera" size={30} />
              دوبارہ تصویر لیں
            </button>
          </>
        )}

        {/* 4. Nateeja */}
        {d && (
          <>
            <div className={'verdict ' + tone}>
              <span className="big-icon">
                <Icon name={tone === 'good' ? 'check' : tone === 'wait' ? 'user' : 'alert'} size={42} />
              </span>
              <div style={{ flex: 1 }}>
                <h2>{d.name}</h2>
                <small>
                  {d.english}
                  {res.confidence ? ` · ${Math.round(res.confidence * 100)}%` : ''}
                  {typeLabel[d.type] ? ` · ${typeLabel[d.type]}` : ''}
                </small>
              </div>
            </div>

            <button
              type="button"
              className="big-btn"
              onClick={() => say(res.review ? 'sent_to_expert' : d.id)}
            >
              <Icon name="speaker" size={32} />
              {tone === 'bad' ? 'علاج سنیں' : 'سنیں'}
            </button>

            {d.symptoms && (
              <div className="steps-card">
                <b style={{ fontSize: 20 }}>نشانیاں</b>
                <span style={{ fontSize: 20, lineHeight: 1.7 }}>{d.symptoms}</span>
              </div>
            )}

            <div className="steps-card">
              <b style={{ fontSize: 20 }}>{tone === 'bad' ? 'کیا کریں؟' : 'آگے کیا؟'}</b>
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

            {tone !== 'good' && (
              <a className="big-btn orange" href={'tel:' + HELPLINE.replace(/-/g, '')}>
                <Icon name="phone" size={30} />
                ماہر کو فون کریں
              </a>
            )}

            {res.mode === 'demo' && (
              <p className="hint">ڈیمو نتیجہ · اصلی AI کے لیے API key لگائیں</p>
            )}
          </>
        )}

        {(d || problem) && (
          <button
            type="button"
            className="big-btn secondary"
            onClick={() => {
              setPhoto(null)
              setRes(null)
              setProblem(null)
              openCamera()
            }}
          >
            <Icon name="camera" size={30} />
            نئی تصویر
          </button>
        )}
      </div>
    </>
  )
}
