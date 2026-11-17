import { useState } from 'react'
import Icon from './icons.jsx'
import { say, vibrate } from './speak.js'

// Neeche wali patti: Home · Scan · [Mic] · Mandi · Madad
// Mic: kisan bole "mandi", "mausam", "bimari", "madad" → woh screen khul jaati hai

const voiceRoutes = [
  { go: 'mandi', words: ['منڈی', 'ریٹ', 'بھاؤ', 'قیمت', 'mandi', 'rate'] },
  { go: 'weather', words: ['موسم', 'بارش', 'دھوپ', 'mausam', 'weather'] },
  { go: 'scan', words: ['بیماری', 'تصویر', 'کیمرہ', 'فصل', 'camera'] },
  { go: 'help', words: ['مدد', 'فون', 'کال', 'ماہر', 'help'] },
  { go: 'home', words: ['گھر', 'ہوم', 'home'] },
]

const items = [
  { id: 'home', icon: 'home', label: 'ہوم', phrase: null },
  { id: 'scan', icon: 'camera', label: 'اسکین', phrase: 'nav_scan' },
  { id: 'mic' },
  { id: 'mandi', icon: 'chart', label: 'منڈی', phrase: 'nav_mandi' },
  { id: 'help', icon: 'phone', label: 'مدد', phrase: 'nav_help' },
]

export default function BottomNav({ active, go }) {
  const [listening, setListening] = useState(false)

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

  return (
    <nav className="bottom-nav" aria-label="مینو">
      {items.map((it) =>
        it.id === 'mic' ? (
          <button
            type="button"
            key="mic"
            className={'nav-mic' + (listening ? ' listening' : '')}
            aria-label="بول کر پوچھیں"
            onClick={listen}
          >
            <Icon name="mic" size={34} />
          </button>
        ) : (
          <button
            type="button"
            key={it.id}
            className={'nav-item' + (active === it.id ? ' on' : '')}
            aria-current={active === it.id ? 'page' : undefined}
            onClick={() => {
              vibrate()
              if (it.phrase) say(it.phrase)
              go(it.id)
            }}
          >
            <Icon name={it.icon} size={28} />
            <span>{it.label}</span>
          </button>
        ),
      )}
    </nav>
  )
}
