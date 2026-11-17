import { diseasesFor, matchDisease, HEALTHY, UNKNOWN } from './diseases.js'

export const REVIEW_BELOW = 0.7 // is se kam yaqeen → expert review

// Scans ki history (demo mein isi browser mein). Asli app mein database mein jaayegi.
export function saveScan(scan) {
  try {
    const all = JSON.parse(localStorage.getItem('kd_scans') || '[]')
    all.unshift(scan)
    localStorage.setItem('kd_scans', JSON.stringify(all.slice(0, 50)))
  } catch {
    /* ignore */
  }
}
export function loadScans() {
  try {
    return JSON.parse(localStorage.getItem('kd_scans') || '[]')
  } catch {
    return []
  }
}

function demoResult(crop) {
  // Demo: us fasal ki koi bimari, kabhi kabhi sehatmand ya "pata nahi"
  const list = diseasesFor(crop)
  const r = Math.random()
  if (r < 0.15) return { disease: HEALTHY, confidence: 0.93 }
  if (r < 0.25) return { disease: UNKNOWN, confidence: 0.48, review: true }
  const d = list[Math.floor(Math.random() * list.length)]
  return { disease: d, confidence: 0.78 + Math.random() * 0.18 }
}

export async function diagnose({ base64, crop }) {
  let api = null
  try {
    const r = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, crop }),
    })
    if (r.ok && (r.headers.get('content-type') || '').includes('json')) api = await r.json()
  } catch {
    api = null
  }

  // Server nahi mila ya key nahi lagi → demo
  if (!api || api.mode !== 'live') {
    await new Promise((res) => setTimeout(res, 1800))
    return { ...demoResult(crop), mode: 'demo' }
  }

  if (api.healthy === true) return { disease: HEALTHY, confidence: 0.9, mode: 'live' }

  const top = api.diseases?.[0]
  if (!top) return { disease: UNKNOWN, confidence: 0, review: true, mode: 'live' }

  const match = matchDisease(top.name, top.scientific, crop)
  if (!match || top.probability < REVIEW_BELOW) {
    return {
      disease: UNKNOWN,
      confidence: top.probability,
      review: true,
      aiGuess: top.name,
      mode: 'live',
    }
  }
  return { disease: match, confidence: top.probability, mode: 'live' }
}
