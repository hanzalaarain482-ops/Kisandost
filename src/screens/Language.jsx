import { useState } from 'react'
import Icon from '../icons.jsx'
import { say, vibrate } from '../speak.js'

const langs = [
  { id: 'ur', label: 'اردو', say: 'آپ نے اردو چنی ہے' },
  { id: 'pa', label: 'پنجابی', say: 'تسی پنجابی چنی اے' },
  { id: 'sk', label: 'سرائیکی', say: 'تساں سرائیکی چنی اے' },
]

export default function Language({ onDone }) {
  const [lang, setLang] = useState('ur')

  return (
    <div className="screen">
      <div className="hero">
        <div className="logo">
          <Icon name="leaf" size={64} />
        </div>
        <h2>کسان دوست</h2>
        <p>اپنی زبان چنیں</p>
      </div>

      {langs.map((l) => (
        <button
          type="button"
          key={l.id}
          className={'lang-btn' + (lang === l.id ? ' on' : '')}
          onClick={() => {
            vibrate()
            setLang(l.id)
            say('pick_language_' + l.id, l.say)
          }}
        >
          <span className="tick">{lang === l.id && <Icon name="check" size={24} />}</span>
          <span className="label">{l.label}</span>
          <Icon name="speaker" size={28} color="#56615a" />
        </button>
      ))}

      <div style={{ marginTop: 'auto' }}>
        <button
          type="button"
          className="big-btn"
          onClick={() => {
            vibrate()
            onDone(lang)
          }}
        >
          آگے چلیں
          <Icon name="back" size={30} style={{ transform: 'scaleX(-1)' }} />
        </button>
      </div>
    </div>
  )
}
