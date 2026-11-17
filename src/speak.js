// Bol kar sunana (Text-to-Speech). Browser ki apni awaaz use hoti hai.
// Android par Google TTS mein Urdu awaaz hoti hai. Agar na mile to app chup rehti hai, crash nahi hoti.

let urduVoice = null

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

export function speak(text) {
  try {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = urduVoice?.lang || 'ur-PK'
    if (urduVoice) u.voice = urduVoice
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  } catch {
    /* awaaz available nahi */
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}

export function vibrate(ms = 30) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* ignore */
  }
}
