import Icon from './icons.jsx'
import { speak, vibrate } from './speak.js'

// Har jagah chhota speaker button: dabane par likha hua bol kar sunata hai
export function SpeakBtn({ text, label = 'سنیں', size = 26 }) {
  return (
    <button
      type="button"
      className="speak-btn"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        vibrate()
        speak(text)
      }}
    >
      <Icon name="speaker" size={size} />
    </button>
  )
}

export function TopBar({ title, onBack, speakText }) {
  return (
    <header className="topbar">
      {onBack && (
        <button type="button" className="round-btn" aria-label="واپس" onClick={onBack}>
          <Icon name="back" size={30} />
        </button>
      )}
      <h1>{title}</h1>
      {speakText && <SpeakBtn text={speakText} />}
    </header>
  )
}

export function Keypad({ onDigit, onErase }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  return (
    <div className="keypad">
      {keys.map((k) => (
        <button
          type="button"
          key={k}
          className="key"
          onClick={() => {
            vibrate(15)
            onDigit(k)
          }}
        >
          {k}
        </button>
      ))}
      <span />
      <button type="button" className="key" onClick={() => { vibrate(15); onDigit('0') }}>0</button>
      <button type="button" className="key" aria-label="مٹائیں" onClick={() => { vibrate(15); onErase() }}>
        <Icon name="erase" size={32} />
      </button>
    </div>
  )
}
