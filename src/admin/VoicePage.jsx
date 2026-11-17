import { useEffect, useRef, useState } from 'react'
import { ALL_PHRASES } from '../phrases.js'
import { loadManifest, say, speak } from '../speak.js'

// Admin yahan har paighaam apni awaaz mein record kar sakta hai.
// Recording download hoti hai → `public/audio/ur/` mein daalein → `npm run audio:manifest`.
// (Database lagne ke baad yeh seedha server par upload hogi.)

function csvForVoiceArtist() {
  const rows = [['file_name', 'text_to_read']]
  for (const [id, text] of Object.entries(ALL_PHRASES)) rows.push([id + '.mp3', text])
  return rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n')
}

export default function VoicePage({ flash }) {
  const [manifest, setManifest] = useState({})
  const [recId, setRecId] = useState(null)
  const [clips, setClips] = useState({})
  const recRef = useRef(null)
  const chunks = useRef([])

  useEffect(() => {
    loadManifest().then((m) => setManifest(m || {}))
  }, [])

  async function start(id) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunks.current = []
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' })
        setClips((c) => ({ ...c, [id]: { url: URL.createObjectURL(blob), type: blob.type } }))
        setRecId(null)
      }
      recRef.current = rec
      rec.start()
      setRecId(id)
    } catch {
      flash('Mic ki ijazat nahi mili. Browser settings mein mic allow karein.')
    }
  }

  function stop() {
    recRef.current?.stop()
  }

  const entries = Object.entries(ALL_PHRASES)
  const done = entries.filter(([id]) => manifest.ur?.[id]).length
  const csvHref = 'data:text/csv;charset=utf-8,﻿' + encodeURIComponent(csvForVoiceArtist())

  return (
    <div className="panel">
      <h3>Voice recordings — {done}/{entries.length} recorded</h3>
      <p className="muted" style={{ margin: 0 }}>
        Jis paighaam ki recording ho, app wohi chalati hai. Na ho to phone ki machine awaaz bolti hai.
        Record → Download → file ko <code>public/audio/ur/</code> mein daalein → <code>npm run audio:manifest</code>.
      </p>
      <div>
        <a className="btn" href={csvHref} download="kisan-dost-voice-script.csv" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Voice artist ke liye script (CSV) download
        </a>
      </div>
      <div className="table-box">
        <table>
          <thead>
            <tr><th>ID</th><th style={{ textAlign: 'right' }}>Paighaam (Urdu)</th><th>Status</th><th>Sunein</th><th>Record</th></tr>
          </thead>
          <tbody>
            {entries.map(([id, text]) => {
              const clip = clips[id]
              const ext = clip?.type?.includes('mp4') ? 'm4a' : clip?.type?.includes('ogg') ? 'ogg' : 'webm'
              return (
                <tr key={id}>
                  <td><code>{id}</code></td>
                  <td className="urdu" style={{ whiteSpace: 'normal', minWidth: 260, maxWidth: 420 }}>{text}</td>
                  <td>
                    {manifest.ur?.[id]
                      ? <span className="tag ok">Recorded</span>
                      : <span className="tag review">Machine voice</span>}
                  </td>
                  <td>
                    <button type="button" className="btn" onClick={() => say(id)}>▶ App</button>{' '}
                    <button type="button" className="btn" style={{ background: '#56615a' }} onClick={() => speak(text)}>TTS</button>
                  </td>
                  <td>
                    {recId === id ? (
                      <button type="button" className="btn rec" onClick={stop}>■ Stop</button>
                    ) : (
                      <button type="button" className="btn rec" disabled={!!recId} onClick={() => start(id)}>● Record</button>
                    )}
                    {clip && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
                        <audio controls src={clip.url} />
                        <a href={clip.url} download={`${id}.${ext}`}>Download</a>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
