import { useEffect, useRef, useState } from 'react'
import Icon from '../icons.jsx'
import { TopBar } from '../components.jsx'
import { speak, vibrate } from '../speak.js'
import { demoResults, HELPLINE } from '../data.js'

// Photo lo → (demo) AI check → bada saaf nateeja + awaaz mein ilaaj
// Asli app: photo server par upload hogi, AI model (TensorFlow/Plant disease API) jawab dega.
export default function Scan({ onBack }) {
  const fileRef = useRef(null)
  const [photo, setPhoto] = useState(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    speak('بیمار پتے کے قریب جا کر تصویر لیں')
  }, [])

  useEffect(() => () => photo && URL.revokeObjectURL(photo), [photo])

  function readResult(r) {
    const text = r.sick
      ? `آپ کی فصل میں ${r.name} ہے۔ ` + r.steps.join('۔ ')
      : `${r.name}۔ ` + r.steps.join('۔ ')
    speak(text)
  }

  function onFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setPhoto(URL.createObjectURL(f))
    setResult(null)
    setBusy(true)
    speak('تصویر چیک ہو رہی ہے، انتظار کریں')
    setTimeout(() => {
      // DEMO: zyada tar bimari dikhata hai taake poora flow nazar aaye
      const r = Math.random() < 0.75 ? demoResults[0] : demoResults[1]
      setResult(r)
      setBusy(false)
      vibrate(r.sick ? [100, 60, 100] : 60)
      readResult(r)
    }, 2200)
    e.target.value = ''
  }

  const openCamera = () => {
    vibrate()
    fileRef.current?.click()
  }

  return (
    <>
      <TopBar title="فصل چیک کریں" onBack={onBack} speakText="بیمار پتے کے قریب جا کر تصویر لیں" />
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

        {result && (
          <>
            <div className={'verdict ' + (result.sick ? 'bad' : 'good')}>
              <span className="big-icon">
                <Icon name={result.sick ? 'alert' : 'check'} size={42} />
              </span>
              <div style={{ flex: 1 }}>
                <h2>{result.name}</h2>
                <small>
                  {result.english} · {result.confidence}%
                </small>
              </div>
            </div>

            <button type="button" className="big-btn" onClick={() => readResult(result)}>
              <Icon name="speaker" size={32} />
              علاج سنیں
            </button>

            <div className="steps-card">
              {result.steps.map((s, i) => (
                <div className="step" key={i}>
                  <span className="num">{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            {result.sick && (
              <a className="big-btn orange" href={'tel:' + HELPLINE.replace(/-/g, '')}>
                <Icon name="phone" size={30} />
                ماہر کو فون کریں
              </a>
            )}

            <button type="button" className="big-btn secondary" onClick={openCamera}>
              <Icon name="camera" size={30} />
              نئی تصویر
            </button>
          </>
        )}
      </div>
    </>
  )
}
