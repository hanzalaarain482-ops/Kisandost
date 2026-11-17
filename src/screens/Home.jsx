import { useEffect, useState } from 'react'
import Icon from '../icons.jsx'
import { SpeakBtn } from '../components.jsx'
import { say, speak, vibrate } from '../speak.js'
import { weather } from '../data.js'

// Awaaz se app chalana: kisan "mandi" ya "mausam" bole to woh screen khul jaaye
const voiceRoutes = [
  { go: 'mandi', words: ['منڈی', 'ریٹ', 'بھاؤ', 'قیمت', 'mandi', 'rate'] },
  { go: 'weather', words: ['موسم', 'بارش', 'دھوپ', 'mausam', 'weather'] },
  { go: 'scan', words: ['بیماری', 'تصویر', 'کیمرہ', 'فصل', 'camera'] },
  { go: 'help', words: ['مدد', 'فون', 'کال', 'ماہر', 'help'] },
]

export default function Home({ go, onLogout }) {
  const [listening, setListening] = useState(false)

  useEffect(() => {
    say('welcome')
  }, [])

  function listen() {
    vibrate()
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      say('use_buttons')
      return
    }
    try {
      const rec = new SR()
      rec.lang = 'ur-PK'
      rec.interimResults = false
      rec.onresult = (e) => {
        const said = e.results[0][0].transcript.toLowerCase()
        const match = voiceRoutes.find((r) => r.words.some((w) => said.includes(w)))
        if (match) go(match.go)
        else say('not_understood')
      }
      rec.onend = () => setListening(false)
      rec.onerror = () => setListening(false)
      setListening(true)
      rec.start()
    } catch {
      setListening(false)
    }
  }

  const tap = (screen, id) => () => {
    vibrate()
    say(id)
    go(screen)
  }

  return (
    <>
      <div className="home-head">
        <div className="row">
          <div className="avatar">
            <Icon name="user" size={34} />
          </div>
          <div className="hello">
            <small>السلام علیکم</small>
            <b>کسان دوست</b>
          </div>
          <button type="button" className="round-btn light" aria-label="باہر نکلیں" onClick={onLogout}>
            <Icon name="logout" size={26} />
          </button>
        </div>
        <button type="button" className="alert-strip" onClick={() => speak(weather.alert)}>
          <Icon name="rain" size={34} color="var(--sky)" />
          <span style={{ flex: 1 }}>{weather.alert}</span>
          <Icon name="speaker" size={26} />
        </button>
      </div>

      <div className="screen">
        <div className="tiles">
          <button type="button" className="tile green wide" onClick={tap('scan', 'nav_scan')}>
            <span className="icon-wrap">
              <Icon name="camera" size={50} />
            </span>
            <span className="label">
              فصل چیک کریں
              <small>پتے کی تصویر لیں</small>
            </span>
          </button>

          <button type="button" className="tile wheat" onClick={tap('mandi', 'nav_mandi')}>
            <span className="icon-wrap">
              <Icon name="chart" size={48} />
            </span>
            منڈی ریٹ
          </button>

          <button type="button" className="tile sky" onClick={tap('weather', 'nav_weather')}>
            <span className="icon-wrap">
              <Icon name="sun" size={48} />
            </span>
            موسم
          </button>

          <button type="button" className="tile clay wide" onClick={tap('help', 'nav_help')}>
            <span className="icon-wrap">
              <Icon name="phone" size={46} />
            </span>
            <span className="label">
              ماہر سے مدد
              <small>فون پر بات کریں</small>
            </span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, color: 'var(--muted)' }}>ہر بٹن پر</span>
          <SpeakBtn id="tap_speaker" size={22} />
          <span style={{ fontSize: 18, color: 'var(--muted)' }}>دبا کر سنیں</span>
        </div>
      </div>

      <button
        type="button"
        className={'mic-fab' + (listening ? ' listening' : '')}
        aria-label="بول کر پوچھیں"
        onClick={listen}
      >
        <Icon name="mic" size={44} />
      </button>
      <p className="mic-caption">{listening ? 'سن رہے ہیں…' : 'بول کر پوچھیں'}</p>
    </>
  )
}
