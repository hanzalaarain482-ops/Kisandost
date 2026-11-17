import { useEffect } from 'react'
import Icon from '../icons.jsx'
import { SpeakBtn } from '../components.jsx'
import { say, speak, vibrate } from '../speak.js'
import { weather } from '../data.js'

export default function Home({ go, onLogout }) {
  useEffect(() => {
    say('welcome')
  }, [])

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
            <Icon name="user" size={32} />
          </div>
          <div className="hello">
            <small>السلام علیکم</small>
            <b>کسان دوست</b>
          </div>
          <button type="button" className="weather-chip" onClick={tap('weather', 'nav_weather')} aria-label="موسم">
            <Icon name="sun" size={26} color="#ffd36b" />
            <b dir="ltr">{weather.today.temp}°</b>
          </button>
          <button type="button" className="round-btn light" aria-label="باہر نکلیں" onClick={onLogout}>
            <Icon name="logout" size={24} />
          </button>
        </div>
        <button type="button" className="alert-strip" onClick={() => speak(weather.alert)}>
          <Icon name="rain" size={32} color="var(--sky)" />
          <span style={{ flex: 1 }}>{weather.alert}</span>
          <Icon name="speaker" size={24} />
        </button>
      </div>

      <div className="screen">
        <button type="button" className="hero-scan" onClick={tap('scan', 'nav_scan')}>
          <span className="hero-scan-icon">
            <Icon name="camera" size={52} />
          </span>
          <span className="label">
            <b>فصل چیک کریں</b>
            <small>تصویر لیں — بیماری خود پہچانی جائے گی</small>
          </span>
          <Icon name="back" size={30} style={{ transform: 'scaleX(-1)', opacity: 0.8 }} />
        </button>

        <div className="tiles three">
          <button type="button" className="tile wheat" onClick={tap('mandi', 'nav_mandi')}>
            <span className="icon-wrap"><Icon name="chart" size={40} /></span>
            منڈی
          </button>
          <button type="button" className="tile sky" onClick={tap('weather', 'nav_weather')}>
            <span className="icon-wrap"><Icon name="sun" size={40} /></span>
            موسم
          </button>
          <button type="button" className="tile clay" onClick={tap('help', 'nav_help')}>
            <span className="icon-wrap"><Icon name="phone" size={38} /></span>
            مدد
          </button>
        </div>

        <div className="tip-card">
          <SpeakBtn id="tap_speaker" size={22} />
          <span>سپیکر کا نشان دبائیں تو سنیں · نیچے مائیک دبا کر بولیں</span>
        </div>
      </div>
    </>
  )
}
