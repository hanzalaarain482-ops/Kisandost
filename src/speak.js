// =====================================================================
// AWAAZ (Voice)
// say(id)        → pehle recording (public/audio/<lang>/<id>.mp3|webm), warna TTS
// speak(text)    → seedha phone ki awaaz (jaise mandi ke badalte rates)
// Recordings ki list `public/audio/manifest.json` mein hoti hai
// (`npm run audio:manifest` khud bana deta hai).
// =====================================================================
import { ALL_PHRASES } from './phrases.js'

let urduVoice = null
let manifest = null
let current = null

function pickVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const voices = window.speechSynthesis.getVoices()
  urduVoice =
    voices.find((v) => v.lang?.toLowerCase().startsWith('ur')) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('hi')) ||
    null
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  pickVoice()
  window.speechSynthesis.onvoiceschanged = pickVoice
}

function lang() {
  try {
    return JSON.parse(localStorage.getItem('kd_lang') || '"ur"') || 'ur'
  } catch {
    return 'ur'
  }
}

export async function loadManifest() {
  if (manifest) return manifest
  try {
    const r = await fetch('./audio/manifest.json', { cache: 'no-cache' })
    manifest = r.ok ? await r.json() : {}
  } catch {
    manifest = {}
  }
  return manifest
}
loadManifest()

export function speak(text) {
  stopSpeaking()
  try {
    if (!window.speechSynthesis || !text) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = urduVoice?.lang || 'ur-PK'
    if (urduVoice) u.voice = urduVoice
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  } catch {
    /* awaaz available nahi */
  }
}

// Recording ho to woh, warna TTS. Pehle farmer ki zubaan, phir Urdu.
export function say(id, fallbackText) {
  const text = fallbackText || ALL_PHRASES[id] || ''
  const m = manifest || {}
  const l = lang()
  const file = m[l]?.[id] || m.ur?.[id]
  const folder = m[l]?.[id] ? l : 'ur'
  if (!file) {
    speak(text)
    return
  }
  stopSpeaking()
  try {
    const a = new Audio(`./audio/${folder}/${file}`)
    current = a
    a.onerror = () => speak(text)
    a.play().catch(() => speak(text))
  } catch {
    speak(text)
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
  if (current) {
    try {
      current.pause()
    } catch {
      /* ignore */
    }
    current = null
  }
}

export function vibrate(ms = 30) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* ignore */
  }
}
