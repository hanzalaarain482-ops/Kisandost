import { useEffect } from 'react'
import Icon from '../icons.jsx'
import { TopBar } from '../components.jsx'
import { speak } from '../speak.js'
import { HELPLINE } from '../data.js'

export default function Help({ onBack }) {
  const say = 'زرعی ماہر سے بات کرنے کے لیے نارنجی بٹن دبائیں۔ واٹس ایپ پر تصویر بھیجنے کے لیے سبز بٹن دبائیں'
  const num = HELPLINE.replace(/-/g, '')

  useEffect(() => {
    speak(say)
  }, [])

  return (
    <>
      <TopBar title="ماہر سے مدد" onBack={onBack} speakText={say} />
      <div className="screen">
        <div className="help-card">
          <div className="logo" style={{ width: 110, height: 110, background: 'var(--clay)' }}>
            <Icon name="user" size={58} />
          </div>
          <p>زرعی ماہر آپ کی فصل کے بارے میں فون پر بتائیں گے</p>
          <p style={{ fontSize: 17, color: 'var(--muted)' }}>صبح 9 سے شام 6 بجے تک</p>
        </div>

        <a className="big-btn orange" href={'tel:' + num}>
          <Icon name="phone" size={32} />
          فون کریں
        </a>

        <a className="big-btn" href={'https://wa.me/92' + num.slice(1)} target="_blank" rel="noreferrer">
          <Icon name="chat" size={32} />
          واٹس ایپ پر تصویر بھیجیں
        </a>
      </div>
    </>
  )
}
