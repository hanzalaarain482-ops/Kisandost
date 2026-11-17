// =====================================================================
// PHOTO KA FAISLA — sab kuch phone par, kisi ki API nahi
//  1) Apna AI model (public/model) ho → us se bimari + fasal
//  2) Model na ho / yaqeen kam → rang ki jaanch (color.js) se "alamat" + mumkina bimariyan
// Har scan server par photo ke saath save hota hai (data/) → expert label → model training
// =====================================================================
import { DISEASES, HEALTHY, NO_LEAF, SYMPTOMS, candidatesFor } from './diseases.js'
import { analyzeColors, colorVerdict } from './analyzer/color.js'
import { predict } from './analyzer/model.js'

export const REVIEW_BELOW = 0.7 // is se kam yaqeen → expert review

// --- Local history (server na ho to admin isi browser mein dekh sake) ---
export function saveScanLocal(scan) {
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

// --- Server par photo + nateeja bhejna (training data) ---
export async function uploadScan(payload) {
  try {
    const r = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return r.ok && (r.headers.get('content-type') || '').includes('json')
  } catch {
    return false
  }
}

function fromModelLabel(label) {
  if (label.startsWith('healthy')) return { disease: HEALTHY, crop: label.split('_')[1] || null }
  const d = DISEASES.find((x) => x.id === label)
  return d ? { disease: d, crop: d.crop } : null
}

// crop = null → model fasal khud pehchane
export async function diagnose({ img, crop = null }) {
  // 1) Apna model
  let top = null
  try {
    const preds = await predict(img)
    top = preds?.[0] || null
  } catch {
    top = null
  }
  if (top && top.p >= REVIEW_BELOW) {
    const m = fromModelLabel(top.label)
    if (m && (!crop || !m.crop || m.crop === crop)) {
      return { method: 'model', disease: m.disease, crop: crop || m.crop, confidence: top.p, autoCrop: !crop }
    }
  }

  // 2) Rang ki jaanch
  const colors = analyzeColors(img)
  const v = colorVerdict(colors)
  const base = { method: 'color', colors, crop, autoCrop: false }

  if (v.symptom === 'no_leaf') return { ...base, disease: NO_LEAF, confidence: 0, retake: true }
  if (v.symptom === 'healthy') return { ...base, disease: HEALTHY, confidence: v.score }

  const sym = SYMPTOMS[v.symptom]
  return {
    ...base,
    disease: sym,
    candidates: candidatesFor(sym, crop),
    confidence: v.score,
    review: true, // rang ki jaanch hamesha expert bhi dekhe
    modelGuess: top ? top.label : null,
  }
}
