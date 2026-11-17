import { useEffect, useState } from 'react'
import Icon from '../icons.jsx'
import { Keypad, SpeakBtn, TopBar } from '../components.jsx'
import { say, vibrate } from '../speak.js'

// Login: sirf mobile number + 4 digit code. Naam ya password likhna nahi padta.
// DEMO: koi bhi number, code = 1234. Asli app mein Firebase Phone Auth SMS bhejega.
export const DEMO_OTP = '1234'

function formatPhone(d) {
  if (!d) return null
  return d.length <= 4 ? d : d.slice(0, 4) + ' ' + d.slice(4)
}

export default function Login({ onBack, onLogin }) {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [wrong, setWrong] = useState(false)

  useEffect(() => {
    say(step === 'phone' ? 'enter_phone' : 'enter_code')
  }, [step])

  const phoneOk = /^03\d{9}$/.test(phone)

  function addDigit(d) {
    if (step === 'phone') {
      if (phone.length < 11) setPhone(phone + d)
    } else {
      if (otp.length >= 4) return
      const next = otp + d
      setOtp(next)
      setWrong(false)
      if (next.length === 4) {
        if (next === DEMO_OTP) {
          vibrate(60)
          say('login_ok')
          setTimeout(() => onLogin(phone), 300)
        } else {
          vibrate(200)
          setWrong(true)
          say('wrong_code')
          setTimeout(() => setOtp(''), 600)
        }
      }
    }
  }

  function erase() {
    if (step === 'phone') setPhone(phone.slice(0, -1))
    else setOtp(otp.slice(0, -1))
  }

  if (step === 'phone') {
    return (
      <>
        <TopBar title="داخل ہوں" onBack={onBack} />
        <div className="screen">
          <div className="prompt">
            <Icon name="phone" size={34} color="var(--green)" />
            <span>اپنا موبائل نمبر</span>
            <SpeakBtn id="enter_phone" />
          </div>

          <div className="phone-display" aria-live="polite">
            {phone ? formatPhone(phone) : <span className="ph">03XX XXXXXXX</span>}
          </div>

          <Keypad onDigit={addDigit} onErase={erase} />

          <button
            type="button"
            className="big-btn"
            disabled={!phoneOk}
            onClick={() => {
              vibrate()
              setStep('otp')
            }}
          >
            کوڈ منگوائیں
            <Icon name="chat" size={28} />
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar
        title="کوڈ لکھیں"
        onBack={() => {
          setOtp('')
          setStep('phone')
        }}
      />
      <div className="screen">
        <div className="prompt">
          <Icon name="chat" size={34} color="var(--green)" />
          <span>فون پر آیا ہوا کوڈ</span>
          <SpeakBtn id="enter_code" />
        </div>
        <p className="hint" style={{ direction: 'ltr' }}>{formatPhone(phone)}</p>

        <div className="otp-boxes" aria-live="polite">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={'otp-box' + (i === otp.length ? ' active' : '')}
              style={wrong ? { borderColor: 'var(--red)', color: 'var(--red)' } : undefined}
            >
              {otp[i] || ''}
            </div>
          ))}
        </div>

        {wrong ? (
          <p className="hint" style={{ color: 'var(--red)', fontWeight: 700 }}>کوڈ غلط ہے</p>
        ) : (
          <p className="hint">ڈیمو کوڈ: 1234</p>
        )}

        <Keypad onDigit={addDigit} onErase={erase} />

        <button type="button" className="link-btn" onClick={() => say('code_resent')}>
          کوڈ دوبارہ بھیجیں
        </button>
      </div>
    </>
  )
}
