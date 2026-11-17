// Google Cloud Text-to-Speech se saare paighaam ki MP3 bana deta hai.
// 1) Google Cloud mein "Text-to-Speech API" enable karein, API key banayein
// 2) GOOGLE_TTS_KEY=xxxx npm run audio:google
//    (optional) GOOGLE_TTS_VOICE=ur-IN-Chirp3-HD-...  — voices ki list Google docs mein
// Pehle se bani files dobara nahi banti (OVERWRITE=1 se ban jaati hain).
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { ALL_PHRASES } from '../src/phrases.js'

const key = process.env.GOOGLE_TTS_KEY
if (!key) {
  console.error('GOOGLE_TTS_KEY set karein')
  process.exit(1)
}
const voice = { languageCode: 'ur-IN' }
if (process.env.GOOGLE_TTS_VOICE) voice.name = process.env.GOOGLE_TTS_VOICE

const out = join(process.cwd(), 'public', 'audio', 'ur')
mkdirSync(out, { recursive: true })

let made = 0
for (const [id, text] of Object.entries(ALL_PHRASES)) {
  const file = join(out, id + '.mp3')
  if (existsSync(file) && !process.env.OVERWRITE) continue
  const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + key, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice,
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
    }),
  })
  if (!r.ok) {
    console.error(id, 'failed', r.status, await r.text())
    continue
  }
  const { audioContent } = await r.json()
  writeFileSync(file, Buffer.from(audioContent, 'base64'))
  made++
  console.log('✓', id)
}
console.log(`${made} MP3 bani. Ab: npm run audio:manifest`)
