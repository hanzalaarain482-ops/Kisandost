import { useEffect, useRef, useState } from 'react'
import Icon from '../icons.jsx'
import { Keypad, SpeakBtn, TopBar } from '../components.jsx'
import { say, vibrate } from '../speak.js'
import { otpSend, otpVerify } from '../api.js'

// Login: mobile number → WhatsApp par 4 digit code → login.
// Code na aaye to (agar admin ne on kiya ho) demo code se login.

function formatPhone(d) {
  if (!d) return null
  return d.length <= 4 ? d : d.slice(0, 4) + ' ' + d.slice(4)
}

const RESEND_AFTER = 30

export default function Login({ onBack, onLogin }) {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [wrong, setWrong] = useState(false)
  const [busy, setBusy] = useState(false)
  const [send, setSend] = useState(null) // otpSend ka jawab
  const [wait, setWait] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    if (step === 'phone') say('enter_phone')
  }, [step])

  useEffect(() => () => clearInterval(timer.current), [])

  function startTimer() {
    clearInterval(timer.current)
    setWait(RESEND_AFTER)
    timer.current = setInterval(() => {
      setWait((w) => {
        if (w <= 1) clearInterval(timer.current)
        return Math.max(0, w - 1)
      })
    }, 1000)
  }

  const phoneOk = /^03\d{9}$/.test(phone)

  async function requestCode() {
    vibrate()
    setBusy(true)
    const r = await otpSend(phone)
    setBusy(false)
    setSend(r)
    setOtp('')
    setWrong(false)
    setStep('otp')
    startTimer()
    say(r.sent ? 'whatsapp_sent' : 'whatsapp_failed')
  }

  async function verify(code) {
    setBusy(true)
    const r = await otpVerify(phone, code, send?.token)
    setBusy(false)
    if (r.ok) {
      vibrate(60)
      say('login_ok')
      setTimeout(() => onLogin(phone, r.session, r.via), 300)
    } else {
      vibrate(200)
      setWrong(true)
      say('wrong_code')
      setTimeout(() => setOtp(''), 700)
    }
  }

  function addDigit(d) {
    if (busy) return
    if (step === 'phone') {
      if (phone.length < 11) setPhone(phone + d)
      return
    }
    if (otp.length >= 4) return
    const next = otp + d
    setOtp(next)
    setWrong(false)
    if (next.length === 4) verify(next)
  }

  function erase() {
    if (step === 'phone') setPhone(phone.slice(0, -1))
    else setOtp(otp.slice(0, -1))
  }

  function useDemo() {
    vibrate()
    if (send?.demoCode) {
      say('demo_code_used')
      setOtp(send.demoCode)
      verify(send.demoCode)
    } else {
      say('ask_admin_code')
    }
  }

  // ---------------- Number ----------------
  if (step === 'phone') {
    return (
      <>
        <TopBar title="داخل ہوں" onBack={onBack} />
        <div className="screen">
          <div className="login-hero">
            <span className="wa-badge"><Icon name="chat" size={30} /></span>
            <span>کوڈ آپ کے <b>واٹس ایپ</b> پر آئے گا</span>
          </div>

          <div className="prompt">
            <Icon name="phone" size={30} color="var(--green)" />
            <span>اپنا موبائل نمبر</span>
            <SpeakBtn id="enter_phone" />
          </div>

          <div className="phone-display" aria-live="polite">
            {phone ? formatPhone(phone) : <span className="ph">03XX XXXXXXX</span>}
          </div>

          <Keypad onDigit={addDigit} onErase={erase} />

          <button type="button" className="big-btn wa" disabled={!phoneOk || busy} onClick={requestCode}>
            {busy ? <span className="spinner small" /> : <Icon name="chat" size={28} />}
            واٹس ایپ پر کوڈ منگوائیں
          </button>
        </div>
      </>
    )
  }

  // ---------------- Code ----------------
  return (
    <>
      <TopBar title="کوڈ لکھیں" onBack={() => { setOtp(''); setStep('phone') }} />
      <div className="screen">
        <div className={'status-card ' + (send?.sent ? 'ok' : 'warn')}>
          <span className="wa-badge" style={send?.sent ? undefined : { background: 'var(--wheat)' }}>
            <Icon name={send?.sent ? 'chat' : 'alert'} size={26} />
          </span>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {send?.sent ? 'کوڈ واٹس ایپ پر بھیج دیا گیا' : 'واٹس ایپ پر کوڈ نہیں جا سکا'}
            <small dir="ltr" style={{ textAlign: 'right' }}>{formatPhone(phone)}</small>
          </span>
          <SpeakBtn id={send?.sent ? 'whatsapp_sent' : 'whatsapp_failed'} />
        </div>

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

        {wrong && <p className="hint" style={{ color: 'var(--red)', fontWeight: 700 }}>کوڈ غلط ہے</p>}
        {busy && <p className="hint">چیک ہو رہا ہے…</p>}

        <Keypad onDigit={addDigit} onErase={erase} />

        <div className="login-actions">
          {send?.demoAllowed && (
            <button type="button" className="demo-btn" onClick={useDemo}>
              <Icon name="check" size={22} />
              کوڈ نہیں آیا؟ ڈیمو کوڈ لگائیں
              {send.demoCode && <b dir="ltr">{send.demoCode}</b>}
            </button>
          )}
          {send?.demoAllowed && !send.demoCode && <p className="hint">ڈیمو کوڈ ایڈمن سے لیں</p>}

          <button type="button" className="link-btn" disabled={wait > 0 || busy} onClick={requestCode}>
            {wait > 0 ? `دوبارہ بھیجیں (${wait})` : 'کوڈ دوبارہ بھیجیں'}
          </button>
        </div>
      </div>
    </>
  )
}
