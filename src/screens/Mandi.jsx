import { useEffect } from 'react'
import { TopBar } from '../components.jsx'
import { speak, vibrate } from '../speak.js'
import { crops, formatPrice } from '../data.js'

const trendWord = { up: 'بڑھ گیا', down: 'کم ہو گیا', same: 'وہی ہے' }
const arrow = { up: '↑', down: '↓', same: '–' }

export default function Mandi({ onBack, rates }) {
  const list = rates || crops

  useEffect(() => {
    speak('منڈی کے ریٹ۔ کسی بھی فصل کو دبائیں تو ریٹ سنیں')
  }, [])

  return (
    <>
      <TopBar title="منڈی ریٹ" onBack={onBack} speakText="منڈی کے ریٹ۔ کسی بھی فصل کو دبائیں تو ریٹ سنیں" />
      <div className="screen">
        <p className="hint">ساہیوال منڈی · فی 40 کلو · روپے</p>

        {list.map((c) => (
          <button
            type="button"
            key={c.id}
            className="crop-card"
            onClick={() => {
              vibrate()
              speak(`${c.name} کا ریٹ ${c.price} روپے ہے، ریٹ ${trendWord[c.change]}`)
            }}
          >
            <span className="crop-emoji" aria-hidden="true">{c.emoji}</span>
            <span className="info">
              <b>{c.name}</b>
              <small>{c.unit}</small>
            </span>
            <span className="price">{formatPrice(c.price)}</span>
            <span className={'trend ' + c.change} aria-label={trendWord[c.change]}>
              {arrow[c.change]}
            </span>
          </button>
        ))}

        <div className="legend">
          <span><i style={{ background: '#1f7a43' }} />بڑھا</span>
          <span><i style={{ background: 'var(--red)' }} />کم ہوا</span>
          <span><i style={{ background: '#8a948d' }} />وہی</span>
        </div>
      </div>
    </>
  )
}
