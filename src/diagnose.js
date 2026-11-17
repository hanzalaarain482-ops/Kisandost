import { CROPS, detectCrop, diseasesFor, genericDisease, matchDisease, HEALTHY, UNKNOWN } from './diseases.js'

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

function demoResult(chosenCrop) {
  // Demo: fasal khud "pehchani" jaati hai (random), phir us ki koi bimari
  const crop = chosenCrop || CROPS[Math.floor(Math.random() * CROPS.length)].id
  const list = diseasesFor(crop)
  const r = Math.random()
  if (r < 0.15) return { crop, disease: HEALTHY, confidence: 0.93 }
  if (r < 0.25) return { crop, disease: UNKNOWN, confidence: 0.48, review: true }
  const d = list[Math.floor(Math.random() * list.length)]
  return { crop, disease: d, confidence: 0.78 + Math.random() * 0.18 }
}

// crop = null → fasal bhi AI khud pehchane (auto)
export async function diagnose({ base64, crop = null }) {
  let api = null
  try {
    const r = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    })
    if (r.ok && (r.headers.get('content-type') || '').includes('json')) api = await r.json()
  } catch {
    api = null
  }

  // Server nahi mila ya key nahi lagi → demo
  if (!api || api.mode !== 'live') {
    await new Promise((res) => setTimeout(res, 1800))
    return { ...demoResult(crop), mode: 'demo', autoCrop: !crop }
  }

  // --- Asli AI ---
  const aiCrop = api.crops?.[0]
  const foundCrop = crop || detectCrop(aiCrop?.name)
  const base = { mode: 'live', crop: foundCrop, aiCropName: aiCrop?.name || '', autoCrop: !crop }

  if (api.healthy === true) return { ...base, disease: HEALTHY, confidence: 0.9 }

  const top = api.diseases?.[0]
  if (!top) return { ...base, disease: UNKNOWN, confidence: 0, review: true }

  if (top.probability < REVIEW_BELOW) {
    return { ...base, disease: UNKNOWN, confidence: top.probability, review: true, aiGuess: top.name }
  }

  const match = matchDisease(top.name, top.scientific, foundCrop)
  if (match) return { ...base, crop: foundCrop || match.crop, disease: match, confidence: top.probability }

  // Yaqeen zyada hai lekin bimari hamari library mein nahi → AI ka naam + expert
  return { ...base, disease: genericDisease(top.name), confidence: top.probability, review: true, aiGuess: top.name }
}
